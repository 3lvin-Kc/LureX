
/**
 * Real phishing tracking service with Supabase integration
 */

import { securityLogger, SecurityEventType } from "@/utils/securityLogger";
import { supabase } from "@/integrations/supabase/client";

export interface TrackingEvent {
  id: string;
  campaignId: string;
  targetId: string;
  eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'submitted';
  timestamp: string;
  metadata?: Record<string, any>;
}

export class PhishingTrackingService {
  private static instance: PhishingTrackingService;
  
  private constructor() {}
  
  public static getInstance(): PhishingTrackingService {
    if (!PhishingTrackingService.instance) {
      PhishingTrackingService.instance = new PhishingTrackingService();
    }
    return PhishingTrackingService.instance;
  }
  
  public async trackEvent(
    campaignId: string,
    targetEmail: string,
    eventType: TrackingEvent['eventType'],
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      // Use appropriate edge function based on event type
      let functionName = '';
      switch (eventType) {
        case 'opened':
          functionName = 'track-email-open';
          break;
        case 'clicked':
          functionName = 'track-email-click';
          break;
        default:
          // For other events, we'll create metrics directly
          break;
      }

      if (functionName) {
        const { error } = await supabase.functions.invoke(functionName, {
          body: {
            campaignId,
            targetEmail,
            userAgent: metadata?.userAgent || '',
            ipAddress: metadata?.ipAddress || ''
          }
        });

        if (error) throw error;
      } else {
        // Handle form submissions and other events directly
        const updateData: any = {
          campaign_id: campaignId,
          target_email: targetEmail,
          additional_data: metadata
        };

        if (eventType === 'submitted') {
          updateData.data_submitted_at = new Date().toISOString();
        }

        const { error } = await supabase
          .from('campaign_metrics')
          .upsert(updateData, {
            onConflict: 'campaign_id,target_email'
          });

        if (error) throw error;
      }

      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        `Tracking ${eventType} event`,
        { campaignId, targetEmail, eventType, metadata }
      );
      
      return true;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to track event",
        { error, campaignId, targetEmail, eventType }
      );
      return false;
    }
  }
  
  public async getCampaignMetrics(campaignId: string): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase.functions.invoke('get-campaign-metrics', {
        body: { campaignId }
      });

      if (error) throw error;
      
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Retrieved campaign metrics",
        { campaignId, metrics: data }
      );
      
      return data || {};
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to get campaign metrics",
        { error, campaignId }
      );
      return {};
    }
  }
}

export const phishingTrackingService = PhishingTrackingService.getInstance();
