import { supabase } from '@/integrations/supabase/client';

export interface PersonalizationVariable {
  id: string;
  name: string;
  variable_key: string;
  description?: string | null;
  data_source: string;
  data_mapping: any;
  industry_specific: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ContextEvent {
  id: string;
  event_type: string;
  event_title: string;
  event_description?: string | null;
  event_data: any;
  event_date: string;
  relevance_score: number;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface IndustryTemplate {
  id: string;
  industry_type: string;
  template_name: string;
  template_data: any;
  sophistication_level: string;
  created_at: string;
  updated_at: string;
}

export interface DynamicTemplateContent {
  subject: string;
  html_content: string;
  text_content?: string;
  personalization_variables: Record<string, any>;
  context_references: string[];
}

export class IntelligentTemplateEngine {
  private static instance: IntelligentTemplateEngine;

  static getInstance(): IntelligentTemplateEngine {
    if (!IntelligentTemplateEngine.instance) {
      IntelligentTemplateEngine.instance = new IntelligentTemplateEngine();
    }
    return IntelligentTemplateEngine.instance;
  }

  /**
   * Generate personalized template content based on target data and context
   */
  async personalizeTemplate(
    templateId: string,
    targetData: Record<string, any>,
    contextEvents?: ContextEvent[]
  ): Promise<DynamicTemplateContent> {
    try {
      // Fetch template
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      // Get personalization variables
      const variables = await this.extractVariables(template.html_content);
      
      // Generate personalized content
      const personalizedContent = await this.processPersonalization(
        template,
        targetData,
        variables,
        contextEvents
      );

      return personalizedContent;
    } catch (error) {
      console.error('Error personalizing template:', error);
      throw error;
    }
  }

  /**
   * Extract variables from template content
   */
  private extractVariables(content: string): string[] {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      variables.push(match[1].trim());
    }

    return [...new Set(variables)]; // Remove duplicates
  }

  /**
   * Process personalization with real-time adaptation
   */
  private async processPersonalization(
    template: any,
    targetData: Record<string, any>,
    variables: string[],
    contextEvents?: ContextEvent[]
  ): Promise<DynamicTemplateContent> {
    let personalizedSubject = template.subject;
    let personalizedHtml = template.html_content;
    let personalizedText = template.text_content || '';
    const contextReferences: string[] = [];

    // Process each variable
    for (const variable of variables) {
      const value = await this.resolveVariable(variable, targetData, contextEvents);
      
      if (value !== null) {
        const placeholder = `{{${variable}}}`;
        personalizedSubject = personalizedSubject.replace(new RegExp(placeholder, 'g'), value);
        personalizedHtml = personalizedHtml.replace(new RegExp(placeholder, 'g'), value);
        personalizedText = personalizedText.replace(new RegExp(placeholder, 'g'), value);

        // Track context references
        if (contextEvents && this.isContextVariable(variable)) {
          contextReferences.push(variable);
        }
      }
    }

    // Add dynamic contextual elements
    if (contextEvents && contextEvents.length > 0) {
      const contextualContent = await this.generateContextualContent(contextEvents);
      personalizedHtml = this.insertContextualContent(personalizedHtml, contextualContent);
    }

    return {
      subject: personalizedSubject,
      html_content: personalizedHtml,
      text_content: personalizedText,
      personalization_variables: template.personalization_variables || {},
      context_references: contextReferences,
    };
  }

  /**
   * Resolve variable value from various data sources
   */
  private async resolveVariable(
    variable: string,
    targetData: Record<string, any>,
    contextEvents?: ContextEvent[]
  ): Promise<string | null> {
    // Check target data first
    if (targetData[variable]) {
      return targetData[variable];
    }

    // Check custom field mappings
    if (targetData.custom_fields && targetData.custom_fields[variable]) {
      return targetData.custom_fields[variable];
    }

    // Check context events
    if (contextEvents) {
      for (const event of contextEvents) {
        if (event.event_data[variable]) {
          return event.event_data[variable];
        }
      }
    }

    // Generate dynamic values for common variables
    switch (variable) {
      case 'current_date':
        return new Date().toLocaleDateString();
      case 'current_time':
        return new Date().toLocaleTimeString();
      case 'quarter':
        return `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;
      case 'year':
        return new Date().getFullYear().toString();
      case 'last_compliance_date':
        return new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString();
      case 'filing_deadline':
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
      case 'discovery_deadline':
        return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString();
      case 'cvss_score':
        return '9.8';
      case 'affected_systems':
        return 'Production servers, database cluster';
      case 'case_number':
        return `CASE-${Date.now().toString().slice(-6)}`;
      case 'document_count':
        return Math.floor(Math.random() * 500 + 100).toString();
      default:
        return `[${variable}]`; // Placeholder for missing variables
    }
  }

  /**
   * Check if variable is context-related
   */
  private isContextVariable(variable: string): boolean {
    const contextVariables = [
      'current_event', 'company_news', 'security_alert',
      'system_update', 'compliance_deadline', 'industry_update'
    ];
    return contextVariables.includes(variable);
  }

  /**
   * Generate contextual content based on events
   */
  private async generateContextualContent(events: ContextEvent[]): Promise<string> {
    const activeEvents = events.filter(e => e.is_active);
    if (activeEvents.length === 0) return '';

    // Sort by relevance score
    activeEvents.sort((a, b) => b.relevance_score - a.relevance_score);
    const topEvent = activeEvents[0];

    return `
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <strong>Recent Update:</strong> ${topEvent.event_title}<br>
        ${topEvent.event_description ? `<small>${topEvent.event_description}</small>` : ''}
      </div>
    `;
  }

  /**
   * Insert contextual content into template
   */
  private insertContextualContent(html: string, contextualContent: string): string {
    // Insert before the main call-to-action
    const ctaRegex = /<a[^>]*style[^>]*background[^>]*>/i;
    const match = html.match(ctaRegex);
    
    if (match && match.index !== undefined) {
      const insertPosition = match.index;
      return html.slice(0, insertPosition) + contextualContent + html.slice(insertPosition);
    }
    
    // Fallback: insert before closing body/div
    return html.replace(/<\/div>\s*<\/div>\s*$/, contextualContent + '</div></div>');
  }

  /**
   * Get industry-specific templates
   */
  async getIndustryTemplates(industryType: string): Promise<IndustryTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('industry_templates')
        .select('*')
        .eq('industry_type', industryType)
        .order('sophistication_level', { ascending: false });

      if (error) throw error;
      return (data || []) as IndustryTemplate[];
    } catch (error) {
      console.error('Error fetching industry templates:', error);
      return [];
    }
  }

  /**
   * Create template from industry template
   */
  async createFromIndustryTemplate(
    industryTemplateId: string,
    customizations?: Partial<DynamicTemplateContent>
  ): Promise<any> {
    try {
      const { data: industryTemplate, error } = await supabase
        .from('industry_templates')
        .select('*')
        .eq('id', industryTemplateId)
        .single();

      if (error) throw error;

      const templateData = industryTemplate.template_data as any;
      
      const newTemplate = {
        name: customizations?.subject || templateData.subject,
        subject: customizations?.subject || templateData.subject,
        html_content: customizations?.html_content || templateData.html_content,
        text_content: customizations?.text_content || '',
        category: templateData.category,
        industry_type: industryTemplate.industry_type,
        dynamic_content: true,
        personalization_variables: customizations?.personalization_variables || {},
        context_aware: true,
      };

      return newTemplate;
    } catch (error) {
      console.error('Error creating template from industry template:', error);
      throw error;
    }
  }

  /**
   * Analyze template effectiveness and suggest improvements
   */
  async analyzeTemplateEffectiveness(templateId: string): Promise<{
    personalization_score: number;
    context_awareness: number;
    industry_relevance: number;
    suggestions: string[];
  }> {
    try {
      const { data: template, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;

      const variables = this.extractVariables(template.html_content);
      const personalizationScore = Math.min(variables.length * 10, 100);
      const contextAwareness = template.context_aware ? 85 : 15;
      const industryRelevance = template.industry_type !== 'general' ? 90 : 30;

      const suggestions: string[] = [];
      
      if (personalizationScore < 50) {
        suggestions.push('Add more personalization variables like {{first_name}}, {{position}}, {{department}}');
      }
      
      if (!template.context_aware) {
        suggestions.push('Enable context awareness to reference current events and company updates');
      }
      
      if (template.industry_type === 'general') {
        suggestions.push('Specify an industry type for more targeted messaging');
      }

      return {
        personalization_score: personalizationScore,
        context_awareness: contextAwareness,
        industry_relevance: industryRelevance,
        suggestions,
      };
    } catch (error) {
      console.error('Error analyzing template effectiveness:', error);
      throw error;
    }
  }
}

export const intelligentTemplateEngine = IntelligentTemplateEngine.getInstance();