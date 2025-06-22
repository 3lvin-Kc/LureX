
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

    // Mock email sending (in production, integrate with real email service)
    const emailResults = [];
    for (const target of targets || []) {
      try {
        // Mock email sending delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Log email metrics
        const { error: metricsError } = await supabase
          .from('campaign_metrics')
          .insert({
            campaign_id: campaignId,
            target_id: target.id,
            event_type: 'sent',
            timestamp: new Date().toISOString(),
          });

        if (metricsError) {
          console.error('Failed to log email metrics:', metricsError);
        }

        emailResults.push({
          targetId: target.id,
          email: target.email,
          status: 'sent',
          timestamp: new Date().toISOString()
        });

        console.log(`Mock email sent to: ${target.email}`);
      } catch (error) {
        emailResults.push({
          targetId: target.id,
          email: target.email,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString()
        });
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
        results: emailResults
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
