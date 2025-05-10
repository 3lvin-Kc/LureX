
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
};

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const trackingId = url.searchParams.get("tid");
    const destination = url.searchParams.get("url");

    if (!trackingId) {
      throw new Error("Missing tracking ID");
    }

    // Find the tracking record
    const { data: trackingData, error: trackingError } = await supabase
      .from("email_tracking")
      .select("*")
      .eq("tracking_id", trackingId)
      .single();

    if (trackingError) {
      console.error("Error fetching tracking data:", trackingError);
      throw new Error("Failed to find tracking record");
    }

    // Get user info from headers for tracking
    const userAgent = req.headers.get("user-agent") || "";
    const ipAddress = req.headers.get("x-forwarded-for") || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";

    // Update clicked status
    const now = new Date().toISOString();
    const metadata = trackingData.metadata || {};
    
    const deviceInfo = {
      userAgent,
      timestamp: now,
      isMobile: /mobile/i.test(userAgent),
      isTablet: /tablet|ipad/i.test(userAgent),
      browser: determineBrowser(userAgent),
      os: determineOS(userAgent),
    };

    const { error: updateError } = await supabase
      .from("email_tracking")
      .update({
        clicked_at: trackingData.clicked_at ? trackingData.clicked_at : now,
        clicked_count: (trackingData.clicked_count || 0) + 1,
        metadata: {
          ...metadata,
          lastClick: now,
          clickDevices: [...(metadata.clickDevices || []), deviceInfo],
          ipAddress,
        }
      })
      .eq("tracking_id", trackingId);

    if (updateError) {
      console.error("Error updating tracking data:", updateError);
    }
    
    // Log the security event
    const { error: logError } = await supabase
      .from("security_logs")
      .insert({
        event_type: "phishing_page_access",
        message: "Phishing link clicked",
        user_id: null,
        user_agent: userAgent,
        ip_address: ipAddress,
        details: {
          trackingId,
          campaignId: trackingData.campaign_id,
          email: trackingData.email,
          clickTime: now
        },
        event_level: "info",
      });
    
    if (logError) {
      console.error("Error logging security event:", logError);
    }

    // If we have a destination URL, redirect there
    if (destination) {
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          Location: destination,
        },
      });
    }
    
    // If we have a phishing page ID in metadata, render that page
    const pageId = metadata.pageId;
    if (pageId) {
      // Fetch the phishing page
      const { data: page, error: pageError } = await supabase
        .from("phishing_pages")
        .select("*")
        .eq("id", pageId)
        .single();
        
      if (pageError) {
        console.error("Error fetching phishing page:", pageError);
        throw new Error("Failed to find phishing page");
      }
      
      // Process the HTML content to add tracking and disclaimers
      const processedHtml = await processPhishingPageHtml(page, trackingId, trackingData.campaign_id);
      
      // Return the HTML content
      return new Response(processedHtml, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html",
        },
      });
    }

    // Default to redirecting to home
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: "/",
      },
    });
  } catch (error) {
    console.error("Error in track-click function:", error);
    
    // Redirect to a default URL on error
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: "/",
      },
    });
  }
});

// Helper function to process phishing page HTML content
async function processPhishingPageHtml(
  page: any,
  trackingId: string,
  campaignId: string
): Promise<string> {
  // Base HTML content from the template
  let htmlContent = page.html_content || '';
  
  // Add tracking pixel for page view tracking
  const trackingPixel = `<img src="https://sfsloprgxcwjjzjiwkmc.supabase.co/functions/v1/track-open?tid=${encodeURIComponent(trackingId)}" width="1" height="1" alt="" style="position:absolute;visibility:hidden" />`;
  
  // Add simulation disclaimer at the bottom of the page
  const disclaimer = `
    <div style="position:fixed;bottom:0;left:0;right:0;background-color:#f8f9fa;padding:10px;text-align:center;font-size:12px;border-top:1px solid #dee2e6;color:#6c757d;">
      This is a security awareness training exercise. No actual data is being collected.
    </div>
  `;
  
  // Add the tracking pixel just before the closing body tag
  if (htmlContent.includes('</body>')) {
    htmlContent = htmlContent.replace('</body>', `${trackingPixel}${disclaimer}</body>`);
  } else {
    htmlContent = `${htmlContent}${trackingPixel}${disclaimer}`;
  }
  
  // Add form interception to capture submission without actually sending data
  const formInterceptScript = `
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        var forms = document.querySelectorAll('form');
        forms.forEach(function(form) {
          form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            var formData = {};
            var formElements = e.target.elements;
            for (var i = 0; i < formElements.length; i++) {
              if (formElements[i].name && formElements[i].value) {
                formData[formElements[i].name] = formElements[i].value;
              }
            }
            
            fetch('https://sfsloprgxcwjjzjiwkmc.supabase.co/functions/v1/track-submission', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                trackingId: '${trackingId}',
                pageId: '${page.id}',
                formData: formData
              })
            })
            .then(function() {
              // Redirect to training page or thank you page
              window.location.href = '/training?campaign=${encodeURIComponent(campaignId)}&tid=${encodeURIComponent(trackingId)}';
            })
            .catch(function() {
              // Still redirect even on error
              window.location.href = '/training?campaign=${encodeURIComponent(campaignId)}&tid=${encodeURIComponent(trackingId)}';
            });
          });
        });
      });
    </script>
  `;
  
  // Add the form intercept script just before the closing head tag
  if (htmlContent.includes('</head>')) {
    htmlContent = htmlContent.replace('</head>', `${formInterceptScript}</head>`);
  } else {
    // If no head tag, add it at the beginning
    htmlContent = `<head>${formInterceptScript}</head>${htmlContent}`;
  }
  
  // Add CSS if provided
  if (page.css_content) {
    const cssContent = `<style>${page.css_content}</style>`;
    if (htmlContent.includes('</head>')) {
      htmlContent = htmlContent.replace('</head>', `${cssContent}</head>`);
    } else if (htmlContent.includes('<head>')) {
      htmlContent = htmlContent.replace('<head>', `<head>${cssContent}`);
    } else {
      htmlContent = `<head>${cssContent}</head>${htmlContent}`;
    }
  }
  
  // Add JavaScript if provided (after forms are intercepted)
  if (page.js_content) {
    const jsContent = `<script>${page.js_content}</script>`;
    if (htmlContent.includes('</body>')) {
      htmlContent = htmlContent.replace('</body>', `${jsContent}</body>`);
    } else {
      htmlContent = `${htmlContent}${jsContent}`;
    }
  }
  
  return htmlContent;
}

// Helper functions to determine browser and OS
function determineBrowser(userAgent: string): string {
  if (/chrome/i.test(userAgent)) return 'Chrome';
  if (/firefox/i.test(userAgent)) return 'Firefox';
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return 'Safari';
  if (/edge|edg/i.test(userAgent)) return 'Edge';
  if (/opera|opr/i.test(userAgent)) return 'Opera';
  if (/msie|trident/i.test(userAgent)) return 'Internet Explorer';
  return 'Unknown';
}

function determineOS(userAgent: string): string {
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/macintosh|mac os/i.test(userAgent)) return 'macOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  if (/android/i.test(userAgent)) return 'Android';
  if (/iphone|ipad/i.test(userAgent)) return 'iOS';
  return 'Unknown';
}
