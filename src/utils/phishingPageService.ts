
import { supabase } from "@/integrations/supabase/client";
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";

export interface PhishingPageData {
  id: string;
  name: string;
  category: string;
  html_content: string;
  css_content?: string;
  js_content?: string;
  is_custom: boolean;
  source_url?: string;
  created_at: string;
  updated_at: string;
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
  
  public async cloneWebsite(url: string, name: string, category?: string): Promise<PhishingPageData> {
    try {
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Cloning website",
        { url, name }
      );
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await supabase.functions.invoke('clone-website', {
        body: { url, name, category },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to clone website');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Cloning failed');
      }

      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Website cloned successfully",
        { url, name, id: response.data.data.id }
      );

      return response.data.data;
      
    } catch (error: any) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to clone website",
        { error: error.message, url, name }
      );
      throw error;
    }
  }
  
  public async generateFromAI(prompt: string): Promise<PhishingPageData | null> {
    try {
      securityLogger.info(
        SecurityEventType.API_ACCESS,
        "Generating page from AI (placeholder - not implemented)",
        { prompt }
      );
      
      // This would require an AI API integration - placeholder for now
      throw new Error("AI generation not implemented yet - use manual creation or website cloning");
      
    } catch (error: any) {
      securityLogger.error(
        SecurityEventType.API_ACCESS,
        "Failed to generate AI page",
        { error: error.message, prompt }
      );
      throw error;
    }
  }
}

export const phishingPageService = PhishingPageService.getInstance();
