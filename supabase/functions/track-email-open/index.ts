
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// 1x1 transparent pixel image data
const TRANSPARENT_PIXEL = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 
  0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00, 0x00, 0x00, 
  0x00, 0x2C, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 
  0x44, 0x01, 0x00, 0x3B
]);

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const trackingId = url.searchParams.get('id');

    if (!trackingId) {
      return new Response(TRANSPARENT_PIXEL, {
        headers: { 'Content-Type': 'image/gif' }
      });
    }

    // Log email open event
    const { error } = await supabase
      .from('campaign_metrics')
      .update({
        opened_at: new Date().toISOString(),
        user_agent: req.headers.get('user-agent') || null,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
      })
      .eq('additional_data->tracking_id', trackingId)
      .is('opened_at', null); // Only update if not already opened

    if (error) {
      console.error('Error logging email open:', error);
    } else {
      console.log(`Email opened - Tracking ID: ${trackingId}`);
    }

    // Always return the transparent pixel
    return new Response(TRANSPARENT_PIXEL, {
      headers: { 
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Email tracking error:', error);
    // Still return pixel even on error
    return new Response(TRANSPARENT_PIXEL, {
      headers: { 'Content-Type': 'image/gif' }
    });
  }
});
