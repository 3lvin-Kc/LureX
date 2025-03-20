
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const trackingId = url.searchParams.get("tid");
    const destination = url.searchParams.get("url");

    if (!trackingId || !destination) {
      throw new Error("Missing tracking ID or destination URL");
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

    // Update clicked status
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("email_tracking")
      .update({
        clicked_at: trackingData.clicked_at ? trackingData.clicked_at : now,
        clicked_count: trackingData.clicked_count + 1,
      })
      .eq("tracking_id", trackingId);

    if (updateError) {
      console.error("Error updating tracking data:", updateError);
      throw new Error("Failed to update tracking record");
    }

    // Redirect to the destination URL
    return new Response(null, {
      status: 302,
      headers: {
        Location: destination,
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
      },
    });
  } catch (error) {
    console.error("Error in track-click function:", error);
    // Redirect to a default URL on error
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
      },
    });
  }
});
