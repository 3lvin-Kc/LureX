
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

    // Update opened status
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
        opened_at: trackingData.opened_at ? trackingData.opened_at : now,
        opened_count: (trackingData.opened_count || 0) + 1,
        metadata: {
          ...metadata,
          lastOpen: now,
          openDevices: [...(metadata.openDevices || []), deviceInfo],
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
        event_type: "email_send_attempt",
        message: "Phishing email opened",
        user_id: null,
        user_agent: userAgent,
        ip_address: ipAddress,
        details: {
          trackingId,
          campaignId: trackingData.campaign_id,
          email: trackingData.email,
          openTime: now
        },
        event_level: "info",
      });
    
    if (logError) {
      console.error("Error logging security event:", logError);
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
          ...corsHeaders,
          "Content-Type": "image/gif",
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
          ...corsHeaders,
          "Content-Type": "image/gif",
        },
      }
    );
  }
});

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
