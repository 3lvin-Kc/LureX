import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, campaign_id, platform_name, message_data } = await req.json();

    // Get user authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    switch (action) {
      case 'send_linkedin_message': {
        const result = await sendLinkedInMessage(supabase, user.id, campaign_id, message_data);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'send_connection_request': {
        const result = await sendConnectionRequest(supabase, user.id, campaign_id, message_data);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'track_engagement': {
        const result = await trackSocialEngagement(supabase, campaign_id, message_data);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_campaign_metrics': {
        const metrics = await getCampaignMetrics(supabase, user.id, campaign_id);
        return new Response(JSON.stringify(metrics), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid action specified');
    }

  } catch (error) {
    console.error('Social media automation error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendLinkedInMessage(supabase: any, userId: string, campaignId: string, messageData: any) {
  // Get LinkedIn platform connection
  const { data: platform } = await supabase
    .from('social_media_platforms')
    .select('*')
    .eq('user_id', userId)
    .eq('platform_name', 'linkedin')
    .eq('is_active', true)
    .single();

  if (!platform) {
    throw new Error('LinkedIn account not connected');
  }

  // Check if access token is still valid
  if (new Date() > new Date(platform.access_token_expires_at)) {
    throw new Error('LinkedIn access token expired. Please reconnect your account.');
  }

  // Send LinkedIn message via API
  const messageResponse = await fetch('https://api.linkedin.com/v2/messaging/conversations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${platform.oauth_token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    },
    body: JSON.stringify({
      recipients: messageData.recipients,
      subject: messageData.subject,
      body: {
        text: messageData.message
      }
    })
  });

  if (!messageResponse.ok) {
    const error = await messageResponse.json();
    throw new Error(`LinkedIn API error: ${error.message}`);
  }

  const result = await messageResponse.json();

  // Track the metric
  await supabase
    .from('social_media_metrics')
    .insert({
      campaign_id: campaignId,
      target_profile_id: messageData.target_profile_id,
      platform_name: 'linkedin',
      action_type: 'sent',
      additional_data: {
        message_id: result.id,
        message_type: 'direct_message'
      }
    });

  return { success: true, message_id: result.id };
}

async function sendConnectionRequest(supabase: any, userId: string, campaignId: string, requestData: any) {
  // Get LinkedIn platform connection
  const { data: platform } = await supabase
    .from('social_media_platforms')
    .select('*')
    .eq('user_id', userId)
    .eq('platform_name', 'linkedin')
    .eq('is_active', true)
    .single();

  if (!platform) {
    throw new Error('LinkedIn account not connected');
  }

  // Send connection request via LinkedIn API
  const requestResponse = await fetch('https://api.linkedin.com/v2/people/~/connections', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${platform.oauth_token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    },
    body: JSON.stringify({
      person: requestData.target_person_urn,
      message: requestData.message
    })
  });

  if (!requestResponse.ok) {
    const error = await requestResponse.json();
    throw new Error(`LinkedIn connection request failed: ${error.message}`);
  }

  // Track the metric
  await supabase
    .from('social_media_metrics')
    .insert({
      campaign_id: campaignId,
      target_profile_id: requestData.target_profile_id,
      platform_name: 'linkedin',
      action_type: 'sent',
      additional_data: {
        request_type: 'connection_request',
        message: requestData.message
      }
    });

  return { success: true };
}

async function trackSocialEngagement(supabase: any, campaignId: string, engagementData: any) {
  // Record engagement metric
  const { data, error } = await supabase
    .from('social_media_metrics')
    .insert({
      campaign_id: campaignId,
      target_profile_id: engagementData.target_profile_id,
      platform_name: engagementData.platform_name,
      action_type: engagementData.action_type,
      user_agent: engagementData.user_agent,
      ip_address: engagementData.ip_address,
      additional_data: engagementData.additional_data || {}
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to track engagement: ${error.message}`);
  }

  // If this is a failed phishing attempt, trigger just-in-time training
  if (engagementData.action_type === 'clicked' || engagementData.action_type === 'responded') {
    const { data: campaign } = await supabase
      .from('social_media_campaigns')
      .select('user_id')
      .eq('id', campaignId)
      .single();

    if (campaign) {
      // Trigger adaptive learning intervention
      await fetch(`${supabaseUrl}/functions/v1/adaptive-learning-engine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({
          action: 'trigger_intervention',
          user_id: campaign.user_id,
          assessment_data: {
            trigger_event: 'phishing_failure',
            campaign_id: campaignId,
            intervention_type: 'immediate_training',
            priority_level: 'high',
            intervention_data: {
              failure_type: 'social_media_phishing',
              platform: engagementData.platform_name,
              context: engagementData.additional_data
            }
          }
        })
      });
    }
  }

  return { success: true, metric_id: data.id };
}

async function getCampaignMetrics(supabase: any, userId: string, campaignId: string) {
  // Get campaign with metrics
  const { data: campaign } = await supabase
    .from('social_media_campaigns')
    .select(`
      *,
      social_media_metrics (*)
    `)
    .eq('user_id', userId)
    .eq('id', campaignId)
    .single();

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  // Calculate engagement statistics
  const metrics = campaign.social_media_metrics || [];
  const stats = {
    total_sent: metrics.filter((m: any) => m.action_type === 'sent').length,
    total_delivered: metrics.filter((m: any) => m.action_type === 'delivered').length,
    total_viewed: metrics.filter((m: any) => m.action_type === 'viewed').length,
    total_clicked: metrics.filter((m: any) => m.action_type === 'clicked').length,
    total_responded: metrics.filter((m: any) => m.action_type === 'responded').length,
    total_connected: metrics.filter((m: any) => m.action_type === 'connected').length,
    total_reported: metrics.filter((m: any) => m.action_type === 'reported').length,
  };

  stats.click_rate = stats.total_sent > 0 ? (stats.total_clicked / stats.total_sent) * 100 : 0;
  stats.response_rate = stats.total_sent > 0 ? (stats.total_responded / stats.total_sent) * 100 : 0;
  stats.connection_rate = stats.total_sent > 0 ? (stats.total_connected / stats.total_sent) * 100 : 0;

  return {
    campaign,
    statistics: stats,
    raw_metrics: metrics
  };
}