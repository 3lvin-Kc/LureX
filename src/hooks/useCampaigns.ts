
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'canceled' | 'failed';
  schedule_time?: string;
  created_at: string;
  updated_at: string;
  template?: { name: string };
  target_list?: { name: string };
  phishing_page?: { name: string };
}

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          template:email_templates(name),
          target_list:target_lists(name),
          phishing_page:phishing_pages(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast the data to match our Campaign interface
      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as Campaign['status']
      }));
      
      setCampaigns(typedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'template' | 'target_list' | 'phishing_page'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([{
          ...campaign,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchCampaigns(); // Refresh to get related data
      toast({
        title: "Success",
        description: "Campaign created successfully",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCampaignStatus = async (id: string, status: Campaign['status']) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === id ? { ...campaign, status } : campaign
        )
      );

      toast({
        title: "Success",
        description: `Campaign ${status}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update campaign",
        variant: "destructive",
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
    updateCampaignStatus,
    refetchCampaigns: fetchCampaigns,
  };
};
