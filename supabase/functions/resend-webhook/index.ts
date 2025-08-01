import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const RESEND_SIGNING_SECRET = Deno.env.get('RESEND_SIGNING_SECRET') ?? '';

const corsHeaders = {                      
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, resend-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("resend-signature");
    const rawBody = await req.text();

    if (!signature) {
      return new Response("Missing signature", { status: 400, headers: corsHeaders });
    }

    // Decode the base64 signature
    const signatureUint8 = Uint8Array.from(atob(signature), c => c.charCodeAt(0));

    // Create HMAC key
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(RESEND_SIGNING_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const isVerified = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureUint8,
      encoder.encode(rawBody)
    );

    if (!isVerified) {
      return new Response("Invalid signature", { status: 401, headers: corsHeaders });
    }

    const webhookPayload = JSON.parse(rawBody);
    const { type, data } = webhookPayload;

    console.log(`✅ Verified Resend webhook: ${type}`, data);

    switch (type) {
      case 'email.sent': await handleEmailSent(data); break;
      case 'email.delivered': await handleEmailDelivered(data); break;
      case 'email.bounced': await handleEmailBounced(data); break;
      case 'email.complained': await handleEmailComplaint(data); break;
      case 'email.opened': await handleEmailOpened(data); break;
      case 'email.clicked': await handleEmailClicked(data); break;
      case 'email.delivery_delayed': await handleEmailDelayed(data); break;
      default:
        console.log(`⚠️ Unhandled webhook type: ${type}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});


// Your existing handlers (unchanged)

async function handleEmailSent(data: any) {
  const { email_id, to, from, subject } = data;

  try {
    const { error } = await supabase
      .from('campaign_metrics')
      .update({
        sent_at: new Date().toISOString(),
        additional_data: {
          resend_email_id: email_id,
          delivery_status: 'sent',
          from_address: from,
          subject: subject
        }
      })
      .eq('target_email', to[0])
      .eq('additional_data->resend_email_id', email_id);

    if (error) {
      console.error('Error updating sent status:', error);

      await supabase.from('campaign_metrics').insert({
        target_email: to[0],
        sent_at: new Date().toISOString(),
        additional_data: {
          resend_email_id: email_id,
          delivery_status: 'sent',
          from_address: from,
          subject: subject
        }
      });
    }

    console.log(`📤 Email sent recorded for: ${to[0]}`);
  } catch (error) {
    console.error('Error in handleEmailSent:', error);
  }
}

async function handleEmailDelivered(data: any) {
  const { email_id, to } = data;
  try {
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
      .eq('additional_data->resend_email_id', email_id);

    if (error) console.error('Error updating delivered status:', error);
    else console.log(`📬 Delivered: ${to[0]}`);
  } catch (error) {
    console.error('Error in handleEmailDelivered:', error);
  }
}

async function handleEmailBounced(data: any) {
  const { email_id, to, bounce_type, bounce_reason } = data;

  try {
    const bounceData = {
      resend_email_id: email_id,
      delivery_status: 'bounced',
      bounce_type,
      bounce_reason,
      bounced_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('campaign_metrics')
      .update({ additional_data: bounceData })
      .eq('target_email', to[0])
      .eq('additional_data->resend_email_id', email_id);

    if (error) console.error('Error updating bounced status:', error);
    else console.log(`📪 Bounced: ${to[0]} (${bounce_type})`);
  } catch (error) {
    console.error('Error in handleEmailBounced:', error);
  }
}

async function handleEmailComplaint(data: any) {
  const { email_id, to, complaint_feedback_type } = data;
  try {
    const { error } = await supabase
      .from('campaign_metrics')
      .update({
        reported_at: new Date().toISOString(),
        additional_data: {
          resend_email_id: email_id,
          delivery_status: 'complained',
          complained_at: new Date().toISOString(),
          complaint_type: complaint_feedback_type
        }
      })
      .eq('target_email', to[0])
      .eq('additional_data->resend_email_id', email_id);

    if (error) console.error('Error updating complaint status:', error);
    else console.log(`⚠️ Complaint from: ${to[0]}`);
  } catch (error) {
    console.error('Error in handleEmailComplaint:', error);
  }
}

async function handleEmailOpened(data: any) {
  const { email_id, to, ip, user_agent } = data;
  try {
    const { error } = await supabase
      .from('campaign_metrics')
      .update({
        opened_at: new Date().toISOString(),
        ip_address: ip,
        user_agent,
        additional_data: {
          resend_email_id: email_id,
          first_opened_at: new Date().toISOString()
        }
      })
      .eq('target_email', to[0])
      .eq('additional_data->resend_email_id', email_id)
      .is('opened_at', null);

    if (error) console.error('Error updating open:', error);
    else console.log(`📖 Opened by: ${to[0]}`);
  } catch (error) {
    console.error('Error in handleEmailOpened:', error);
  }
}

async function handleEmailClicked(data: any) {
  const { email_id, to, link, ip, user_agent } = data;
  try {
    const { error } = await supabase
      .from('campaign_metrics')
      .update({
        clicked_at: new Date().toISOString(),
        ip_address: ip,
        user_agent,
        additional_data: {
          resend_email_id: email_id,
          clicked_link: link,
          click_timestamp: new Date().toISOString()
        }
      })
      .eq('target_email', to[0])
      .eq('additional_data->resend_email_id', email_id);

    if (error) console.error('Error updating clicked status:', error);
    else console.log(`🖱️ Clicked: ${to[0]} - ${link}`);
  } catch (error) {
    console.error('Error in handleEmailClicked:', error);
  }
}

async function handleEmailDelayed(data: any) {
  const { email_id, to, delay_reason } = data;
  try {
    const { error } = await supabase
      .from('campaign_metrics')
      .update({
        additional_data: {
          resend_email_id: email_id,
          delivery_status: 'delayed',
          delay_reason,
          delayed_at: new Date().toISOString()
        }
      })
      .eq('target_email', to[0])
      .eq('additional_data->resend_email_id', email_id);

    if (error) console.error('Error updating delay:', error);
    else console.log(`⏳ Delayed: ${to[0]}`);
  } catch (error) {
    console.error('Error in handleEmailDelayed:', error);
  }
}
