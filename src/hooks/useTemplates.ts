
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
      setTemplates(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert([{
          ...template,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      
      setTemplates(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Template created successfully",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<EmailTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => 
        prev.map(template => 
          template.id === id ? { ...template, ...data } : template
        )
      );

      toast({
        title: "Success",
        description: "Template updated successfully",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTemplates(prev => prev.filter(template => template.id !== id));
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
      throw error;
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
  };
};
