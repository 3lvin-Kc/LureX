
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const trackingId = url.searchParams.get('id');
    const targetUrl = url.searchParams.get('url');

    if (!trackingId || !targetUrl) {
      return new Response('Invalid tracking parameters', { status: 400 });
    }

    // Log email click event
    const { error } = await supabase
      .from('campaign_metrics')
      .update({
        clicked_at: new Date().toISOString(),
        user_agent: req.headers.get('user-agent') || null,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
        additional_data: {
          tracking_id: trackingId,
          clicked_url: targetUrl,
          clicked_at: new Date().toISOString()
        }
      })
      .eq('additional_data->tracking_id', trackingId);

    if (error) {
      console.error('Error logging email click:', error);
    } else {
      console.log(`Email clicked - Tracking ID: ${trackingId}, URL: ${targetUrl}`);
    }

    // Redirect to the original URL
    return new Response(null, {
      status: 302,
      headers: { 'Location': decodeURIComponent(targetUrl) }
    });

  } catch (error) {
    console.error('Email click tracking error:', error);
    return new Response('Tracking error', { status: 500 });
  }
});
