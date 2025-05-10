
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface TrackSubmissionRequest {
  trackingId: string;
  pageId: string;
  formData: Record<string, string>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    if (req.method !== "POST") {
      throw new Error("Method not allowed");
    }

    const { trackingId, pageId, formData } = await req.json() as TrackSubmissionRequest;
    
    if (!trackingId || !pageId || !formData) {
      throw new Error("Missing required parameters");
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

    // Sanitize form data - remove any password fields completely
    const sanitizedFormData: Record<string, string> = {};
    for (const [key, value] of Object.entries(formData)) {
      // Skip password fields entirely - we don't store actual credentials
      if (key.toLowerCase().includes('password') || 
          key.toLowerCase().includes('credential') ||
          key.toLowerCase().includes('secret') ||
          key.toLowerCase().includes('token')) {
        continue;
      }
      sanitizedFormData[key] = value;
    }

    // Record the form submission
    const { error: formError } = await supabase
      .from("phishing_forms")
      .insert({
        page_id: pageId,
        form_data: sanitizedFormData,
      });

    if (formError) {
      console.error("Error recording form submission:", formError);
      throw new Error("Failed to record form submission");
    }

    // Update the tracking record
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("email_tracking")
      .update({
        metadata: { 
          ...trackingData.metadata, 
          submitted_at: now,
          submitted: true,
          form_fields_count: Object.keys(formData).length
        }
      })
      .eq("tracking_id", trackingId);
    
    if (updateError) {
      console.error("Error updating tracking record:", updateError);
    }

    // Log the event
    const { error: logError } = await supabase
      .from("security_logs")
      .insert({
        event_type: "phishing_page_access",
        message: "Phishing form submitted",
        details: { 
          trackingId, 
          pageId,
          campaignId: trackingData.campaign_id,
          email: trackingData.email,
          fieldCount: Object.keys(sanitizedFormData).length
        },
        event_level: "info",
      });
    
    if (logError) {
      console.error("Error logging event:", logError);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in track-submission function:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
