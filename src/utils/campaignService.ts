import { supabase } from "@/integrations/supabase/client";
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";

export interface CampaignData {
  name: string;
  description?: string;
  template_id?: string;
  target_list_id?: string;
  phishing_page_id?: string;
  schedule_time?: string;
}

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  submitted: number;
  reported: number;
}

export class CampaignService {
  private static instance: CampaignService;
  
  private constructor() {}
  
  public static getInstance(): CampaignService {
    if (!CampaignService.instance) {
      CampaignService.instance = new CampaignService();
    }
    return CampaignService.instance;
  }
  
  public async createCampaign(data: CampaignData): Promise<string | null> {
    try {
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert({
          name: data.name,
          description: data.description,
          template_id: data.template_id,
          target_list_id: data.target_list_id,
          phishing_page_id: data.phishing_page_id,
          schedule_time: data.schedule_time,
          status: 'draft',
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Campaign created successfully",
        { campaignId: campaign.id, name: data.name }
      );

      return campaign.id;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to create campaign",
        { error, data }
      );
      return null;
    }
  }
  
  public async startCampaign(campaignId: string): Promise<boolean> {
    try {
      // Update campaign status
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({ status: 'in_progress' })
        .eq('id', campaignId);

      if (updateError) throw updateError;

      // Get campaign details for email sending
      const { data: campaign, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (fetchError || !campaign) throw fetchError || new Error('Campaign not found');

      // Send emails via edge function (now with all required params)
      const { error: sendError } = await supabase.functions.invoke('send-campaign-emails', {
        body: {
          campaignId,
          templateId: campaign.template_id,
          targetListId: campaign.target_list_id
        }
      });

      if (sendError) throw sendError;

      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Campaign started successfully",
        { campaignId }
      );

      return true;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to start campaign",
        { error, campaignId }
      );
      return false;
    }
  }
  
  public async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics | null> {
    try {
      const { data, error } = await supabase.functions.invoke('get-campaign-metrics', {
        body: { campaignId }
      });

      if (error) throw error;

      return data as CampaignMetrics;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to get campaign metrics",
        { error, campaignId }
      );
      return null;
    }
  }
  
  public async pauseCampaign(campaignId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'paused' })
        .eq('id', campaignId);

      if (error) throw error;

      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Campaign paused successfully",
        { campaignId }
      );

      return true;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to pause campaign",
        { error, campaignId }
      );
      return false;
    }
  }
  
  public async cancelCampaign(campaignId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'canceled' })
        .eq('id', campaignId);

      if (error) throw error;

      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Campaign canceled successfully",
        { campaignId }
      );

      return true;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to cancel campaign",
        { error, campaignId }
      );
      return false;
    }
  }
}

export const campaignService = CampaignService.getInstance();