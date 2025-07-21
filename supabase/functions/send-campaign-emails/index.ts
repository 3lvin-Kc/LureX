
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

// Deno global is available in Supabase Edge Function runtime
const supabase = createClient(
  // @ts-expect-error Deno global is available in Supabase Edge Functions
  Deno.env.get('SUPABASE_URL') ?? '',
  // @ts-expect-error Deno global is available in Supabase Edge Functions
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
    const { campaignId, templateId, targetListId } = await req.json();

    console.log('Starting campaign email send:', { campaignId, templateId, targetListId });

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found');
    }

    // Get email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      throw new Error('Email template not found');
    }

    // Get targets
    const { data: targets, error: targetsError } = await supabase
      .from('targets')
      .select('*')
      .eq('list_id', targetListId);

    if (targetsError || !targets || targets.length === 0) {
      throw new Error('No targets found');
    }

    let emailsSent = 0;
    let emailsFailed = 0;

    // Process each target
    for (const target of targets) {
      try {
        // Generate tracking ID
        const trackingId = generateTrackingId(campaignId, target.email);
        
        // Create phishing link
        const phishingLink = `${Deno.env.get('SUPABASE_URL')}/functions/v1/serve-phishing-page?t=${trackingId}`;
        
        // Personalize email content
        let htmlContent = template.html_content
          .replace(/\{\{first_name\}\}/g, target.first_name || '')
          .replace(/\{\{last_name\}\}/g, target.last_name || '')
          .replace(/\{\{email\}\}/g, target.email || '')
          .replace(/\{\{department\}\}/g, target.department || '')
          .replace(/\{\{position\}\}/g, target.position || '')
          .replace(/\{\{phishing_link\}\}/g, phishingLink);

        let textContent = template.text_content || ''
          .replace(/\{\{first_name\}\}/g, target.first_name || '')
          .replace(/\{\{last_name\}\}/g, target.last_name || '')
          .replace(/\{\{email\}\}/g, target.email || '')
          .replace(/\{\{department\}\}/g, target.department || '')
          .replace(/\{\{position\}\}/g, target.position || '')
          .replace(/\{\{phishing_link\}\}/g, phishingLink);

        // Add email tracking pixel
        const trackingPixel = `<img src="${Deno.env.get('SUPABASE_URL')}/functions/v1/track-email-open?t=${trackingId}" width="1" height="1" style="display:none;" />`;
        htmlContent += trackingPixel;

        // Send email using Resend
        // @ts-expect-error Deno global is available in Supabase Edge Functions
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (!resendApiKey) {
          throw new Error('Resend API key not set in Supabase secrets.');
        }
        const resend = new Resend(resendApiKey);
        
        // Custom domain setup for sender
        const fromEmail = campaign.domain_id 
          ? `security@${campaign.domain_id}` 
          : 'WhyPhish Security <noreply@resend.dev>';
        
        const emailResponse = await resend.emails.send({
          from: fromEmail,
          to: [target.email],
          subject: template.subject,
          html: htmlContent,
          text: textContent,
          headers: {
            'X-Campaign-ID': campaignId,
            'X-Target-Email': target.email,
            'X-Tracking-ID': trackingId,
          },
        });

        if (emailResponse.data) {
          // Record successful send
          await supabase
            .from('campaign_metrics')
            .upsert({
              campaign_id: campaignId,
              target_email: target.email,
              sent_at: new Date().toISOString(),
              additional_data: {
                tracking_id: trackingId,
                template_id: templateId,
                resend_email_id: emailResponse.data?.id,
                email_status: 'sent'
              }
            }, {
              onConflict: 'campaign_id,target_email'
            });

          emailsSent++;
          console.log(`Email sent successfully to: ${target.email}`);
        } else {
          emailsFailed++;
          console.error(`Failed to send email to ${target.email}:`, emailResponse.error);
        }

      } catch (error) {
        emailsFailed++;
        console.error(`Error sending email to ${target.email}:`, error);
      }
    }

    console.log(`Campaign ${campaignId} completed: ${emailsSent} sent, ${emailsFailed} failed`);

    return new Response(JSON.stringify({
      success: true,
      emails_sent: emailsSent,
      emails_failed: emailsFailed,
      total_targets: targets.length
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Campaign sending error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});

function generateTrackingId(campaignId: string, targetEmail: string): string {
  const timestamp = Date.now().toString();
  const data = `${campaignId}|${targetEmail}|${timestamp}`;
  return btoa(data);
}
