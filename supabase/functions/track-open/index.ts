
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const trackingId = url.searchParams.get("tid");

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

    // Update opened status
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("email_tracking")
      .update({
        opened_at: trackingData.opened_at ? trackingData.opened_at : now,
        opened_count: trackingData.opened_count + 1,
      })
      .eq("tracking_id", trackingId);

    if (updateError) {
      console.error("Error updating tracking data:", updateError);
      throw new Error("Failed to update tracking record");
    }

    // Return a 1x1 transparent pixel
    return new Response(
      new Uint8Array([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
        0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
        0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
        0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
      ]),
      {
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-store, no-cache, must-revalidate, private",
        },
      }
    );
  } catch (error) {
    console.error("Error in track-open function:", error);
    // Still return a transparent pixel even on error to avoid breaking email display
    return new Response(
      new Uint8Array([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
        0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
        0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
        0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
      ]),
      {
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-store, no-cache, must-revalidate, private",
        },
      }
    );
  }
});
