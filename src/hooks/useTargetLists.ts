
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

  const updateTargetCount = async (listId: string) => {
    const { count, error: countError } = await supabase
      .from('targets')
      .select('*', { count: 'exact', head: true })
      .eq('list_id', listId);

    if (countError) throw countError;

    const { error: updateError } = await supabase
      .from('target_lists')
      .update({ 
        target_count: count || 0,
        updated_at: new Date().toISOString() 
      })
      .eq('id', listId);

    if (updateError) throw updateError;

    return count || 0;
  };

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
      // First create the list with 0 targets
      const { data: listData, error: listError } = await supabase
        .from('target_lists')
        .insert([{
          ...list,
          user_id: user.id,
          target_count: 0, // Start with 0, will be updated after targets are added
        }])
        .select()
        .single();

      if (listError) throw listError;

      // Add targets if any
      if (targets.length > 0) {
        const { error: targetsError } = await supabase
          .from('targets')
          .insert(targets.map(target => ({
            ...target,
            list_id: listData.id,
          })));

        if (targetsError) throw targetsError;
      }

      // Update the target count
      await updateTargetCount(listData.id);

      // Refresh the list to get updated count
      const { data: updatedList, error: fetchError } = await supabase
        .from('target_lists')
        .select('*')
        .eq('id', listData.id)
        .single();

      if (fetchError) throw fetchError;
      
      setTargetLists(prev => [updatedList, ...prev.filter(l => l.id !== listData.id)]);
      toast({
        title: "Success",
        description: "Target list created successfully",
      });
      
      return updatedList;
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
      // First delete all targets in the list
      const { error: deleteTargetsError } = await supabase
        .from('targets')
        .delete()
        .eq('list_id', id);

      if (deleteTargetsError) throw deleteTargetsError;

      // Then delete the list
      const { error } = await supabase
        .from('target_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTargetLists(prev => prev.filter(list => list.id !== id));
      toast({
        title: "Success",
        description: "Target list and all its targets deleted successfully",
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

  // Add a function to refresh a single target list
  const refreshTargetList = async (listId: string) => {
    try {
      await updateTargetCount(listId);
      const { data, error } = await supabase
        .from('target_lists')
        .select('*')
        .eq('id', listId)
        .single();

      if (error) throw error;

      setTargetLists(prev => 
        prev.map(list => list.id === listId ? data : list)
      );
      
      return data;
    } catch (error) {
      console.error('Error refreshing target list:', error);
      throw error;
    }
  };

  return {
    targetLists,
    loading,
    createTargetList,
    deleteTargetList,
    exportTargetList,
    refreshTargetList,
    refetchTargetLists: fetchTargetLists,
  };
};
