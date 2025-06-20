
/**
 * Mock AI template generator for frontend-only implementation
 */

import { securityLogger, SecurityEventType } from "@/utils/securityLogger";

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
  TARGETED = 'targeted'
}

export interface TemplateGenerationOptions {
  type: TemplateType;
  industry: IndustryType;
  sophisticationLevel: SophisticationLevel;
  includeLogos?: boolean;
  includeUrgency?: boolean;
  includeSocialEngineering?: boolean;
  targetDemographic?: string;
  brandImpersonation?: string;
  contextualEvent?: string;
  targetedPosition?: string;
  language?: string;
  customPrompt?: string;
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
    indicators: string[];
  };
}

export class AITemplateGenerator {
  private static instance: AITemplateGenerator;
  
  private constructor() {}
  
  public static getInstance(): AITemplateGenerator {
    if (!AITemplateGenerator.instance) {
      AITemplateGenerator.instance = new AITemplateGenerator();
    }
    return AITemplateGenerator.instance;
  }
  
  public async generateTemplate(
    options: TemplateGenerationOptions
  ): Promise<GeneratedTemplate | null> {
    try {
      securityLogger.info(
        SecurityEventType.API_ACCESS,
        "Mock: Template generation requested",
        { options }
      );
      
      // Mock template generation
      const mockTemplate: GeneratedTemplate = {
        id: `mock-${Date.now()}`,
        type: options.type,
        subject: `Mock ${options.industry} Template`,
        htmlContent: `<div>Mock HTML content for ${options.industry} industry</div>`,
        textContent: `Mock text content for ${options.industry} industry`,
        metadata: {
          industry: options.industry,
          sophisticationLevel: options.sophisticationLevel,
          generationOptions: options,
          aiModel: "mock-ai",
          generatedAt: new Date().toISOString(),
          indicators: ["Mock indicator 1", "Mock indicator 2"]
        }
      };
      
      return mockTemplate;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.API_ACCESS,
        "Error in mock template generation",
        { error, options }
      );
      return null;
    }
  }
  
  public async saveTemplate(template: GeneratedTemplate): Promise<boolean> {
    try {
      // Mock save - would normally save to database
      console.log('Mock: Saving template', template);
      return true;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to save mock template",
        { error, templateId: template.id }
      );
      return false;
    }
  }
  
  public async analyzePhishingContent(content: string): Promise<string[]> {
    console.log('Mock: Analyzing phishing content', content);
    return ["Mock phishing indicator"];
  }
}

export const aiTemplateGenerator = AITemplateGenerator.getInstance();
