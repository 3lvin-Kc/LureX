
/**
 * Mock phishing page service for frontend-only implementation
 */

import { securityLogger, SecurityEventType } from "@/utils/securityLogger";

export interface PhishingPageData {
  id: string;
  name: string;
  category: string;
  htmlContent: string;
  cssContent?: string;
  jsContent?: string;
  isCustom: boolean;
  sourceUrl?: string;
}

export class PhishingPageService {
  private static instance: PhishingPageService;
  
  private constructor() {}
  
  public static getInstance(): PhishingPageService {
    if (!PhishingPageService.instance) {
      PhishingPageService.instance = new PhishingPageService();
    }
    return PhishingPageService.instance;
  }
  
  public async cloneWebsite(url: string): Promise<PhishingPageData | null> {
    try {
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Mock: Cloning website",
        { url }
      );
      
      // Mock website cloning
      const mockPage: PhishingPageData = {
        id: `mock-${Date.now()}`,
        name: `Cloned from ${url}`,
        category: 'Cloned',
        htmlContent: `<html><body><h1>Mock cloned content from ${url}</h1></body></html>`,
        cssContent: 'body { font-family: Arial; }',
        jsContent: 'console.log("Mock cloned page");',
        isCustom: false,
        sourceUrl: url
      };
      
      return mockPage;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to clone website",
        { error, url }
      );
      return null;
    }
  }
  
  public async generateFromAI(prompt: string): Promise<PhishingPageData | null> {
    try {
      securityLogger.info(
        SecurityEventType.API_ACCESS,
        "Mock: Generating page from AI",
        { prompt }
      );
      
      // Mock AI generation
      const mockPage: PhishingPageData = {
        id: `mock-ai-${Date.now()}`,
        name: `AI Generated: ${prompt.substring(0, 30)}...`,
        category: 'AI Generated',
        htmlContent: `<html><body><h1>AI Generated Content</h1><p>Based on: ${prompt}</p></body></html>`,
        cssContent: 'body { font-family: Arial; background: #f0f0f0; }',
        jsContent: 'console.log("AI generated page");',
        isCustom: true,
        sourceUrl: undefined
      };
      
      return mockPage;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.API_ACCESS,
        "Failed to generate AI page",
        { error, prompt }
      );
      return null;
    }
  }
}

export const phishingPageService = PhishingPageService.getInstance();
