
import { supabase } from "@/integrations/supabase/client";
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";

export interface RealTimeMetric {
  id: string;
  campaignId: string;
  targetEmail: string;
  eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'submitted' | 'reported';
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface MetricUpdate {
  type: 'INSERT' | 'UPDATE';
  record: any;
  oldRecord?: any;
}

type SubscriptionCallback = (metric: RealTimeMetric) => void;
type MetricUpdateCallback = (update: MetricUpdate) => void;

export class RealTimeSubscriptionService {
  private static instance: RealTimeSubscriptionService;
  private subscriptions: Map<string, SubscriptionCallback> = new Map();
  private metricUpdateSubscriptions: Map<string, MetricUpdateCallback> = new Map();
  private channel: any = null;
  private isConnected = false;
  
  private constructor() {
    this.initializeConnection();
  }
  
  public static getInstance(): RealTimeSubscriptionService {
    if (!RealTimeSubscriptionService.instance) {
      RealTimeSubscriptionService.instance = new RealTimeSubscriptionService();
    }
    return RealTimeSubscriptionService.instance;
  }
  
  private async initializeConnection() {
    try {
      this.channel = supabase
        .channel('campaign-metrics-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'campaign_metrics'
          },
          (payload) => this.handleMetricUpdate(payload)
        )
        .subscribe((status) => {
          this.isConnected = status === 'SUBSCRIBED';
          if (this.isConnected) {
            console.log('Real-time subscription established');
            securityLogger.info(
              SecurityEventType.DATA_ACCESS,
              "Real-time subscription established",
              { channel: 'campaign-metrics-realtime' }
            );
          }
        });
    } catch (error) {
      console.error('Failed to initialize real-time connection:', error);
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to initialize real-time connection",
        { error }
      );
    }
  }
  
  private handleMetricUpdate(payload: any) {
    try {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      // Create metric update for raw subscribers
      const metricUpdate: MetricUpdate = {
        type: eventType as 'INSERT' | 'UPDATE',
        record: newRecord,
        oldRecord: oldRecord
      };
      
      // Notify metric update subscribers
      this.metricUpdateSubscriptions.forEach((callback) => {
        try {
          callback(metricUpdate);
        } catch (error) {
          console.error('Error in metric update callback:', error);
        }
      });
      
      // Create formatted real-time metric for standard subscribers
      if (newRecord) {
        const realTimeMetric: RealTimeMetric = {
          id: newRecord.id,
          campaignId: newRecord.campaign_id,
          targetEmail: newRecord.target_email,
          eventType: this.determineEventType(newRecord, oldRecord),
          timestamp: new Date().toISOString(),
          ipAddress: newRecord.ip_address,
          userAgent: newRecord.user_agent,
          metadata: newRecord.additional_data
        };
        
        // Notify standard subscribers
        this.subscriptions.forEach((callback) => {
          try {
            callback(realTimeMetric);
          } catch (error) {
            console.error('Error in real-time subscription callback:', error);
          }
        });
      }
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to handle metric update",
        { error, payload }
      );
    }
  }
  
  private determineEventType(newRecord: any, oldRecord?: any): RealTimeMetric['eventType'] {
    if (newRecord.reported_at && (!oldRecord || !oldRecord.reported_at)) return 'reported';
    if (newRecord.data_submitted_at && (!oldRecord || !oldRecord.data_submitted_at)) return 'submitted';
    if (newRecord.clicked_at && (!oldRecord || !oldRecord.clicked_at)) return 'clicked';
    if (newRecord.opened_at && (!oldRecord || !oldRecord.opened_at)) return 'opened';
    if (newRecord.delivered_at && (!oldRecord || !oldRecord.delivered_at)) return 'delivered';
    if (newRecord.sent_at && (!oldRecord || !oldRecord.sent_at)) return 'sent';
    return 'sent';
  }
  
  public subscribe(id: string, callback: SubscriptionCallback): () => void {
    this.subscriptions.set(id, callback);
    
    return () => {
      this.subscriptions.delete(id);
    };
  }
  
  public subscribeToMetricUpdates(id: string, callback: MetricUpdateCallback): () => void {
    this.metricUpdateSubscriptions.set(id, callback);
    
    return () => {
      this.metricUpdateSubscriptions.delete(id);
    };
  }
  
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
  
  public async disconnect() {
    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.isConnected = false;
      this.subscriptions.clear();
      this.metricUpdateSubscriptions.clear();
    }
  }
  
  public async reconnect() {
    await this.disconnect();
    await this.initializeConnection();
  }
}

export const realTimeSubscriptionService = RealTimeSubscriptionService.getInstance();
