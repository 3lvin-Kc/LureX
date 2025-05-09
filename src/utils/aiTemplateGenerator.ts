
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";
import { supabase } from "@/integrations/supabase/client";

export enum TemplateType {
  EMAIL = 'email',
  SMS = 'sms',
  SOCIAL_MEDIA = 'social_media',
  VOICE_SCRIPT = 'voice_script'
}

export enum IndustryType {
  FINANCE = 'finance',
  HEALTHCARE = 'healthcare',
  TECHNOLOGY = 'technology',
  RETAIL = 'retail',
  MANUFACTURING = 'manufacturing',
  GOVERNMENT = 'government',
  EDUCATION = 'education',
  GENERIC = 'generic'
}

export enum SophisticationLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  TARGETED = 'targeted' // For highly targeted spear phishing
}

export interface TemplateGenerationOptions {
  type: TemplateType;
  industry: IndustryType;
  sophisticationLevel: SophisticationLevel;
  includeLogos?: boolean;
  includeUrgency?: boolean;
  includeSocialEngineering?: boolean;
  targetDemographic?: string;
  brandImpersonation?: string; // e.g., "Microsoft", "PayPal"
  contextualEvent?: string; // e.g., "tax season", "company merger"
  targetedPosition?: string; // e.g., "finance department", "executives"
  language?: string; // Default "en"
  customPrompt?: string; // Additional customization instructions
}

export interface GeneratedTemplate {
  id: string;
  type: TemplateType;
  subject?: string;
  htmlContent?: string;
  textContent: string;
  metadata: {
    industry: IndustryType;
    sophisticationLevel: SophisticationLevel;
    generationOptions: TemplateGenerationOptions;
    aiModel: string;
    generatedAt: string;
    indicators: string[]; // Phishing indicators present in the template
  };
}

/**
 * AI-powered phishing template generator
 * Creates realistic phishing templates based on specified parameters
 */
export class AITemplateGenerator {
  private static instance: AITemplateGenerator;
  
  private constructor() {}
  
  public static getInstance(): AITemplateGenerator {
    if (!AITemplateGenerator.instance) {
      AITemplateGenerator.instance = new AITemplateGenerator();
    }
    return AITemplateGenerator.instance;
  }
  
  /**
   * Generate a new phishing template using the AI model
   */
  public async generateTemplate(
    options: TemplateGenerationOptions
  ): Promise<GeneratedTemplate | null> {
    try {
      // Log the template generation request
      securityLogger.info(
        SecurityEventType.API_ACCESS,
        "Template generation requested",
        { options }
      );
      
      // Call the Supabase Edge Function to generate the template
      const { data, error } = await supabase.functions.invoke("generate-template", {
        body: { options }
      });
      
      if (error) {
        securityLogger.error(
          SecurityEventType.API_ACCESS,
          "Template generation failed",
          { error, options }
        );
        return null;
      }
      
      // Log successful template generation
      securityLogger.info(
        SecurityEventType.API_ACCESS,
        "Template generation successful",
        { templateId: data.id, type: options.type }
      );
      
      return data as GeneratedTemplate;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.API_ACCESS,
        "Error in template generation",
        { error, options }
      );
      return null;
    }
  }
  
  /**
   * Save a generated template to the database
   */
  public async saveTemplate(
    template: GeneratedTemplate
  ): Promise<boolean> {
    try {
      let { type, subject, htmlContent, textContent, metadata } = template;
      
      // Store based on the template type
      if (type === TemplateType.EMAIL) {
        const { error } = await supabase.from("email_templates").insert({
          name: `AI Generated - ${metadata.industry} - ${new Date().toISOString().split('T')[0]}`,
          description: `AI-generated ${metadata.sophisticationLevel} level template for ${metadata.industry} industry`,
          subject: subject || "Important Information", // Fallback subject
          html_content: htmlContent || "",
          text_content: textContent,
          category: metadata.industry
        });
        
        if (error) {
          throw error;
        }
      } else {
        // Handle other template types (SMS, social media, voice script)
        // Would implement additional storage logic for other template types
      }
      
      return true;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to save AI-generated template",
        { error, templateId: template.id }
      );
      return false;
    }
  }
  
  /**
   * Analyze content to detect phishing indicators
   */
  public async analyzePhishingContent(
    content: string
  ): Promise<string[]> {
    try {
      // Call the Supabase Edge Function to analyze the content
      const { data, error } = await supabase.functions.invoke("analyze-phishing", {
        body: { content }
      });
      
      if (error) {
        throw error;
      }
      
      return data.indicators as string[];
    } catch (error) {
      securityLogger.error(
        SecurityEventType.API_ACCESS,
        "Error analyzing phishing content",
        { error }
      );
      return ["Error analyzing content"];
    }
  }
}

export const aiTemplateGenerator = AITemplateGenerator.getInstance();
