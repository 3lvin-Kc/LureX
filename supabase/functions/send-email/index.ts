
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import sgMail from "npm:@sendgrid/mail@7.7.0";

const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Security-Policy": "default-src 'self'; img-src 'self' https: data:; object-src 'none'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
};

interface EmailRequest {
  templateId: string;
  targetEmails: string[];
  campaignId: string;
  trackingIds: Record<string, string>;
  subject: string;
  htmlContent: string;
  textContent?: string;
  from: string;
  replyTo?: string;
  metadata?: Record<string, any>;
  sendgridTemplateId?: string;
}

// Validate email addresses to prevent email injection
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Sanitize HTML content to prevent XSS
function sanitizeHtml(html: string): string {
  // Basic sanitization - in production, use a proper HTML sanitizer library
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '');
}

// Rate limiting implementation
const RATE_LIMIT = 100; // emails per window
const RATE_WINDOW = 3600000; // 1 hour in milliseconds
const ipRequests: Record<string, { count: number, timestamp: number }> = {};

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  
  if (!ipRequests[ip] || (now - ipRequests[ip].timestamp) > RATE_WINDOW) {
    ipRequests[ip] = { count: 1, timestamp: now };
    return true;
  }
  
  if (ipRequests[ip].count >= RATE_LIMIT) {
    return false;
  }
  
  ipRequests[ip].count++;
  return true;
}

serve(async (req) => {
  console.log("Email function called:", new Date().toISOString());
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    
    // Check rate limit
    if (!checkRateLimit(clientIp)) {
      console.error(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ success: false, error: "Rate limit exceeded" }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate request body
    const requestBody = await req.json() as EmailRequest;
    const { 
      templateId, 
      targetEmails, 
      campaignId, 
      trackingIds, 
      subject, 
      htmlContent, 
      textContent, 
      from, 
      replyTo,
      sendgridTemplateId
    } = requestBody;
    
    if (!sendgridApiKey) {
      throw new Error("SENDGRID_API_KEY environment variable is not configured");
    }

    sgMail.setApiKey(sendgridApiKey);

    // Validate required fields
    if (!templateId || !targetEmails || !campaignId || !subject || (!htmlContent && !sendgridTemplateId) || !from) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate all email addresses to prevent injection
    const invalidEmails = targetEmails.filter(email => !isValidEmail(email));
    if (invalidEmails.length > 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email addresses detected", invalidEmails }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const results = [];

    // Process emails in batches to prevent timeouts
    const batchSize = 10;
    for (let i = 0; i < targetEmails.length; i += batchSize) {
      const batch = targetEmails.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (email) => {
        const trackingId = trackingIds[email];
        if (!trackingId) {
          return {
            email,
            status: "failed",
            error: "Missing tracking ID for email",
          };
        }
        
        // Add tracking pixels and click tracking
        const trackingPixel = `<img src="https://sfsloprgxcwjjzjiwkmc.supabase.co/functions/v1/track-open?tid=${encodeURIComponent(trackingId)}" width="1" height="1" alt="" />`;
        
        // Prepare email content
        let emailContent: any;
        
        if (sendgridTemplateId) {
          // Use SendGrid template
          emailContent = {
            templateId: sendgridTemplateId,
            dynamicTemplateData: {
              subject: subject,
              tracking_id: trackingId,
              campaign_id: campaignId,
              // Add other dynamic data as needed
            }
          };
        } else {
          // Use custom HTML content
          let sanitizedHtml = sanitizeHtml(htmlContent);
          sanitizedHtml = sanitizedHtml.replace("</body>", `${trackingPixel}</body>`);
          
          // Replace links with tracking links
          sanitizedHtml = sanitizedHtml.replace(
            /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g,
            function(match, quote, url) {
              return `<a href="https://sfsloprgxcwjjzjiwkmc.supabase.co/functions/v1/track-click?tid=${encodeURIComponent(trackingId)}&url=${encodeURIComponent(url)}"`;
            }
          );
          
          emailContent = {
            html: sanitizedHtml,
            text: textContent,
          };
        }
        
        // Prepare email message
        const msg = {
          to: email,
          from: from,
          subject: subject,
          ...emailContent,
          replyTo: replyTo || from,
          customArgs: {
            campaign_id: campaignId,
            template_id: templateId,
            tracking_id: trackingId,
          },
          trackingSettings: {
            clickTracking: { enable: true },
            openTracking: { enable: true },
          },
        };
        
        try {
          const response = await sgMail.send(msg);
          
          console.log(`Email sent to ${email} with ID: ${response[0]?.headers['x-message-id']}`);
          
          results.push({
            email,
            trackingId,
            status: "sent",
            messageId: response[0]?.headers['x-message-id'],
          });
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error);
          results.push({
            email,
            trackingId,
            status: "failed",
            error: error.message,
          });
        }
      });

      await Promise.all(batchPromises);
    }

    // Log success for monitoring
    console.log(`Successfully processed ${results.length} emails for campaign: ${campaignId}`);

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
