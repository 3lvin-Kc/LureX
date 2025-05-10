
import { supabase } from "@/integrations/supabase/client";
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";

/**
 * Service for managing phishing pages and simulations
 * Implements the simulation environment described in phishing.md
 */
export class PhishingPageService {
  private static instance: PhishingPageService;
  
  private constructor() {}
  
  public static getInstance(): PhishingPageService {
    if (!PhishingPageService.instance) {
      PhishingPageService.instance = new PhishingPageService();
    }
    return PhishingPageService.instance;
  }
  
  /**
   * Generate the complete HTML for a phishing page, including tracking
   * @param pageId The ID of the phishing page
   * @param trackingId The tracking ID for the visitor
   * @param campaignId The campaign ID
   * @returns Complete HTML with tracking and disclaimer
   */
  public async generatePhishingPageHtml(
    pageId: string,
    trackingId: string,
    campaignId: string
  ): Promise<string> {
    try {
      // Fetch the phishing page template
      const { data: page, error } = await supabase
        .from("phishing_pages")
        .select("*")
        .eq("id", pageId)
        .single();
      
      if (error) {
        throw error;
      }
      
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
                    pageId: '${pageId}',
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
      
      securityLogger.info(
        SecurityEventType.PHISHING_PAGE_ACCESS,
        "Generated phishing page HTML",
        { pageId, trackingId, campaignId }
      );
      
      return htmlContent;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.PHISHING_PAGE_ACCESS,
        "Failed to generate phishing page HTML",
        { error, pageId, trackingId }
      );
      
      // Return a minimal error page
      return `
        <html>
          <head><title>Training Exercise</title></head>
          <body>
            <h1>Training Exercise</h1>
            <p>This security training exercise encountered an error. Please contact your administrator.</p>
          </body>
        </html>
      `;
    }
  }
  
  /**
   * Create a training or awareness page after phishing simulation
   * @param campaignId The campaign ID
   * @param success Whether the user was phished successfully
   * @returns HTML content for the training page
   */
  public async generateTrainingPage(
    campaignId: string,
    success: boolean
  ): Promise<string> {
    try {
      // Fetch campaign details if available
      const { data: campaign } = await supabase
        .from("campaigns")
        .select(`
          *,
          template:template_id(*)
        `)
        .eq("id", campaignId)
        .single();
      
      // Default training content
      let title = success 
        ? "Security Awareness Training - Phishing Simulation" 
        : "Good job spotting the phishing attempt!";
      
      let content = success
        ? `
          <p>You have participated in a phishing simulation exercise conducted by your organization.</p>
          <p>The email you received and the website you visited were designed to simulate real phishing attacks that 
          cybercriminals use to steal credentials and access sensitive information.</p>
          <h3>Why We Run These Simulations</h3>
          <p>Phishing remains one of the most common and effective methods attackers use to compromise organizations. 
          These exercises help build awareness and improve everyone's ability to identify and report suspicious messages.</p>
          <h3>What To Look For Next Time</h3>
          <ul>
            <li>Unexpected emails asking you to take urgent action</li>
            <li>Misspellings and grammatical errors</li>
            <li>Sender addresses that don't match the claimed organization</li>
            <li>Links that don't go where they appear to go (hover before clicking)</li>
            <li>Requests for sensitive information</li>
          </ul>
          <h3>Remember</h3>
          <p>If you're unsure about an email, it's always better to verify through other channels before clicking links or 
          providing information.</p>
        `
        : `
          <p>Congratulations! You correctly identified a phishing simulation exercise.</p>
          <p>Your vigilance and caution are excellent demonstrations of good security awareness. By questioning 
          suspicious links and emails, you're helping to protect both yourself and your organization.</p>
          <h3>Keep Up The Good Work By Continuing To:</h3>
          <ul>
            <li>Verify sender identities before responding to requests</li>
            <li>Check email addresses carefully, not just display names</li>
            <li>Hover over links before clicking to see where they really go</li>
            <li>Report suspicious emails to your IT security team</li>
          </ul>
          <h3>Thank You</h3>
          <p>Your security awareness makes our entire organization more secure.</p>
        `;
      
      // Use campaign-specific training content if available
      if (campaign?.metadata && typeof campaign.metadata === 'object' && campaign.metadata !== null && 'remediationTraining' in campaign.metadata) {
        content = campaign.metadata.remediationTraining as string;
      }
      
      // Create the HTML for the training page
      const trainingHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              .training-container {
                background-color: #f9f9f9;
                border: 1px solid #e0e0e0;
                border-radius: 5px;
                padding: 25px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                background-color: ${success ? '#f8d7da' : '#d4edda'};
                color: ${success ? '#721c24' : '#155724'};
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
              }
              h1, h2, h3 {
                color: #444;
              }
              ul {
                margin-left: 20px;
              }
              .footer {
                margin-top: 30px;
                font-size: 0.9em;
                text-align: center;
                color: #6c757d;
              }
              .back-button {
                display: inline-block;
                background-color: #007bff;
                color: white;
                padding: 10px 15px;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="training-container">
              <div class="header">
                <h1>${title}</h1>
              </div>
              <div class="content">
                ${content}
              </div>
              <a href="/" class="back-button">Return to Dashboard</a>
              <div class="footer">
                <p>This was a security awareness training exercise. No actual data was collected.</p>
              </div>
            </div>
          </body>
        </html>
      `;
      
      return trainingHtml;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to generate training page",
        { error, campaignId }
      );
      
      // Return a basic training page on error
      return `
        <html>
          <head><title>Security Awareness Training</title></head>
          <body>
            <h1>Security Awareness Training</h1>
            <p>Thank you for participating in this security awareness exercise.</p>
            <p>Remember to always verify the source of emails and be cautious about clicking links or providing information.</p>
            <a href="/">Return to Dashboard</a>
          </body>
        </html>
      `;
    }
  }
}

export const phishingPageService = PhishingPageService.getInstance();
