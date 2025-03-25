
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

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
      const targetEmails = items.map(item => item.target.email);
      const trackingIds = {};

      items.forEach(item => {
        trackingIds[item.target.email] = trackingMap[item.target_id];
      });

      // Prepare email provider details
      const providerInfo = firstItem.provider;
      const fromEmail = providerInfo.from_email;
      const fromName = providerInfo.from_name || "Phishing Simulation";
      const from = `${fromName} <${fromEmail}>`;
      
      // Add SendGrid-specific parameters if applicable
      const sendgridTemplateId = providerInfo.sendgrid_template_id;

      // Send emails via the send-email function
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            templateId: template.id,
            targetEmails,
            campaignId,
            trackingIds,
            subject,
            htmlContent,
            textContent,
            from,
            sendgridTemplateId
          }),
        });

        const responseData = await response.json();
        
        // Update queue items based on send results
        for (const result of responseData.results) {
          const item = items.find(i => i.target.email === result.email);
          
          if (item) {
            await supabase
              .from("email_queue")
              .update({
                status: result.status,
                sent_time: result.status === "sent" ? now : null,
                error_message: result.error || null,
                updated_at: now,
              })
              .eq("id", item.id);

            // Also update tracking status
            await supabase
              .from("email_tracking")
              .update({
                status: result.status,
                sent_at: result.status === "sent" ? now : null,
                metadata: { message_id: result.messageId },
              })
              .eq("tracking_id", result.trackingId);
          }
        }

        results.push({
          campaignId,
          processed: responseData.results.length,
          success: responseData.success,
        });
      } catch (error) {
        console.error(`Error sending emails for campaign ${campaignId}:`, error);
        
        // Mark all items as failed
        for (const item of items) {
          await supabase
            .from("email_queue")
            .update({
              status: "failed",
              error_message: `Error calling send-email function: ${error.message}`,
              updated_at: now,
            })
            .eq("id", item.id);
        }

        results.push({
          campaignId,
          processed: 0,
          success: false,
          error: error.message,
        });
      }
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
