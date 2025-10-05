
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const url = new URL(req.url);
    const trackingId = url.searchParams.get('t');

    if (!trackingId) {
      return new Response('Invalid tracking parameters', { status: 400 });
    }

    // Parse tracking ID
    const trackingData = parseTrackingId(trackingId);
    if (!trackingData) {
      return new Response('Invalid tracking ID', { status: 400 });
    }

    // Log email open event
    const { error } = await supabase
      .from('campaign_metrics')
      .update({
        opened_at: new Date().toISOString(),
        user_agent: req.headers.get('user-agent') || null,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
        additional_data: {
          tracking_id: trackingId,
          opened_at: new Date().toISOString()
        }
      })
      .eq('campaign_id', trackingData.campaignId)
      .eq('target_email', trackingData.targetEmail);

    if (error) {
      console.error('Error logging email open:', error);
    } else {
      console.log(`Email opened - Campaign: ${trackingData.campaignId}, Target: ${trackingData.targetEmail}`);
    }

    // Return 1x1 transparent pixel
    const pixelData = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0xFF, 0x21, 0xF9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x04, 0x01, 0x00, 0x3B
    ]);

    return new Response(pixelData, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Email open tracking error:', error);
    return new Response('Tracking error', { status: 500 });
  }
});

function parseTrackingId(trackingId: string) {
  try {
    const decoded = atob(trackingId);
    const parts = decoded.split('|');
    
    if (parts.length !== 3) {
      return null;
    }

    return {
      campaignId: parts[0],
      targetEmail: parts[1],
      trackingId: parts[2]
    };
  } catch (error) {
    console.error('Error parsing tracking ID:', error);
    return null;
  }
}
