
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";
import { supabase } from "@/integrations/supabase/client";
import { apiRateLimiter } from "@/utils/rateLimiter";
import { nanoid } from "nanoid";

export enum AttackVector {
  EMAIL = 'email',
  SMS = 'sms',
  SOCIAL_MEDIA = 'social_media',
  VOICE = 'voice',
  MULTI_STAGE = 'multi_stage'
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  FAILED = 'failed'
}

export interface TargetInfo {
  id: string;
  email?: string;
  phone?: string;
  socialProfiles?: string[];
  firstName?: string;
  lastName?: string;
  position?: string;
  department?: string;
  customFields?: Record<string, any>;
}

export interface CampaignMetrics {
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  dataSubmittedCount: number;
  reportedCount: number;
  failedCount: number;
  updateTime: string;
}

export interface CampaignSchedule {
  startTime: string;
  endTime?: string;
  timeZone?: string;
  staggered?: boolean; // Whether to send in batches over time
  staggerInterval?: number; // Minutes between batches
  maxBatchSize?: number; // Maximum targets per batch
  workHoursOnly?: boolean; // Only send during work hours
  excludeWeekends?: boolean; // Don't send on weekends
}

export interface CampaignVariant {
  id: string;
  name: string;
  templateId: string;
  distributionPercentage: number;
}

export interface CampaignOptions {
  name: string;
  description?: string;
  vectors: AttackVector[];
  targetListId: string;
  schedule: CampaignSchedule;
  primaryTemplateId: string; // Main template to use
  variants?: CampaignVariant[]; // For A/B testing
  providerId: string; // Email provider, SMS service, etc.
  landingPageId?: string; // Phishing page to use
  dynamicContent?: boolean; // Whether to personalize content
  advancedTracking?: boolean; // Use advanced tracking features
  useAi?: boolean; // Use AI to customize attacks
  remediationTraining?: string; // Training to show after user falls for phish
}

/**
 * Automated Campaign Service
 * Manages the entire lifecycle of phishing simulation campaigns
 */
export class AutomatedCampaignService {
  private static instance: AutomatedCampaignService;
  private activeMonitors: Map<string, NodeJS.Timeout> = new Map();
  
  private constructor() {
    // Initialize active campaign monitors on startup
    this.initializeActiveMonitors();
  }
  
  public static getInstance(): AutomatedCampaignService {
    if (!AutomatedCampaignService.instance) {
      AutomatedCampaignService.instance = new AutomatedCampaignService();
    }
    return AutomatedCampaignService.instance;
  }
  
  /**
   * Initialize monitoring for active campaigns
   */
  private async initializeActiveMonitors(): Promise<void> {
    try {
      // Get all active campaigns
      const { data: activeCampaigns, error } = await supabase
        .from("campaigns")
        .select("*")
        .in("status", ["scheduled", "in_progress"]);
      
      if (error) {
        throw error;
      }
      
      // Set up monitoring for each active campaign
      for (const campaign of activeCampaigns) {
        this.setupCampaignMonitor(campaign.id);
      }
      
      securityLogger.info(
        SecurityEventType.AUTHORIZATION,
        "Campaign monitoring initialized",
        { activeCampaigns: activeCampaigns.length }
      );
    } catch (error) {
      securityLogger.error(
        SecurityEventType.AUTHORIZATION,
        "Failed to initialize campaign monitors",
        { error }
      );
    }
  }
  
  /**
   * Create a new campaign with advanced options
   */
  public async createCampaign(options: CampaignOptions): Promise<string | null> {
    // Rate limiting check for API abuse prevention
    if (!apiRateLimiter.tryRequest()) {
      securityLogger.warn(
        SecurityEventType.RATE_LIMIT,
        "Campaign creation rate limit exceeded",
        { options }
      );
      return null;
    }
    
    try {
      const campaignId = nanoid();
      
      // Create the base campaign
      const { error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          id: campaignId,
          name: options.name,
          description: options.description,
          status: CampaignStatus.DRAFT,
          provider_id: options.providerId,
          target_list_id: options.targetListId,
          template_id: options.primaryTemplateId,
          schedule_time: options.schedule.startTime,
          end_time: options.schedule.endTime
        });
      
      if (campaignError) {
        throw campaignError;
      }
      
      // Create campaign variants if specified
      if (options.variants && options.variants.length > 0) {
        for (const variant of options.variants) {
          const { error: variantError } = await supabase
            .from("campaign_variants")
            .insert({
              campaign_id: campaignId,
              variant_name: variant.name,
              template_id: variant.templateId,
              distribution_percentage: variant.distributionPercentage
            });
          
          if (variantError) {
            throw variantError;
          }
        }
      }
      
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Campaign created successfully",
        { campaignId, name: options.name }
      );
      
      return campaignId;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to create campaign",
        { error, options }
      );
      return null;
    }
  }
  
  /**
   * Start a campaign immediately or schedule it for later
   */
  public async startCampaign(campaignId: string, startNow: boolean = true): Promise<boolean> {
    try {
      // Get campaign details
      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();
      
      if (campaignError) {
        throw campaignError;
      }
      
      if (campaign.status !== CampaignStatus.DRAFT) {
        throw new Error("Only draft campaigns can be started");
      }
      
      // If starting now, queue the campaign
      if (startNow) {
        const response = await supabase.functions.invoke("queue-campaign", {
          body: { campaignId }
        });
        
        if (response.error) {
          throw response.error;
        }
        
        // Set up monitoring for the campaign
        this.setupCampaignMonitor(campaignId);
        
        securityLogger.info(
          SecurityEventType.DATA_ACCESS,
          "Campaign started successfully",
          { campaignId, name: campaign.name }
        );
      } else {
        // Just mark as scheduled if not starting now
        const { error: updateError } = await supabase
          .from("campaigns")
          .update({ status: CampaignStatus.SCHEDULED })
          .eq("id", campaignId);
        
        if (updateError) {
          throw updateError;
        }
        
        // Set up monitoring for scheduled campaign
        this.setupCampaignMonitor(campaignId);
        
        securityLogger.info(
          SecurityEventType.DATA_ACCESS,
          "Campaign scheduled successfully",
          { 
            campaignId, 
            name: campaign.name, 
            scheduledFor: campaign.schedule_time 
          }
        );
      }
      
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
  
  /**
   * Pause an ongoing campaign
   */
  public async pauseCampaign(campaignId: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke("pause-campaign", {
        body: { campaignId }
      });
      
      if (error) {
        throw error;
      }
      
      // Clear the monitor if it exists
      if (this.activeMonitors.has(campaignId)) {
        clearInterval(this.activeMonitors.get(campaignId));
        this.activeMonitors.delete(campaignId);
      }
      
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
  
  /**
   * Cancel a campaign entirely
   */
  public async cancelCampaign(campaignId: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke("cancel-campaign", {
        body: { campaignId }
      });
      
      if (error) {
        throw error;
      }
      
      // Clear the monitor if it exists
      if (this.activeMonitors.has(campaignId)) {
        clearInterval(this.activeMonitors.get(campaignId));
        this.activeMonitors.delete(campaignId);
      }
      
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
  
  /**
   * Get real-time metrics for a campaign
   */
  public async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics | null> {
    try {
      const { data, error } = await supabase.functions.invoke("campaign-metrics", {
        body: { campaignId }
      });
      
      if (error) {
        throw error;
      }
      
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
  
  /**
   * Set up automatic monitoring for a campaign
   */
  private setupCampaignMonitor(campaignId: string): void {
    // Clear existing monitor if present
    if (this.activeMonitors.has(campaignId)) {
      clearInterval(this.activeMonitors.get(campaignId));
    }
    
    // Create a monitor that checks campaign status every minute
    const monitorInterval = setInterval(async () => {
      try {
        const { data: campaign, error } = await supabase
          .from("campaigns")
          .select("id, status, schedule_time, end_time")
          .eq("id", campaignId)
          .single();
        
        if (error) {
          throw error;
        }
        
        // If campaign is no longer active, stop monitoring
        if (campaign.status === CampaignStatus.COMPLETED || 
            campaign.status === CampaignStatus.CANCELED || 
            campaign.status === CampaignStatus.FAILED) {
          clearInterval(monitorInterval);
          this.activeMonitors.delete(campaignId);
          return;
        }
        
        // If campaign is scheduled and it's time to start
        if (campaign.status === CampaignStatus.SCHEDULED) {
          const scheduleTime = new Date(campaign.schedule_time);
          const now = new Date();
          
          if (now >= scheduleTime) {
            // Start the campaign
            await supabase.functions.invoke("queue-campaign", {
              body: { campaignId }
            });
          }
        }
        
        // If campaign has reached its end time
        if (campaign.status === CampaignStatus.IN_PROGRESS && campaign.end_time) {
          const endTime = new Date(campaign.end_time);
          const now = new Date();
          
          if (now >= endTime) {
            // Mark campaign as completed
            await supabase.functions.invoke("complete-campaign", {
              body: { campaignId }
            });
            
            clearInterval(monitorInterval);
            this.activeMonitors.delete(campaignId);
          }
        }
      } catch (error) {
        securityLogger.error(
          SecurityEventType.AUTHORIZATION,
          "Error in campaign monitor",
          { error, campaignId }
        );
      }
    }, 60000); // Check every minute
    
    // Store the monitor interval
    this.activeMonitors.set(campaignId, monitorInterval);
  }
}

export const automatedCampaignService = AutomatedCampaignService.getInstance();
