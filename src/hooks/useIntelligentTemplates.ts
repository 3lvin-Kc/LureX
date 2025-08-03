import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { 
  IntelligentTemplateEngine,
  PersonalizationVariable,
  ContextEvent,
  IndustryTemplate,
  DynamicTemplateContent
} from '@/utils/intelligentTemplateEngine';

export const useIntelligentTemplates = () => {
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState<PersonalizationVariable[]>([]);
  const [contextEvents, setContextEvents] = useState<ContextEvent[]>([]);
  const [industryTemplates, setIndustryTemplates] = useState<IndustryTemplate[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const engine = IntelligentTemplateEngine.getInstance();

  /**
   * Fetch personalization variables
   */
  const fetchVariables = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('template_variables')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVariables((data || []) as PersonalizationVariable[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load personalization variables",
        variant: "destructive",
      });
    }
  };

  /**
   * Create personalization variable
   */
  const createVariable = async (variable: Omit<PersonalizationVariable, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('template_variables')
        .insert([{
          ...variable,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      
      setVariables(prev => [data as PersonalizationVariable, ...prev]);
      toast({
        title: "Success",
        description: "Personalization variable created successfully",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create personalization variable",
        variant: "destructive",
      });
      throw error;
    }
  };

  /**
   * Fetch context events
   */
  const fetchContextEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('context_events')
        .select('*')
        .eq('is_active', true)
        .order('relevance_score', { ascending: false })
        .order('event_date', { ascending: false });

      if (error) throw error;
      setContextEvents((data || []) as ContextEvent[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load context events",
        variant: "destructive",
      });
    }
  };

  /**
   * Create context event
   */
  const createContextEvent = async (event: Omit<ContextEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('context_events')
        .insert([{
          ...event,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      
      setContextEvents(prev => [data as ContextEvent, ...prev]);
      toast({
        title: "Success",
        description: "Context event created successfully",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create context event",
        variant: "destructive",
      });
      throw error;
    }
  };

  /**
   * Fetch industry templates
   */
  const fetchIndustryTemplates = async (industryType?: string) => {
    try {
      let query = supabase.from('industry_templates').select('*');
      
      if (industryType) {
        query = query.eq('industry_type', industryType);
      }
      
      const { data, error } = await query.order('sophistication_level', { ascending: false });

      if (error) throw error;
      const templates = (data || []) as IndustryTemplate[];
      setIndustryTemplates(templates);
      return templates;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load industry templates",
        variant: "destructive",
      });
      return [];
    }
  };

  /**
   * Personalize template with intelligent engine
   */
  const personalizeTemplate = async (
    templateId: string,
    targetData: Record<string, any>
  ): Promise<DynamicTemplateContent | null> => {
    setLoading(true);
    try {
      const relevantEvents = contextEvents.filter(event => 
        event.relevance_score > 0.5 && 
        new Date(event.event_date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );

      const personalizedContent = await engine.personalizeTemplate(
        templateId,
        targetData,
        relevantEvents
      );

      toast({
        title: "Success",
        description: "Template personalized successfully",
      });

      return personalizedContent;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to personalize template",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create template from industry template
   */
  const createFromIndustryTemplate = async (
    industryTemplateId: string,
    customizations?: Partial<DynamicTemplateContent>
  ) => {
    setLoading(true);
    try {
      const templateData = await engine.createFromIndustryTemplate(
        industryTemplateId,
        customizations
      );

      const { data, error } = await supabase
        .from('email_templates')
        .insert([{
          ...templateData,
          user_id: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template created from industry template",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create template from industry template",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Analyze template effectiveness
   */
  const analyzeTemplate = async (templateId: string) => {
    setLoading(true);
    try {
      const analysis = await engine.analyzeTemplateEffectiveness(templateId);
      
      toast({
        title: "Analysis Complete",
        description: `Personalization Score: ${analysis.personalization_score}/100`,
      });

      return analysis;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to analyze template",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate context-aware content suggestions
   */
  const generateContextSuggestions = async (industryType: string) => {
    try {
      const currentEvents = contextEvents.filter(event => 
        event.is_active && 
        new Date(event.event_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );

      const suggestions = currentEvents.map(event => ({
        title: `Reference: ${event.event_title}`,
        description: event.event_description,
        variables: Object.keys(event.event_data),
        relevance: event.relevance_score,
      }));

      return suggestions;
    } catch (error: any) {
      console.error('Error generating context suggestions:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      fetchVariables();
      fetchContextEvents();
    }
  }, [user]);

  return {
    loading,
    variables,
    contextEvents,
    industryTemplates,
    fetchVariables,
    createVariable,
    fetchContextEvents,
    createContextEvent,
    fetchIndustryTemplates,
    personalizeTemplate,
    createFromIndustryTemplate,
    analyzeTemplate,
    generateContextSuggestions,
  };
};