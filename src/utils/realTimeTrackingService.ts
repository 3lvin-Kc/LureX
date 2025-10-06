
import { supabase } from "@/integrations/supabase/client";
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";

export interface RealTimeEvent {
  id: string;
  campaignId: string;
  targetEmail: string;
  eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'submitted' | 'reported' | 'file_downloaded';
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  metadata?: Record<string, any>;
}

export class RealTimeTrackingService {
  private static instance: RealTimeTrackingService;
  private subscribers: Map<string, (event: RealTimeEvent) => void> = new Map();
  
  private constructor() {
    this.setupRealtimeSubscription();
  }
  
  public static getInstance(): RealTimeTrackingService {
    if (!RealTimeTrackingService.instance) {
      RealTimeTrackingService.instance = new RealTimeTrackingService();
    }
    return RealTimeTrackingService.instance;
  }
  
  private setupRealtimeSubscription() {
    const channel = supabase
      .channel('campaign-metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_metrics'
        },
        (payload) => {
          console.log('Real-time campaign metrics update:', payload);
          this.handleRealtimeUpdate(payload);
        }
      )
      .subscribe();

    securityLogger.info(
      SecurityEventType.DATA_ACCESS,
      "Real-time tracking subscription established",
      { channel: 'campaign-metrics-changes' }
    );
  }
  
  private async handleRealtimeUpdate(payload: any) {
    try {
      const { new: newRecord, old: oldRecord, eventType } = payload;
      
      if (eventType === 'INSERT' || eventType === 'UPDATE') {
        const event: RealTimeEvent = {
          id: newRecord.id,
          campaignId: newRecord.campaign_id,
          targetEmail: newRecord.target_email,
          eventType: this.determineEventType(newRecord, oldRecord),
          timestamp: new Date().toISOString(),
          ipAddress: newRecord.ip_address,
          userAgent: newRecord.user_agent,
          metadata: newRecord.additional_data
        };
        
         //Resolve geographic location if IP address is available
        if (newRecord.ip_address) {
          event.location = await this.resolveGeographicLocation(newRecord.ip_address);
        }
        
        // Notify all subscribers
        this.notifySubscribers(event);
      }
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to handle real-time update",
        { error, payload }
      );
    }
  }
  
  private determineEventType(newRecord: any, oldRecord?: any): RealTimeEvent['eventType'] {
    if (newRecord.reported_at && (!oldRecord || !oldRecord.reported_at)) return 'reported';
    if (newRecord.data_submitted_at && (!oldRecord || !oldRecord.data_submitted_at)) return 'submitted';
    if (newRecord.file_downloaded_at && (!oldRecord || !oldRecord.file_downloaded_at)) return 'file_downloaded';
    if (newRecord.clicked_at && (!oldRecord || !oldRecord.clicked_at)) return 'clicked';
    if (newRecord.opened_at && (!oldRecord || !oldRecord.opened_at)) return 'opened';
    if (newRecord.delivered_at && (!oldRecord || !oldRecord.delivered_at)) return 'delivered';
    if (newRecord.sent_at && (!oldRecord || !oldRecord.sent_at)) return 'sent';
    return 'sent';
  }
  
  private async resolveGeographicLocation(ipAddress: string) {
    try {
      // Use ipapi.co for IP geolocation (free tier available)
      const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
      const data = await response.json();
      
      if (response.ok && !data.error) {
        return {
          country: data.country_name,
          region: data.region,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude
        };
      }
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to resolve geographic location",
        { error, ipAddress }
      );
    }
    return undefined;
  }
  
  private notifySubscribers(event: RealTimeEvent) {
    this.subscribers.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in real-time tracking subscriber:', error);
      }
    });
  }
  
  public subscribe(id: string, callback: (event: RealTimeEvent) => void) {
    this.subscribers.set(id, callback);
    
    return () => {
      this.subscribers.delete(id);
    };
  }
  
  public async trackEvent(campaignId: string, targetEmail: string, eventType: RealTimeEvent['eventType'], metadata?: Record<string, any>) {
    try {
      const { error } = await supabase
        .from('campaign_metrics')
        .upsert({
          campaign_id: campaignId,
          target_email: targetEmail,
          [`${eventType}_at`]: new Date().toISOString(),
          additional_data: metadata || {}
        }, {
          onConflict: 'campaign_id,target_email'
        });

      if (error) throw error;

      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        `Tracked ${eventType} event`,
        { campaignId, targetEmail, eventType }
      );
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to track event",
        { error, campaignId, targetEmail, eventType }
      );
    }
  }
}

export const realTimeTrackingService = RealTimeTrackingService.getInstance();
