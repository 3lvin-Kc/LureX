
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: string;
  schedule_time?: string;
  simulation_type?: 'link' | 'file' | 'mixed';
  file_type?: string;
  file_name?: string;
  template_id?: string;
  target_list_id?: string;
  phishing_page_id?: string;
  domain_id?: string;
  created_at: string;
  updated_at?: string;
  template?: { name: string };
  target_list?: { name: string };
}

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          template:email_templates(name),
          target_list:target_lists(name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCampaigns((data || []) as Campaign[]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load campaigns',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (data: Partial<Campaign>) => {
    if (!user) return;
    try {
      // Convert empty string schedule_time to null and ensure 'name' is present
      const safeData = {
        name: data.name || '',
        description: data.description,
        schedule_time: data.schedule_time === '' ? null : data.schedule_time,
        status: data.status || 'draft',
        simulation_type: data.simulation_type || 'link',
        file_type: data.file_type,
        file_name: data.file_name,
        template_id: data.template_id,
        target_list_id: data.target_list_id,
        phishing_page_id: data.phishing_page_id,
        domain_id: data.domain_id,
        user_id: user.id,
      };
      const { data: newData, error } = await supabase
        .from('campaigns')
        .insert([
          safeData,
        ])
        .select()
        .single();
      if (error) throw error;
      setCampaigns(prev => [newData as Campaign, ...prev]);
      toast({
        title: 'Campaign created',
        description: 'Your campaign has been created successfully',
      });
      return newData;
    } catch (error: any) {
      toast({
        title: 'Error creating campaign',
        description: error.message || 'Failed to create campaign',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateCampaign = async (id: string, data: Partial<Campaign>) => {
    if (!user) return;
    try {
      // Convert empty string schedule_time to null
      const safeData = {
        ...data,
        schedule_time: data.schedule_time === '' ? null : data.schedule_time,
      };
      const { data: updated, error } = await supabase
        .from('campaigns')
        .update(safeData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      setCampaigns(prev => prev.map(campaign => (campaign.id === id ? updated as Campaign : campaign)));
      toast({
        title: 'Campaign updated',
        description: 'Your campaign has been updated successfully',
      });
      return updated;
    } catch (error: any) {
      toast({
        title: 'Error updating campaign',
        description: error.message || 'Failed to update campaign',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateCampaignStatus = async (id: string, status: string) => {
    if (!user) return;
    try {
      const { data: updated, error } = await supabase
        .from('campaigns')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      setCampaigns(prev => prev.map(campaign => (campaign.id === id ? updated as Campaign : campaign)));
      toast({
        title: 'Campaign status updated',
        description: `Campaign status changed to ${status}`,
      });
      return updated;
    } catch (error: any) {
      toast({
        title: 'Error updating campaign status',
        description: error.message || 'Failed to update campaign status',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
      toast({
        title: 'Campaign deleted',
        description: 'The campaign has been deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting campaign',
        description: error.message || 'Failed to delete campaign',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  return {
    campaigns,
    loading,
    createCampaign,
    updateCampaign,
    updateCampaignStatus,
    deleteCampaign,
    refetchCampaigns: fetchCampaigns,
  };
};
