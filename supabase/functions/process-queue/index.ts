
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import sgMail from "npm:@sendgrid/mail@7.7.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function is designed to be triggered by a scheduled task
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = new Date().toISOString();
    
    // Get queued emails that are scheduled to be sent
    const { data: queueItems, error: queueError } = await supabase
      .from("email_queue")
      .select(`
        *,
        campaign:campaign_id(
          id,
          template_id,
          template_version
        ),
        target:target_id(
          id,
          email,
          first_name,
          last_name,
          department,
          position,
          custom_fields
        ),
        provider:provider_id(
          id,
          provider_type,
          api_key,
          from_email,
          from_name,
          sendgrid_template_id
        )
      `)
      .eq("status", "queued")
      .lte("scheduled_time", now)
      .limit(50); // Process in batches to avoid timeouts

    if (queueError) {
      console.error("Error fetching queue items:", queueError);
      throw new Error("Failed to fetch queue items");
    }

    if (!queueItems || queueItems.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No emails to process" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Group by campaign for efficiency
    const campaignGroups = queueItems.reduce((groups, item) => {
      const campaignId = item.campaign_id;
      if (!groups[campaignId]) {
        groups[campaignId] = [];
      }
      groups[campaignId].push(item);
      return groups;
    }, {});

    const results = [];

    // Process each campaign group
    for (const campaignId of Object.keys(campaignGroups)) {
      const items = campaignGroups[campaignId];
      const firstItem = items[0];
      
      // Get template details
      const { data: template, error: templateError } = await supabase
        .from("email_templates")
        .select("*")
        .eq("id", firstItem.campaign.template_id)
        .single();

      if (templateError) {
        console.error("Error fetching template:", templateError);
        continue;
      }

      // Get template version if specified
      let htmlContent = template.html_content;
      let textContent = template.text_content;
      let subject = template.subject;

      if (firstItem.campaign.template_version && firstItem.campaign.template_version !== template.version) {
        const { data: versionData, error: versionError } = await supabase
          .from("email_template_versions")
          .select("*")
          .eq("template_id", template.id)
          .eq("version", firstItem.campaign.template_version)
          .single();

        if (!versionError && versionData) {
          htmlContent = versionData.html_content;
          textContent = versionData.text_content;
          subject = versionData.subject;
        }
      }

      // Get tracking IDs for each target
      const targetIds = items.map(item => item.target_id);
      const { data: trackingData, error: trackingError } = await supabase
        .from("email_tracking")
        .select("target_id, tracking_id")
        .eq("campaign_id", campaignId)
        .in("target_id", targetIds);

      if (trackingError) {
        console.error("Error fetching tracking data:", trackingError);
        continue;
      }

      // Create a map of target_id to tracking_id
      const trackingMap = trackingData.reduce((map, item) => {
        map[item.target_id] = item.tracking_id;
        return map;
      }, {});

      // Prepare data for sending
      const providerInfo = firstItem.provider;
      const fromEmail = providerInfo.from_email;
      const fromName = providerInfo.from_name || "Phishing Simulation";
      const from = `${fromName} <${fromEmail}>`;
      
      // Use the SendGrid API key from environment variables instead of the one from provider
      if (!sendgridApiKey) {
        console.error("SENDGRID_API_KEY environment variable is not set");
        
        // Mark all items as failed
        for (const item of items) {
          await supabase
            .from("email_queue")
            .update({
              status: "failed",
              error_message: "SENDGRID_API_KEY environment variable is not set",
              updated_at: now,
            })
            .eq("id", item.id);
        }
        
        results.push({
          campaignId,
          processed: 0,
          success: false,
          error: "SENDGRID_API_KEY environment variable is not set",
        });
        
        continue;
      }
      
      // Initialize SendGrid API
      sgMail.setApiKey(sendgridApiKey);
      
      // Add SendGrid-specific parameters if applicable
      const sendgridTemplateId = providerInfo.sendgrid_template_id;
      
      // Process each target in the campaign
      const emailResults = [];
      
      for (const item of items) {
        const target = item.target;
        const trackingId = trackingMap[target.target_id];
        
        if (!trackingId) {
          emailResults.push({
            email: target.email,
            status: "failed",
            error: "Missing tracking ID for email",
          });
          continue;
        }
        
        // Add tracking pixels and click tracking
        const trackingPixel = `<img src="https://sfsloprgxcwjjzjiwkmc.supabase.co/functions/v1/track-open?tid=${encodeURIComponent(trackingId)}" width="1" height="1" alt="" />`;
        
        // Prepare email content
        let emailContent = {};
        
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
          let sanitizedHtml = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/g, '')
            .replace(/on\w+='[^']*'/g, '');
          
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
          to: target.email,
          from: from,
          subject: subject,
          ...emailContent,
          replyTo: from,
          customArgs: {
            campaign_id: campaignId,
            template_id: template.id,
            tracking_id: trackingId,
          },
          trackingSettings: {
            clickTracking: { enable: true },
            openTracking: { enable: true },
          },
        };
        
        try {
          const response = await sgMail.send(msg);
          
          console.log(`Email sent to ${target.email} with ID: ${response[0]?.headers['x-message-id']}`);
          
          // Update queue item status
          await supabase
            .from("email_queue")
            .update({
              status: "sent",
              sent_time: now,
              updated_at: now,
            })
            .eq("id", item.id);
            
          // Update tracking status
          await supabase
            .from("email_tracking")
            .update({
              status: "sent",
              sent_at: now,
              metadata: { message_id: response[0]?.headers['x-message-id'] },
            })
            .eq("tracking_id", trackingId);
            
          emailResults.push({
            email: target.email,
            trackingId,
            status: "sent",
            messageId: response[0]?.headers['x-message-id'],
          });
        } catch (error) {
          console.error(`Failed to send email to ${target.email}:`, error);
          
          // Update queue item status
          await supabase
            .from("email_queue")
            .update({
              status: "failed",
              error_message: error.message,
              updated_at: now,
            })
            .eq("id", item.id);
            
          emailResults.push({
            email: target.email,
            trackingId,
            status: "failed",
            error: error.message,
          });
        }
      }
      
      results.push({
        campaignId,
        processed: emailResults.length,
        success: emailResults.some(r => r.status === "sent"),
        results: emailResults,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: queueItems.length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in process-queue function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
