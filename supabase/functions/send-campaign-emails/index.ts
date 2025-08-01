import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

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
    const { campaignId, templateId, targetListId } = await req.json();

    const { data: campaign } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    const { data: targets } = await supabase
      .from('targets')
      .select('*')
      .eq('list_id', targetListId);

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const target of targets || []) {
      try {
        const trackingId = generateTrackingId(campaignId, target.email);
        const phishingLink = `https://careful-eagle-40-tstv8hh2xqe7.deno.dev/?t=${trackingId}`;

        let htmlContent = template.html_content || '';
        let textContent = template.text_content || '';

        const replacements = {
          '{{first_name}}': target.first_name || '',
          '{{last_name}}': target.last_name || '',
          '{{email}}': target.email || '',
          '{{department}}': target.department || '',
          '{{position}}': target.position || '',
          '{{phishing_link}}': phishingLink,
        };

        for (const [placeholder, value] of Object.entries(replacements)) {
          htmlContent = htmlContent.split(placeholder).join(value);
          textContent = textContent.split(placeholder).join(value);
        }

        // Fallback: If {{phishing_link}} was never in the template, append it.
        if (!template.html_content?.includes('{{phishing_link}}')) {
          htmlContent += `<p><a href="${phishingLink}">Click here to view the link</a></p>`;
        }

        if (!template.text_content?.includes('{{phishing_link}}')) {
          textContent += `\n\nVisit this link: ${phishingLink}`;
        }

        const trackingPixel = `<img src="${Deno.env.get('SUPABASE_URL')}/functions/v1/track-email-open?t=${trackingId}" width="1" height="1" style="display:none;" />`;
        htmlContent += trackingPixel;

        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (!resendApiKey) {
          throw new Error('Resend API key not set in Supabase secrets.');
        }

        const resend = new Resend(resendApiKey);

        const fromEmail = campaign.domain_id
          ? `security@${campaign.domain_id}`
          : 'WhyPhish Security <support@resend.dev>';

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
          await supabase.from('campaign_metrics').upsert({
            campaign_id: campaignId,
            target_email: target.email,
            sent_at: new Date().toISOString(),
            additional_data: {
              tracking_id: trackingId,
              template_id: templateId,
              resend_email_id: emailResponse.data?.id,
              email_status: 'sent',
            },
          }, {
            onConflict: 'campaign_id,target_email',
          });

          emailsSent++;
        } else {
          emailsFailed++;
          console.error(`Failed to send email to ${target.email}:`, emailResponse.error);
        }

        // Debug output
        console.log('HTML content:', htmlContent);
        console.log('Text content:', textContent);

      } catch (error) {
        emailsFailed++;
        console.error(`Error sending email to ${target.email}:`, error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      emails_sent: emailsSent,
      emails_failed: emailsFailed,
      total_targets: targets?.length || 0,
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Campaign sending error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

function generateTrackingId(campaignId: string, targetEmail: string): string {
  const timestamp = Date.now().toString();
  const data = `${campaignId}|${targetEmail}|${timestamp}`;
  return btoa(data);
}
