
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
    const targetUrl = url.searchParams.get('url');

    if (!trackingId) {                 
      return new Response('Invalid tracking parameters', { status: 400 });
    }

    // Parse tracking ID
    const trackingData = parseTrackingId(trackingId);
    if (!trackingData) {
      return new Response('Invalid tracking ID', { status: 400 });
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
      .eq('campaign_id', trackingData.campaignId)
      .eq('target_email', trackingData.targetEmail);

    if (error) {
      console.error('Error logging email click:', error);
    } else {
      console.log(`Email clicked - Campaign: ${trackingData.campaignId}, Target: ${trackingData.targetEmail}`);
    }

    // Redirect to phishing page or target URL
    const redirectUrl = targetUrl ? decodeURIComponent(targetUrl) : 
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/serve-phishing-page?t=${trackingId}`;

    return new Response(null, {
      status: 302,
      headers: { 'Location': redirectUrl }
    });

  } catch (error) {
    console.error('Email click tracking error:', error);
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
