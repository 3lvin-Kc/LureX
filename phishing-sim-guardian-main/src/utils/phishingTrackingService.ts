
/**
 * Mock phishing tracking service for frontend-only implementation
 */

import { securityLogger, SecurityEventType } from "@/utils/securityLogger";

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
    targetId: string,
    eventType: TrackingEvent['eventType'],
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        `Mock: Tracking ${eventType} event`,
        { campaignId, targetId, eventType, metadata }
      );
      
      // Mock tracking - just log the event
      console.log('Mock tracking event:', {
        campaignId,
        targetId,
        eventType,
        timestamp: new Date().toISOString(),
        metadata
      });
      
      return true;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to track event",
        { error, campaignId, targetId, eventType }
      );
      return false;
    }
  }
  
  public async getCampaignMetrics(campaignId: string): Promise<Record<string, number>> {
    try {
      // Mock metrics
      const metrics = {
        sent: 100,
        delivered: 95,
        opened: 45,
        clicked: 12,
        submitted: 8
      };
      
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Mock: Retrieved campaign metrics",
        { campaignId, metrics }
      );
      
      return metrics;
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
