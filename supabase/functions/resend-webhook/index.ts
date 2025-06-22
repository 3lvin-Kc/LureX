
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
    const webhookPayload = await req.json();
    const { type, data } = webhookPayload;

    console.log(`Received Resend webhook: ${type}`, data);

    // Handle different webhook events
    switch (type) {
      case 'email.sent':
        await handleEmailSent(data);
        break;
      case 'email.delivered':
        await handleEmailDelivered(data);
        break;
      case 'email.bounced':
        await handleEmailBounced(data);
        break;
      case 'email.complained':
        await handleEmailComplaint(data);
        break;
      case 'email.opened':
        await handleEmailOpened(data);
        break;
      case 'email.clicked':
        await handleEmailClicked(data);
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleEmailSent(data: any) {
  const { email_id, to, from } = data;
  
  const { error } = await supabase
    .from('campaign_metrics')
    .update({
      sent_at: new Date().toISOString(),
      additional_data: { 
        resend_email_id: email_id,
        delivery_status: 'sent'
      }
    })
    .eq('target_email', to[0])
    .eq('additional_data->email_id', email_id);

  if (error) {
    console.error('Error updating sent status:', error);
  }
}

async function handleEmailDelivered(data: any) {
  const { email_id, to } = data;
  
  const { error } = await supabase
    .from('campaign_metrics')
    .update({
      delivered_at: new Date().toISOString(),
      additional_data: { 
        resend_email_id: email_id,
        delivery_status: 'delivered'
      }
    })
    .eq('target_email', to[0])
    .eq('additional_data->email_id', email_id);

  if (error) {
    console.error('Error updating delivered status:', error);
  }
}

async function handleEmailBounced(data: any) {
  const { email_id, to, bounce_type, bounce_reason } = data;
  
  const { error } = await supabase
    .from('campaign_metrics')
    .update({
      additional_data: { 
        resend_email_id: email_id,
        delivery_status: 'bounced',
        bounce_type: bounce_type,
        bounce_reason: bounce_reason,
        bounced_at: new Date().toISOString()
      }
    })
    .eq('target_email', to[0])
    .eq('additional_data->email_id', email_id);

  if (error) {
    console.error('Error updating bounced status:', error);
  }
}

async function handleEmailComplaint(data: any) {
  const { email_id, to } = data;
  
  const { error } = await supabase
    .from('campaign_metrics')
    .update({
      reported_at: new Date().toISOString(),
      additional_data: { 
        resend_email_id: email_id,
        delivery_status: 'complained',
        complained_at: new Date().toISOString()
      }
    })
    .eq('target_email', to[0])
    .eq('additional_data->email_id', email_id);

  if (error) {
    console.error('Error updating complaint status:', error);
  }
}

async function handleEmailOpened(data: any) {
  const { email_id, to } = data;
  
  const { error } = await supabase
    .from('campaign_metrics')
    .update({
      opened_at: new Date().toISOString()
    })
    .eq('target_email', to[0])
    .eq('additional_data->email_id', email_id)
    .is('opened_at', null);

  if (error) {
    console.error('Error updating opened status:', error);
  }
}

async function handleEmailClicked(data: any) {
  const { email_id, to, link } = data;
  
  const { error } = await supabase
    .from('campaign_metrics')
    .update({
      clicked_at: new Date().toISOString(),
      additional_data: { 
        resend_email_id: email_id,
        clicked_link: link
      }
    })
    .eq('target_email', to[0])
    .eq('additional_data->email_id', email_id);

  if (error) {
    console.error('Error updating clicked status:', error);
  }
}
