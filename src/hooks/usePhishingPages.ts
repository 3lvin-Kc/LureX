
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface PhishingPage {
  id: string;
  name: string;
  description?: string;
  html_content: string;
  css_content?: string;
  js_content?: string;
  category?: string;
  is_custom?: boolean;
  created_at: string;
  updated_at: string;
}

export const usePhishingPages = () => {
  const [pages, setPages] = useState<PhishingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('phishing_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load phishing pages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPage = async (page: Omit<PhishingPage, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('phishing_pages')
        .insert([{
          ...page,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      
      setPages(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Phishing page created successfully",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create phishing page",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePage = async (id: string, updates: Partial<PhishingPage>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('phishing_pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setPages(prev => prev.map(page => 
        page.id === id ? data : page
      ));
      
      toast({
        title: "Success",
        description: "Phishing page updated successfully",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update phishing page",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePage = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('phishing_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPages(prev => prev.filter(page => page.id !== id));
      toast({
        title: "Success",
        description: "Phishing page deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete phishing page",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPages();
  }, [user]);

  return {
    pages,
    loading,
    createPage,
    updatePage,
    deletePage,
    refetchPages: fetchPages,
  };
};
