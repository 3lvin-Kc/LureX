
import { supabase } from "@/integrations/supabase/client";
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";
import { nanoid } from "nanoid";

export enum PhishingVector {
  EMAIL = 'email',
  SMS = 'sms',
  VOICE = 'voice',
  SOCIAL_MEDIA = 'social_media',
  QR_CODE = 'qr_code',
  USB_DROP = 'usb_drop',
  PHYSICAL_MAIL = 'physical_mail'
}

interface VectorTarget {
  userId: string;
  email?: string;
  phone?: string;
  socialProfiles?: Record<string, string>;
  address?: string;
  name?: string;
  position?: string;
  department?: string;
  customFields?: Record<string, any>;
}

interface VectorTemplate {
  id: string;
  name: string;
  content: string;
  contentType: string; // 'html', 'text', 'script', 'image'
  metadata?: Record<string, any>;
}

interface VectorConfig {
  vector: PhishingVector;
  targets: VectorTarget[];
  template: VectorTemplate;
  sendTime: string;
  callbackUrl?: string; // For reporting results
  redirectUrl?: string; // For multi-stage phishing
  tracking?: boolean;
  customParameters?: Record<string, any>;
}

interface VectorResult {
  id: string;
  status: 'queued' | 'sent' | 'failed' | 'delivered' | 'opened' | 'clicked' | 'submitted';
  target: VectorTarget;
  sentTime?: string;
  deliveredTime?: string;
  openedTime?: string;
  clickedTime?: string;
  submittedTime?: string;
  failureReason?: string;
  deviceInfo?: Record<string, any>;
  locationInfo?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Multi-Vector Phishing Service
 * Handles various phishing vectors beyond just email
 */
export class MultiVectorPhishingService {
  private static instance: MultiVectorPhishingService;
  
  private constructor() {}
  
  public static getInstance(): MultiVectorPhishingService {
    if (!MultiVectorPhishingService.instance) {
      MultiVectorPhishingService.instance = new MultiVectorPhishingService();
    }
    return MultiVectorPhishingService.instance;
  }
  
  /**
   * Launch a phishing vector
   */
  public async launchVector(config: VectorConfig): Promise<string[]> {
    try {
      const vectorIds: string[] = [];
      
      // Log vector launch
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        `Launching ${config.vector} phishing vector`,
        { 
          vector: config.vector,
          targetCount: config.targets.length,
          templateId: config.template.id,
          sendTime: config.sendTime
        }
      );
      
      // Process based on vector type
      switch (config.vector) {
        case PhishingVector.EMAIL:
          return this.launchEmailVector(config);
        
        case PhishingVector.SMS:
          return this.launchSmsVector(config);
        
        case PhishingVector.VOICE:
          return this.launchVoiceVector(config);
          
        case PhishingVector.SOCIAL_MEDIA:
          return this.launchSocialMediaVector(config);
          
        case PhishingVector.QR_CODE:
          return this.launchQrCodeVector(config);
          
        default:
          throw new Error(`Unsupported vector type: ${config.vector}`);
      }
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        `Failed to launch ${config.vector} vector`,
        { error, vector: config.vector }
      );
      return [];
    }
  }
  
  /**
   * Get results for a specific vector
   */
  public async getVectorResults(vectorIds: string[]): Promise<VectorResult[]> {
    try {
      const results: VectorResult[] = [];
      
      // Process based on vector types
      for (const vectorId of vectorIds) {
        // Determine the vector type from the ID prefix
        if (vectorId.startsWith('email_')) {
          // Fetch email tracking results
          const { data, error } = await supabase
            .from("email_tracking")
            .select("*")
            .eq("tracking_id", vectorId.replace('email_', ''));
          
          if (error) throw error;
          
          if (data && data.length > 0) {
            for (const item of data) {
              results.push(this.mapEmailTrackingToVectorResult(item));
            }
          }
        } else if (vectorId.startsWith('sms_')) {
          // Fetch SMS tracking results (if we had an SMS tracking table)
          // Similar implementation for other vectors
        }
      }
      
      return results;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to get vector results",
        { error, vectorIds }
      );
      return [];
    }
  }
  
  /**
   * Launch an email phishing vector
   */
  private async launchEmailVector(config: VectorConfig): Promise<string[]> {
    const vectorIds: string[] = [];
    
    try {
      // Prepare tracking IDs for each target
      const trackingIds: Record<string, string> = {};
      
      for (const target of config.targets) {
        if (!target.email) continue;
        
        const trackingId = `email_${nanoid()}`;
        trackingIds[target.email] = trackingId;
        vectorIds.push(trackingId);
      }
      
      // Call the send-email edge function
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          templateId: config.template.id,
          targetEmails: config.targets.map(t => t.email).filter(Boolean) as string[],
          campaignId: config.customParameters?.campaignId || nanoid(),
          trackingIds,
          subject: config.customParameters?.subject || "Important Notification",
          htmlContent: config.template.contentType === 'html' ? config.template.content : undefined,
          textContent: config.template.contentType === 'text' ? config.template.content : undefined,
          from: config.customParameters?.from || "no-reply@example.com", // Would be replaced with actual sender
          replyTo: config.customParameters?.replyTo
        }
      });
      
      if (error) throw error;
      
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Email vector launched successfully",
        { 
          targetCount: config.targets.length,
          templateId: config.template.id 
        }
      );
      
      return vectorIds;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to launch email vector",
        { error, templateId: config.template.id }
      );
      return [];
    }
  }
  
  /**
   * Launch an SMS phishing vector
   */
  private async launchSmsVector(config: VectorConfig): Promise<string[]> {
    const vectorIds: string[] = [];
    
    try {
      // Prepare tracking IDs for each target
      for (const target of config.targets) {
        if (!target.phone) continue;
        
        const trackingId = `sms_${nanoid()}`;
        vectorIds.push(trackingId);
        
        // Would call an SMS service edge function here
      }
      
      return vectorIds;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to launch SMS vector",
        { error, templateId: config.template.id }
      );
      return [];
    }
  }
  
  /**
   * Launch a voice phishing vector
   */
  private async launchVoiceVector(config: VectorConfig): Promise<string[]> {
    const vectorIds: string[] = [];
    
    try {
      // Placeholder for voice phishing implementation
      // Would integrate with voice/telephony API
      return vectorIds;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to launch voice vector",
        { error, templateId: config.template.id }
      );
      return [];
    }
  }
  
  /**
   * Launch a social media phishing vector
   */
  private async launchSocialMediaVector(config: VectorConfig): Promise<string[]> {
    const vectorIds: string[] = [];
    
    try {
      // Placeholder for social media phishing implementation
      // Would integrate with social media platforms or simulate them
      return vectorIds;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to launch social media vector",
        { error, templateId: config.template.id }
      );
      return [];
    }
  }
  
  /**
   * Launch a QR code phishing vector
   */
  private async launchQrCodeVector(config: VectorConfig): Promise<string[]> {
    const vectorIds: string[] = [];
    
    try {
      // Placeholder for QR code phishing implementation
      // Would generate QR codes pointing to phishing pages
      return vectorIds;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to launch QR code vector",
        { error, templateId: config.template.id }
      );
      return [];
    }
  }
  
  /**
   * Map email tracking data to vector result format
   */
  private mapEmailTrackingToVectorResult(trackingData: any): VectorResult {
    return {
      id: trackingData.tracking_id,
      status: this.determineEmailStatus(trackingData),
      target: {
        userId: trackingData.target_id,
        email: trackingData.email
      },
      sentTime: trackingData.sent_at,
      deliveredTime: trackingData.sent_at, // Assuming delivery is same as sent for email
      openedTime: trackingData.opened_at,
      clickedTime: trackingData.clicked_at,
      metadata: trackingData.metadata
    };
  }
  
  /**
   * Determine email status from tracking data
   */
  private determineEmailStatus(trackingData: any): 'queued' | 'sent' | 'failed' | 'delivered' | 'opened' | 'clicked' | 'submitted' {
    if (trackingData.clicked_at) return 'clicked';
    if (trackingData.opened_at) return 'opened';
    if (trackingData.sent_at) return 'delivered';
    if (trackingData.status === 'failed') return 'failed';
    return 'queued';
  }
}

export const multiVectorPhishing = MultiVectorPhishingService.getInstance();
