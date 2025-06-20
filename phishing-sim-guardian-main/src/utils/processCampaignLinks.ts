
/**
 * Mock campaign link processing for frontend-only implementation
 */

import { securityLogger, SecurityEventType } from "@/utils/securityLogger";

export async function processPhishingLinkClick(
  trackingId: string,
  userAgent: string,
  ipAddress: string
): Promise<{
  redirectUrl: string;
  html?: string;
}> {
  try {
    // Mock implementation - would normally interact with backend
    console.log('Mock: Processing phishing link click', { trackingId, userAgent, ipAddress });
    
    // Return mock training page
    return { 
      redirectUrl: '/training',
      html: '<div>Training content would be generated here</div>'
    };
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
  console.log('Mock: Processing email open', { trackingId, userAgent, ipAddress });
}

export async function processFormSubmission(
  trackingId: string,
  formData: Record<string, string>,
  pageId: string
): Promise<void> {
  console.log('Mock: Processing form submission', { trackingId, formData, pageId });
}
