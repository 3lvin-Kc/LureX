
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendEmailRequest {
  campaignId: string;
  templateId: string;
  targetListId: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY') ?? '');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId, templateId, targetListId }: SendEmailRequest = await req.json();
    
    // Get user from auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      return new Response(
        JSON.stringify({ error: 'Template not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get target list
    const { data: targets, error: targetsError } = await supabase
      .from('targets')
      .select('*')
      .eq('list_id', targetListId);

    if (targetsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch targets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Real email sending with Resend
    const emailResults = [];
    const trackingDomain = Deno.env.get('SUPABASE_URL') ?? '';
    
    for (const target of targets || []) {
      try {
        // Generate unique tracking ID
        const trackingId = crypto.randomUUID();
        
        // Add tracking pixel and click tracking to HTML content
        const trackingPixel = `<img src="${trackingDomain}/functions/v1/track-email-open?id=${trackingId}" width="1" height="1" style="display:none;" />`;
        const htmlContentWithTracking = template.html_content + trackingPixel;
        
        // Replace links with tracking URLs
        const trackedHtmlContent = htmlContentWithTracking.replace(
          /<a\s+href="([^"]+)"/g, 
          `<a href="${trackingDomain}/functions/v1/track-email-click?id=${trackingId}&url=$1"`
        );

        // Send email via Resend
        const emailResponse = await resend.emails.send({
          from: 'PhishGuard <noreply@phishguard.com>',
          to: [target.email],
          subject: template.subject,
          html: trackedHtmlContent,
          text: template.text_content || undefined,
          headers: {
            'X-Campaign-ID': campaignId,
            'X-Target-ID': target.id,
            'X-Tracking-ID': trackingId,
          },
        });

        if (emailResponse.error) {
          throw new Error(emailResponse.error.message);
        }

        // Log successful email sending with tracking ID
        const { error: metricsError } = await supabase
          .from('campaign_metrics')
          .insert({
            campaign_id: campaignId,
            target_email: target.email,
            sent_at: new Date().toISOString(),
            additional_data: { 
              tracking_id: trackingId,
              email_id: emailResponse.data?.id,
              resend_id: emailResponse.data?.id 
            }
          });

        if (metricsError) {
          console.error('Failed to log email metrics:', metricsError);
        }

        emailResults.push({
          targetId: target.id,
          email: target.email,
          status: 'sent',
          trackingId: trackingId,
          emailId: emailResponse.data?.id,
          timestamp: new Date().toISOString()
        });

        console.log(`Email sent successfully to: ${target.email}, Tracking ID: ${trackingId}`);
      } catch (error) {
        // Log failed email
        await supabase
          .from('campaign_metrics')
          .insert({
            campaign_id: campaignId,
            target_email: target.email,
            additional_data: { 
              error: error.message,
              failed_at: new Date().toISOString()
            }
          });

        emailResults.push({
          targetId: target.id,
          email: target.email,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString()
        });

        console.error(`Failed to send email to ${target.email}:`, error);
      }
    }

    // Update campaign status
    await supabase
      .from('campaigns')
      .update({ status: 'in_progress' })
      .eq('id', campaignId);

    return new Response(
      JSON.stringify({
        success: true,
        campaign_id: campaignId,
        emails_sent: emailResults.filter(r => r.status === 'sent').length,
        emails_failed: emailResults.filter(r => r.status === 'failed').length,
        results: emailResults,
        tracking_enabled: true
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Send campaign emails error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
