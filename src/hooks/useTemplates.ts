import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  category: string;
  description?: string;
  version: number;
  created_at: string;
  updated_at: string;
  template_source?: 'manual' | 'ai_generated' | 'industry_template' | 'duplicated';
  source_template_id?: string;
  template_history?: any[];
  effectiveness_score?: number;
  usage_count?: number;
  tags?: string[];
  industry_type?: string;
  personalization_variables?: any;
}

export const useTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTemplates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates((data || []) as EmailTemplate[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load email templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>, options?: { source?: 'manual' | 'ai_generated' | 'industry_template' | 'duplicated', sourceTemplateId?: string }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert([{
          ...template,
          user_id: user.id,
          template_source: options?.source || 'manual',
          source_template_id: options?.sourceTemplateId || null,
          template_history: [],
          effectiveness_score: 0,
          usage_count: 0,
          tags: template.tags || [],
        }])
        .select()
        .single();

      if (error) throw error;
      
      setTemplates(prev => [data as EmailTemplate, ...prev]);
      toast({
        title: "Success",
        description: "Email template created successfully",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create email template",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<EmailTemplate>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setTemplates(prev => prev.map(template => 
        template.id === id ? data as EmailTemplate : template
      ));
      
      toast({
        title: "Success",
        description: "Email template updated successfully",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update email template",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTemplates(prev => prev.filter(template => template.id !== id));
      toast({
        title: "Success",
        description: "Email template deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete email template",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    const templateToDuplicate = templates.find(t => t.id === templateId);
    if (!templateToDuplicate) {
      toast({
        title: "Template not found",
        description: "Could not find the template to duplicate.",
        variant: "destructive"
      });
      return;
    }
    try {
      await createTemplate({
        name: `${templateToDuplicate.name} (Copy)`,
        subject: templateToDuplicate.subject,
        category: templateToDuplicate.category,
        html_content: templateToDuplicate.html_content,
        text_content: templateToDuplicate.text_content,
        description: templateToDuplicate.description,
        version: 1,
        tags: templateToDuplicate.tags || [],
        industry_type: templateToDuplicate.industry_type,
        personalization_variables: templateToDuplicate.personalization_variables,
      }, { 
        source: 'duplicated', 
        sourceTemplateId: templateToDuplicate.id 
      });
      toast({
        title: "Template duplicated",
        description: `"${templateToDuplicate.name}" has been duplicated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error duplicating template",
        description: "Failed to duplicate email template",
        variant: "destructive"
      });
    }
  };

  // Get template analytics
  const getTemplateAnalytics = async (templateId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('template_analytics')
        .select('*')
        .eq('template_id', templateId)
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching template analytics:', error);
      return [];
    }
  };

  // Record template analytics
  const recordTemplateAnalytics = async (templateId: string, metricType: string, metricValue: number, campaignId?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('template_analytics')
        .insert([{
          template_id: templateId,
          user_id: user.id,
          metric_type: metricType,
          metric_value: metricValue,
          campaign_id: campaignId,
        }]);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error recording template analytics:', error);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetchTemplates: fetchTemplates,
    handleDuplicateTemplate,
    getTemplateAnalytics,
    recordTemplateAnalytics,
  };
};