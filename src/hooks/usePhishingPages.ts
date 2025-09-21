
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface PhishingPage {
  id: string;
  name: string;
  category?: string;
  html_content: string;
  css_content?: string;
  js_content?: string;
  is_custom: boolean;
  source_url?: string;
  created_at: string;
  updated_at: string;
}

export const usePhishingPages = () => {
  const [phishingPages, setPhishingPages] = useState<PhishingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPhishingPages = async () => {
    if (!user) {
      setLoading(false); // Fix: prevent infinite loading if user is null
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('phishing_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhishingPages(data || []);
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

  const createPhishingPage = async (page: Omit<PhishingPage, 'id' | 'created_at' | 'updated_at'>) => {
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
      
      setPhishingPages(prev => [data, ...prev]);
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

  const updatePhishingPage = async (id: string, updates: Partial<PhishingPage>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('phishing_pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setPhishingPages(prev => prev.map(page => 
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

  const deletePhishingPage = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('phishing_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPhishingPages(prev => prev.filter(page => page.id !== id));
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

  const duplicatePhishingPage = async (pageId: string) => {
    if (!user) return;

    try {
      const originalPage = phishingPages.find(p => p.id === pageId);
      if (!originalPage) return;

      const duplicatedPage = {
        name: `${originalPage.name} (Copy)`,
        category: originalPage.category,
        html_content: originalPage.html_content,
        css_content: originalPage.css_content,
        js_content: originalPage.js_content,
        is_custom: originalPage.is_custom,
        source_url: originalPage.source_url,
      };

      await createPhishingPage(duplicatedPage);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to duplicate phishing page",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPhishingPages();
  }, [user]);

  return {
    phishingPages,
    loading,
    createPhishingPage,
    updatePhishingPage,
    deletePhishingPage,
    duplicatePhishingPage,
    refetchPhishingPages: fetchPhishingPages,
  };
};
