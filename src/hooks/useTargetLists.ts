
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface Target {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  department?: string;
  phone?: string;
  custom_fields?: Record<string, any>;
}

export interface TargetList {
  id: string;
  name: string;
  description?: string;
  target_count: number;
  created_at: string;
  updated_at: string;
  targets?: Target[];
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
        .select(`
          *,
          targets(*)
        `)
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

  const createTargetList = async (targetList: Omit<TargetList, 'id' | 'created_at' | 'updated_at' | 'target_count' | 'targets'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('target_lists')
        .insert([{
          ...targetList,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      
      setTargetLists(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Target list created successfully",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create target list",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addTargetsToList = async (listId: string, targets: Omit<Target, 'id'>[]) => {
    try {
      const { data, error } = await supabase
        .from('targets')
        .insert(
          targets.map(target => ({
            ...target,
            list_id: listId,
          }))
        )
        .select();

      if (error) throw error;

      // Refresh the target lists to get updated counts
      await fetchTargetLists();
      
      toast({
        title: "Success",
        description: `Added ${targets.length} targets to the list`,
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add targets to list",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTargetList = async (id: string) => {
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

  useEffect(() => {
    fetchTargetLists();
  }, [user]);

  return {
    targetLists,
    loading,
    createTargetList,
    addTargetsToList,
    deleteTargetList,
    refetchTargetLists: fetchTargetLists,
  };
};
