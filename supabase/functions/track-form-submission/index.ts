
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
    const { trackingId, campaignId, targetEmail, formData, submittedAt } = await req.json();

    if (!campaignId || !targetEmail) {
      return new Response('Missing required parameters', { status: 400 });
    }

    // Update campaign metrics with form submission
    const { error } = await supabase
      .from('campaign_metrics')
      .update({
        data_submitted_at: submittedAt,
        additional_data: {
          form_data: formData,
          tracking_id: trackingId,
          submitted_at: submittedAt,
          user_agent: req.headers.get('user-agent') || null,
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
        }
      })
      .eq('campaign_id', campaignId)
      .eq('target_email', targetEmail);

    if (error) {
      console.error('Error tracking form submission:', error);
      throw error;
    }

    console.log(`Form submitted - Campaign: ${campaignId}, Target: ${targetEmail}, Data:`, formData);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });

  } catch (error) {
    console.error('Form submission tracking error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to track form submission' }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    );
  }
});
