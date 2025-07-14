
/**
 * Real campaign link processing with Supabase integration
 */

import { securityLogger, SecurityEventType } from "@/utils/securityLogger";
import { supabase } from "@/integrations/supabase/client";

export async function processPhishingLinkClick(
  trackingId: string,
  userAgent: string,
  ipAddress: string
): Promise<{
  redirectUrl: string;
  html?: string;
}> {
  try {
    // Use serve-phishing-page edge function
    const { data, error } = await supabase.functions.invoke('serve-phishing-page', {
      body: {
        trackingId,
        userAgent,
        ipAddress
      }
    });

    if (error) throw error;

    securityLogger.info(
      SecurityEventType.PHISHING_PAGE_ACCESS,
      "Phishing link processed successfully",
      { trackingId }
    );
    
    return data || { redirectUrl: '/training' };
  } catch (error) {
    securityLogger.error(
      SecurityEventType.PHISHING_PAGE_ACCESS,
      "Failed to process phishing link click",
      { error, trackingId }
    );
    
    return { redirectUrl: '/' };
  }
}

export async function processEmailOpen(
  trackingId: string,
  userAgent: string,
  ipAddress: string
): Promise<void> {
  try {
    await supabase.functions.invoke('track-email-open', {
      body: {
        trackingId,
        userAgent,
        ipAddress
      }
    });
  } catch (error) {
    securityLogger.error(
      SecurityEventType.DATA_ACCESS,
      "Failed to process email open",
      { error, trackingId }
    );
  }
}

export async function processFormSubmission(
  trackingId: string,
  formData: Record<string, string>,
  pageId: string
): Promise<void> {
  try {
    // Track form submission directly via tracking service
    const { phishingTrackingService } = await import('./phishingTrackingService');
    
    await phishingTrackingService.trackEvent(
      trackingId,
      formData.email || 'unknown',
      'submitted',
      { formData, pageId }
    );
  } catch (error) {
    securityLogger.error(
      SecurityEventType.DATA_ACCESS,
      "Failed to process form submission",
      { error, trackingId, pageId }
    );
  }
}
