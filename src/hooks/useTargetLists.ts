
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface TargetList {
  id: string;
  name: string;
  description?: string;
  target_count: number;
  created_at: string;
  updated_at: string;
}

export interface Target {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  position?: string;
  phone?: string;
  custom_fields?: any;
  list_id: string;
  created_at: string;
}

export const useTargetLists = () => {
  const [targetLists, setTargetLists] = useState<TargetList[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTargetLists = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('target_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTargetLists(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load target lists",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTargetList = async (list: Omit<TargetList, 'id' | 'created_at' | 'updated_at' | 'target_count'>, targets: Omit<Target, 'id' | 'created_at' | 'list_id'>[]) => {
    if (!user) return;

    try {
      const { data: listData, error: listError } = await supabase
        .from('target_lists')
        .insert([{
          ...list,
          user_id: user.id,
          target_count: targets.length,
        }])
        .select()
        .single();

      if (listError) throw listError;

      if (targets.length > 0) {
        const { error: targetsError } = await supabase
          .from('targets')
          .insert(targets.map(target => ({
            ...target,
            list_id: listData.id,
          })));

        if (targetsError) throw targetsError;
      }
      
      setTargetLists(prev => [listData, ...prev]);
      toast({
        title: "Success",
        description: "Target list created successfully",
      });
      
      return listData;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create target list",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTargetList = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('target_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTargetLists(prev => prev.filter(list => list.id !== id));
      toast({
        title: "Success",
        description: "Target list deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete target list",
        variant: "destructive",
      });
      throw error;
    }
  };

  const exportTargetList = async (listId: string) => {
    if (!user) return;

    try {
      const { data: targets, error } = await supabase
        .from('targets')
        .select('*')
        .eq('list_id', listId);

      if (error) throw error;

      const csvContent = [
        'email,first_name,last_name,department,position,phone',
        ...targets.map(target => 
          [target.email, target.first_name || '', target.last_name || '', 
           target.department || '', target.position || '', target.phone || ''].join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `target-list-${listId}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Target list exported successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to export target list",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTargetLists();
  }, [user]);

  return {
    targetLists,
    loading,
    createTargetList,
    deleteTargetList,
    exportTargetList,
    refetchTargetLists: fetchTargetLists,
  };
};
