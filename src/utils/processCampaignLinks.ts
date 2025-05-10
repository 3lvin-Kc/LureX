
import { supabase } from "@/integrations/supabase/client";
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";
import { phishingTrackingService } from "./phishingTrackingService";
import { phishingPageService } from "./phishingPageService";

/**
 * Process a phishing campaign link click
 * This function is used by the edge functions when a tracking link is clicked
 */
export async function processPhishingLinkClick(
  trackingId: string,
  userAgent: string,
  ipAddress: string
): Promise<{
  redirectUrl: string;
  html?: string;
}> {
  try {
    // Get the tracking data and where to redirect
    const { redirectUrl, metadata } = await phishingTrackingService.processLinkClick(
      trackingId,
      userAgent,
      ipAddress
    );
    
    // Check if this is a phishing page (has pageId in metadata)
    if (metadata?.pageId) {
      // Generate the phishing page HTML with tracking
      const html = await phishingPageService.generatePhishingPageHtml(
        metadata.pageId,
        trackingId,
        metadata.campaignId
      );
      
      return { redirectUrl, html };
    }
    
    // If it's a training page
    if (redirectUrl.includes('/training')) {
      const campaignId = metadata?.campaignId;
      const wasPhished = true; // They clicked the link
      
      // Generate training page content
      const html = await phishingPageService.generateTrainingPage(
        campaignId,
        wasPhished
      );
      
      return { redirectUrl, html };
    }
    
    // For other URLs, just redirect
    return { redirectUrl };
  } catch (error) {
    securityLogger.error(
      SecurityEventType.PHISHING_PAGE_ACCESS,
      "Failed to process phishing link click",
      { error, trackingId }
    );
    
    // Return a safe fallback
    return { redirectUrl: '/' };
  }
}

/**
 * Process an email open tracking pixel
 */
export async function processEmailOpen(
  trackingId: string,
  userAgent: string,
  ipAddress: string
): Promise<void> {
  try {
    await phishingTrackingService.recordEmailOpen(
      trackingId,
      userAgent,
      ipAddress
    );
  } catch (error) {
    securityLogger.error(
      SecurityEventType.EMAIL_SEND_ATTEMPT,
      "Failed to process email open tracking",
      { error, trackingId }
    );
  }
}

/**
 * Process a form submission on a phishing page
 */
export async function processFormSubmission(
  trackingId: string,
  formData: Record<string, string>,
  pageId: string
): Promise<void> {
  try {
    await phishingTrackingService.recordFormSubmission(
      trackingId,
      formData,
      pageId
    );
  } catch (error) {
    securityLogger.error(
      SecurityEventType.PHISHING_PAGE_ACCESS,
      "Failed to process form submission",
      { error, trackingId, pageId }
    );
  }
}
