import { supabase } from '@/integrations/supabase/client';

export interface ContextFetchOptions {
  industry_type?: string;
  event_types?: string[];
  company_domain?: string;
  keywords?: string[];
}

export interface CompanyContext {
  company_name: string;
  domain: string;
  industry_estimate: string;
  recent_news: Array<{
    title: string;
    date: string;
    source: string;
  }>;
  estimated_size: string;
}

export interface ContextAwareData {
  context_events: any[];
  company_context?: CompanyContext;
  generated_at: string;
}

export class ContextAwareService {
  private static instance: ContextAwareService;

  static getInstance(): ContextAwareService {
    if (!ContextAwareService.instance) {
      ContextAwareService.instance = new ContextAwareService();
    }
    return ContextAwareService.instance;
  }

  /**
   * Fetch real-time context data for enhanced template personalization
   */
  async fetchContextData(options: ContextFetchOptions): Promise<ContextAwareData | null> {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-context-data', {
        body: options,
      });

      if (error) {
        console.error('Error fetching context data:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in context data service:', error);
      return null;
    }
  }

  /**
   * Get trending topics for industry-specific context
   */
  async getTrendingTopics(industryType: string): Promise<string[]> {
    const industryTopics: Record<string, string[]> = {
      healthcare: [
        'HIPAA compliance updates',
        'medical data security',
        'patient privacy regulations',
        'healthcare cybersecurity',
        'EHR system updates',
        'medical device security',
      ],
      finance: [
        'SEC regulations',
        'financial data protection',
        'banking security updates',
        'PCI DSS compliance',
        'fraud prevention',
        'cryptocurrency regulations',
      ],
      technology: [
        'software vulnerabilities',
        'cloud security',
        'zero-day exploits',
        'API security',
        'DevOps security',
        'data breach incidents',
      ],
      legal: [
        'legal document security',
        'client confidentiality',
        'court filing deadlines',
        'evidence management',
        'compliance audits',
        'regulatory updates',
      ],
      education: [
        'student data privacy',
        'FERPA compliance',
        'campus security',
        'online learning security',
        'research data protection',
        'academic fraud prevention',
      ],
      government: [
        'classified information',
        'government security clearance',
        'public record access',
        'election security',
        'citizen data protection',
        'cybersecurity frameworks',
      ],
    };

    return industryTopics[industryType] || [
      'cybersecurity awareness',
      'data protection',
      'security training',
      'compliance updates',
      'system updates',
      'policy changes',
    ];
  }

  /**
   * Generate context-aware variables for template personalization
   */
  generateContextVariables(
    contextData: ContextAwareData,
    targetData: Record<string, any>
  ): Record<string, string> {
    const variables: Record<string, string> = {};

    // Add company context variables
    if (contextData.company_context) {
      variables.company_name = contextData.company_context.company_name;
      variables.company_domain = contextData.company_context.domain;
      variables.company_size = contextData.company_context.estimated_size;
      variables.industry_type = contextData.company_context.industry_estimate;

      // Add recent news if available
      if (contextData.company_context.recent_news.length > 0) {
        const latestNews = contextData.company_context.recent_news[0];
        variables.recent_company_news = latestNews.title;
        variables.news_date = new Date(latestNews.date).toLocaleDateString();
      }
    }

    // Add context event variables
    if (contextData.context_events.length > 0) {
      const relevantEvent = contextData.context_events
        .sort((a, b) => b.relevance_score - a.relevance_score)[0];

      variables.current_event = relevantEvent.event_title;
      variables.event_description = relevantEvent.event_description || '';
      variables.event_urgency = this.determineUrgency(relevantEvent);

      // Add event-specific data
      if (relevantEvent.event_data) {
        Object.keys(relevantEvent.event_data).forEach(key => {
          variables[`event_${key}`] = String(relevantEvent.event_data[key]);
        });
      }
    }

    // Add time-sensitive variables
    variables.current_quarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;
    variables.current_year = new Date().getFullYear().toString();
    variables.current_month = new Date().toLocaleDateString('en-US', { month: 'long' });

    // Add target-specific enhancements
    if (targetData.department) {
      variables.department_focus = this.getDepartmentFocus(targetData.department);
    }

    if (targetData.position) {
      variables.role_responsibility = this.getRoleResponsibility(targetData.position);
    }

    return variables;
  }

  /**
   * Determine urgency level based on event data
   */
  private determineUrgency(event: any): string {
    if (event.event_data?.urgency) {
      return event.event_data.urgency;
    }

    if (event.relevance_score > 0.8) {
      return 'HIGH';
    } else if (event.relevance_score > 0.6) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  /**
   * Get department-specific focus areas
   */
  private getDepartmentFocus(department: string): string {
    const departmentFocus: Record<string, string> = {
      'IT': 'system security and infrastructure',
      'Finance': 'financial data protection and compliance',
      'HR': 'employee data privacy and security',
      'Legal': 'confidential document management',
      'Marketing': 'customer data protection',
      'Operations': 'business continuity and security',
      'Sales': 'client information security',
    };

    return departmentFocus[department] || 'organizational security';
  }

  /**
   * Get role-specific responsibilities
   */
  private getRoleResponsibility(position: string): string {
    const positionLower = position.toLowerCase();

    if (positionLower.includes('manager') || positionLower.includes('director')) {
      return 'team security oversight and compliance';
    } else if (positionLower.includes('admin')) {
      return 'system administration and access control';
    } else if (positionLower.includes('analyst')) {
      return 'data analysis and security monitoring';
    } else if (positionLower.includes('developer') || positionLower.includes('engineer')) {
      return 'secure development and code review';
    } else {
      return 'security awareness and compliance';
    }
  }

  /**
   * Update context events with real-time data
   */
  async refreshContextEvents(userId: string): Promise<void> {
    try {
      // Mark old events as inactive
      await supabase
        .from('context_events')
        .update({ is_active: false })
        .eq('user_id', userId)
        .lt('event_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      console.log('Context events refreshed successfully');
    } catch (error) {
      console.error('Error refreshing context events:', error);
    }
  }

  /**
   * Get active context events for user
   */
  async getActiveContextEvents(userId: string, limit = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('context_events')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('relevance_score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active context events:', error);
      return [];
    }
  }
}

export const contextAwareService = ContextAwareService.getInstance();