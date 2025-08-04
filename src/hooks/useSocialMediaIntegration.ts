import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SocialMediaPlatform {
  id: string;
  platform_name: 'linkedin' | 'facebook' | 'twitter' | 'instagram';
  platform_username: string;
  is_active: boolean;
  created_at: string;
  access_token_expires_at?: string;
}

export interface SocialMediaCampaign {
  id: string;
  campaign_id?: string;
  platform_id: string;
  template_id?: string;
  target_profiles: any[];
  campaign_type: 'connection_request' | 'direct_message' | 'post_interaction' | 'profile_cloning';
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'failed';
  schedule_time?: string;
  engagement_settings: any;
  created_at: string;
}

export interface SocialMediaTemplate {
  id: string;
  platform_name: string;
  template_name: string;
  template_type: string;
  content: string;
  media_attachments: any[];
  personalization_variables: any;
  industry_type: string;
  sophistication_level: 'low' | 'medium' | 'high';
  is_public: boolean;
  success_rate: number;
}

export const useSocialMediaIntegration = () => {
  const [platforms, setPlatforms] = useState<SocialMediaPlatform[]>([]);
  const [campaigns, setCampaigns] = useState<SocialMediaCampaign[]>([]);
  const [templates, setTemplates] = useState<SocialMediaTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('social_media_platforms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlatforms(data as SocialMediaPlatform[] || []);
    } catch (error) {
      console.error('Error fetching platforms:', error);
      toast({
        title: "Error",
        description: "Failed to fetch social media platforms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('social_media_campaigns')
        .select(`
          *,
          social_media_platforms!platform_id (
            platform_name,
            platform_username
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data as SocialMediaCampaign[] || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to fetch social media campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async (platformName?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('social_media_templates')
        .select('*')
        .or('is_public.eq.true,user_id.eq.' + (await supabase.auth.getUser()).data.user?.id);

      if (platformName) {
        query = query.eq('platform_name', platformName);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data as SocialMediaTemplate[] || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch social media templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const connectLinkedIn = async () => {
    try {
      // Generate LinkedIn OAuth URL
      const clientId = 'YOUR_LINKEDIN_CLIENT_ID'; // This should come from environment
      const redirectUri = encodeURIComponent(`${window.location.origin}/auth/linkedin/callback`);
      const scope = encodeURIComponent('r_liteprofile r_emailaddress w_member_social');
      const state = Math.random().toString(36).substring(7);

      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
      
      // Store state for validation
      localStorage.setItem('linkedin_oauth_state', state);
      
      // Open LinkedIn authorization
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting LinkedIn:', error);
      toast({
        title: "Error",
        description: "Failed to connect LinkedIn account",
        variant: "destructive",
      });
    }
  };

  const createSocialMediaCampaign = async (campaignData: Partial<SocialMediaCampaign>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('social_media_campaigns')
        .insert([{ ...campaignData, user_id: user.id } as any])
        .select()
        .single();

      if (error) throw error;

      await fetchCampaigns();
      
      toast({
        title: "Success",
        description: "Social media campaign created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: "Failed to create social media campaign",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createSocialMediaTemplate = async (templateData: Partial<SocialMediaTemplate>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('social_media_templates')
        .insert([{ ...templateData, user_id: user.id } as any])
        .select()
        .single();

      if (error) throw error;

      await fetchTemplates();
      
      toast({
        title: "Success",
        description: "Social media template created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create social media template",
        variant: "destructive",
      });
      throw error;
    }
  };

  const sendSocialMediaMessage = async (campaignId: string, messageData: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('social-media-automation', {
        body: {
          action: 'send_linkedin_message',
          campaign_id: campaignId,
          message_data: messageData
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message sent successfully",
      });

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send social media message",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getCampaignMetrics = async (campaignId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('social-media-automation', {
        body: {
          action: 'get_campaign_metrics',
          campaign_id: campaignId
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching campaign metrics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch campaign metrics",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteSocialMediaCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('social_media_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      await fetchCampaigns();
      
      toast({
        title: "Success",
        description: "Social media campaign deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: "Error",
        description: "Failed to delete social media campaign",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPlatforms();
    fetchCampaigns();
    fetchTemplates();
  }, []);

  return {
    platforms,
    campaigns,
    templates,
    loading,
    fetchPlatforms,
    fetchCampaigns,
    fetchTemplates,
    connectLinkedIn,
    createSocialMediaCampaign,
    createSocialMediaTemplate,
    sendSocialMediaMessage,
    getCampaignMetrics,
    deleteSocialMediaCampaign,
  };
};