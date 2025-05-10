
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { v4 as uuidv4 } from "https://esm.sh/uuid@9.0.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QueueCampaignRequest {
  campaignId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId } = await req.json() as QueueCampaignRequest;

    if (!campaignId) {
      throw new Error("Missing campaign ID");
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select(`
        *,
        target_list:target_list_id(id),
        template:template_id(id, subject, html_content, text_content),
        provider:provider_id(id, host, port, username, password, from_email, from_name)
      `)
      .eq("id", campaignId)
      .single();

    if (campaignError) {
      console.error("Error fetching campaign:", campaignError);
      throw new Error("Failed to find campaign");
    }

    // Get targets from the target list
    const { data: targets, error: targetsError } = await supabase
      .from("targets")
      .select("*")
      .eq("list_id", campaign.target_list.id);

    if (targetsError) {
      console.error("Error fetching targets:", targetsError);
      throw new Error("Failed to find targets");
    }

    // Create tracking entries and queue emails
    const now = new Date().toISOString();
    const queueEntries = [];
    const trackingEntries = [];
    const trackingIds = {};
    
    // Get phishing page ID if applicable
    const { data: phishingPage } = await supabase
      .from("phishing_pages")
      .select("id")
      .eq("id", campaign.landingPageId)
      .single();
    
    const phishingPageId = phishingPage?.id;

    for (const target of targets) {
      const trackingId = uuidv4();
      trackingIds[target.email] = trackingId;

      trackingEntries.push({
        campaign_id: campaignId,
        target_id: target.id,
        email: target.email,
        tracking_id: trackingId,
        status: "pending",
        created_at: now,
        metadata: {
          pageId: phishingPageId, // Store the phishing page ID in metadata
          campaignId: campaignId, // Also store campaign ID for reference
          redirect_url: phishingPageId ? `/phishing-page/${phishingPageId}` : "/training"
        }
      });

      queueEntries.push({
        campaign_id: campaignId,
        target_id: target.id,
        provider_id: campaign.provider_id,
        status: "queued",
        scheduled_time: campaign.schedule_time || now,
        created_at: now,
      });
    }

    // Insert tracking records
    const { error: trackingInsertError } = await supabase
      .from("email_tracking")
      .insert(trackingEntries);

    if (trackingInsertError) {
      console.error("Error inserting tracking records:", trackingInsertError);
      throw new Error("Failed to create tracking records");
    }

    // Insert queue entries
    const { error: queueInsertError } = await supabase
      .from("email_queue")
      .insert(queueEntries);

    if (queueInsertError) {
      console.error("Error inserting queue entries:", queueInsertError);
      throw new Error("Failed to queue emails");
    }

    // Update campaign status
    const { error: updateError } = await supabase
      .from("campaigns")
      .update({
        status: campaign.schedule_time ? "scheduled" : "in_progress",
        start_time: campaign.schedule_time || now,
      })
      .eq("id", campaignId);

    if (updateError) {
      console.error("Error updating campaign:", updateError);
      throw new Error("Failed to update campaign status");
    }
    
    // Log the event
    const { error: logError } = await supabase
      .from("security_logs")
      .insert({
        event_type: "campaign_creation",
        message: "Campaign queued successfully",
        details: { 
          campaignId, 
          targetCount: targets.length,
          scheduledTime: campaign.schedule_time || now
        },
        event_level: "info",
      });
    
    if (logError) {
      console.error("Error logging event:", logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Campaign queued successfully",
        queued: queueEntries.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in queue-campaign function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
