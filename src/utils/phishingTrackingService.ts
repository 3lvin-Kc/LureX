
import { supabase } from "@/integrations/supabase/client";
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";
import { nanoid } from "nanoid";

/**
 * Service for tracking and managing phishing simulation links
 * Implements the tracking mechanism described in the phishing.md documentation
 */
export class PhishingTrackingService {
  private static instance: PhishingTrackingService;
  
  private constructor() {}
  
  public static getInstance(): PhishingTrackingService {
    if (!PhishingTrackingService.instance) {
      PhishingTrackingService.instance = new PhishingTrackingService();
    }
    return PhishingTrackingService.instance;
  }
  
  /**
   * Generate tracking links for a campaign
   * @param campaignId The campaign ID
   * @param targets List of target emails
   * @param redirectUrl The phishing page or training page URL
   * @returns Object mapping email to tracking link
   */
  public async generateTrackingLinks(
    campaignId: string,
    targets: { id: string, email: string }[],
    redirectUrl: string
  ): Promise<Record<string, string>> {
    try {
      const trackingLinks: Record<string, string> = {};
      const baseTrackingUrl = "https://sfsloprgxcwjjzjiwkmc.supabase.co/functions/v1/track-click";
      const now = new Date().toISOString();
      const trackingEntries = [];
      
      // Create tracking entries for each target
      for (const target of targets) {
        const trackingId = nanoid();
        
        trackingEntries.push({
          campaign_id: campaignId,
          target_id: target.id,
          email: target.email,
          tracking_id: trackingId,
          status: "pending",
          created_at: now,
        });
        
        // Create the tracking URL that will redirect to the phishing page
        const encodedRedirectUrl = encodeURIComponent(redirectUrl);
        trackingLinks[target.email] = `${baseTrackingUrl}?tid=${trackingId}&url=${encodedRedirectUrl}`;
      }
      
      // Insert tracking records into database
      const { error } = await supabase
        .from("email_tracking")
        .insert(trackingEntries);
      
      if (error) {
        throw error;
      }
      
      securityLogger.info(
        SecurityEventType.CAMPAIGN_CREATION,
        "Generated tracking links for campaign",
        { campaignId, targetCount: targets.length }
      );
      
      return trackingLinks;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.CAMPAIGN_CREATION,
        "Failed to generate tracking links",
        { error, campaignId }
      );
      return {};
    }
  }
  
  /**
   * Process a tracking link click
   * This is called by the edge function when a user clicks a link
   * @param trackingId The tracking ID from the URL
   * @param userAgent The user agent information
   * @param ipAddress The IP address of the clicker
   * @returns Information about where to redirect the user
   */
  public async processLinkClick(
    trackingId: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ redirectUrl: string, metadata: any }> {
    try {
      // Find the tracking record
      const { data, error } = await supabase
        .from("email_tracking")
        .select("*")
        .eq("tracking_id", trackingId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update the tracking record with click information
      const now = new Date().toISOString();
      const metadataObj = data.metadata && typeof data.metadata === 'object' ? data.metadata : {};
      
      const updatedMetadata = {
        ...metadataObj,
        clicked_at: now,
        user_agent: userAgent,
        ip_address: ipAddress,
        click_count: (data.clicked_count || 0) + 1
      };
      
      await supabase
        .from("email_tracking")
        .update({
          clicked_at: data.clicked_at || now,
          clicked_count: (data.clicked_count || 0) + 1,
          metadata: updatedMetadata
        })
        .eq("tracking_id", trackingId);
      
      securityLogger.info(
        SecurityEventType.PHISHING_PAGE_ACCESS,
        "Phishing link clicked",
        { 
          trackingId, 
          campaignId: data.campaign_id,
          email: data.email,
          metadata: updatedMetadata
        }
      );
      
      // Determine redirect URL
      let redirectUrl = '/';
      if (metadataObj && 'redirect_url' in metadataObj) {
        redirectUrl = String(metadataObj.redirect_url);
      }
      
      // Return destination information
      return { 
        redirectUrl,
        metadata: data 
      };
    } catch (error) {
      securityLogger.error(
        SecurityEventType.PHISHING_PAGE_ACCESS,
        "Failed to process link click",
        { error, trackingId }
      );
      
      // Return a safe default
      return { redirectUrl: '/', metadata: {} };
    }
  }
  
  /**
   * Record when a phishing page is opened (through tracking pixel)
   * @param trackingId The tracking ID
   * @param userAgent The user agent information 
   * @param ipAddress The IP address
   */
  public async recordEmailOpen(
    trackingId: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      // Find the tracking record
      const { data, error } = await supabase
        .from("email_tracking")
        .select("*")
        .eq("tracking_id", trackingId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update the tracking record with open information
      const now = new Date().toISOString();
      const metadataObj = data.metadata && typeof data.metadata === 'object' ? data.metadata : {};
      
      const updatedMetadata = {
        ...metadataObj,
        opened_at: now,
        user_agent: userAgent,
        ip_address: ipAddress,
        open_count: (data.opened_count || 0) + 1
      };
      
      await supabase
        .from("email_tracking")
        .update({
          opened_at: data.opened_at || now,
          opened_count: (data.opened_count || 0) + 1,
          metadata: updatedMetadata
        })
        .eq("tracking_id", trackingId);
      
      securityLogger.info(
        SecurityEventType.EMAIL_SEND_ATTEMPT,
        "Phishing email opened",
        { 
          trackingId, 
          campaignId: data.campaign_id,
          email: data.email,
          metadata: updatedMetadata
        }
      );
    } catch (error) {
      securityLogger.error(
        SecurityEventType.EMAIL_SEND_ATTEMPT,
        "Failed to record email open",
        { error, trackingId }
      );
    }
  }
  
  /**
   * Record form submission on phishing page
   * @param trackingId The tracking ID
   * @param formData The submitted form data (passwords are not stored)
   * @param pageId The phishing page ID
   */
  public async recordFormSubmission(
    trackingId: string,
    formData: Record<string, string>,
    pageId: string
  ): Promise<void> {
    try {
      // Find the tracking record
      const { data, error } = await supabase
        .from("email_tracking")
        .select("*")
        .eq("tracking_id", trackingId)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Remove sensitive information from form data before storing
      // We NEVER store actual passwords or credentials
      const sanitizedFormData: Record<string, string> = {};
      for (const [key, value] of Object.entries(formData)) {
        // Skip password fields entirely - don't even store placeholders
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('credential') ||
            key.toLowerCase().includes('secret') ||
            key.toLowerCase().includes('token')) {
          continue;
        }
        sanitizedFormData[key] = value;
      }
      
      // Record the form submission
      await supabase.from("phishing_forms").insert({
        page_id: pageId,
        form_data: sanitizedFormData,
      });
      
      // Update the tracking record
      const now = new Date().toISOString();
      const metadataObj = data.metadata && typeof data.metadata === 'object' ? data.metadata : {};
      
      const updatedMetadata = {
        ...metadataObj,
        submitted_at: now,
        submitted: true,
        form_fields_count: Object.keys(formData).length
      };
      
      await supabase
        .from("email_tracking")
        .update({
          metadata: updatedMetadata
        })
        .eq("tracking_id", trackingId);
      
      securityLogger.info(
        SecurityEventType.PHISHING_PAGE_ACCESS,
        "Phishing form submitted",
        { 
          trackingId, 
          campaignId: data.campaign_id,
          email: data.email,
          pageId,
          fieldCount: Object.keys(formData).length
        }
      );
    } catch (error) {
      securityLogger.error(
        SecurityEventType.PHISHING_PAGE_ACCESS,
        "Failed to record form submission",
        { error, trackingId, pageId }
      );
    }
  }
  
  /**
   * Get campaign tracking statistics
   * @param campaignId The campaign ID
   * @returns Campaign statistics 
   */
  public async getCampaignStats(campaignId: string): Promise<{
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    submitted: number;
  }> {
    try {
      const { data, error } = await supabase
        .from("email_tracking")
        .select("*")
        .eq("campaign_id", campaignId);
      
      if (error) {
        throw error;
      }
      
      const stats = {
        sent: data.filter(item => item.sent_at).length,
        delivered: data.filter(item => item.sent_at).length, // Assuming delivered = sent for email
        opened: data.filter(item => item.opened_at).length,
        clicked: data.filter(item => item.clicked_at).length,
        submitted: data.filter(item => {
          const metadata = item.metadata;
          return metadata && 
                 typeof metadata === 'object' && 
                 'submitted' in metadata && 
                 metadata.submitted === true;
        }).length
      };
      
      return stats;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to get campaign stats",
        { error, campaignId }
      );
      
      return {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        submitted: 0
      };
    }
  }
}

export const phishingTrackingService = PhishingTrackingService.getInstance();
