
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templateId, targetEmails, campaignId, trackingIds, subject, htmlContent, textContent, from, replyTo, metadata } = await req.json() as EmailRequest;
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (!templateId || !targetEmails || !campaignId || !subject || !htmlContent || !from) {
      throw new Error("Missing required fields");
    }

    const currentTime = new Date().toISOString();
    const results = [];

    // Process emails in batches to prevent timeouts
    const batchSize = 10;
    for (let i = 0; i < targetEmails.length; i += batchSize) {
      const batch = targetEmails.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (email) => {
        const trackingId = trackingIds[email];
        
        // Add tracking pixels and click tracking
        const trackingPixel = `<img src="https://sfsloprgxcwjjzjiwkmc.supabase.co/functions/v1/track-open?tid=${trackingId}" width="1" height="1" />`;
        let emailHtml = htmlContent.replace("</body>", `${trackingPixel}</body>`);
        
        // Replace links with tracking links
        emailHtml = emailHtml.replace(
          /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g,
          `<a href="https://sfsloprgxcwjjzjiwkmc.supabase.co/functions/v1/track-click?tid=${trackingId}&url=$2"`
        );

        try {
          const emailResponse = await resend.emails.send({
            from,
            to: [email],
            subject,
            html: emailHtml,
            text: textContent,
            reply_to: replyTo,
            tags: [
              {
                name: "campaign_id",
                value: campaignId,
              },
              {
                name: "template_id",
                value: templateId,
              },
              {
                name: "tracking_id",
                value: trackingId,
              },
            ],
          });

          results.push({
            email,
            trackingId,
            status: "sent",
            messageId: emailResponse.id,
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
