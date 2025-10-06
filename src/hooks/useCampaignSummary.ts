import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CampaignSummaryData {
  id: string;
  name: string;
  type: 'link' | 'file' | 'mixed';
  sentDate: string;
  recipients: number;
  interactions: number;
  riskLevel: 'high' | 'medium' | 'low';
  clickRate: number;
  status: 'active' | 'completed' | 'paused' | 'draft';
}

export const useCampaignSummary = () => {
  const [campaigns, setCampaigns] = useState<CampaignSummaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaignSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Fetch campaigns with basic info
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, name, created_at, status, simulation_type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;

      if (!campaignsData || campaignsData.length === 0) {
        setCampaigns([]);
        return;
      }

      // Fetch campaign metrics for each campaign
      const { data: metricsData, error: metricsError } = await supabase
        .from('campaign_metrics')
        .select('campaign_id, sent_at, clicked_at, data_submitted_at, file_downloaded_at, target_email')
        .in('campaign_id', campaignsData.map(c => c.id));

      if (metricsError) throw metricsError;

      // Process campaign summary data
      const summaryData: CampaignSummaryData[] = campaignsData.map(campaign => {
        const campaignMetrics = (metricsData || []).filter(m => m.campaign_id === campaign.id);
        
        const recipients = campaignMetrics.length;
        const interactions = campaignMetrics.filter(m => 
          m.clicked_at || m.data_submitted_at || m.file_downloaded_at
        ).length;
        
        const clickRate = recipients > 0 ? (interactions / recipients) * 100 : 0;
        
        // Determine risk level based on click rate
        let riskLevel: 'high' | 'medium' | 'low' = 'low';
        if (clickRate >= 30) riskLevel = 'high';
        else if (clickRate >= 15) riskLevel = 'medium';

        // Determine campaign type
        let type: 'link' | 'file' | 'mixed' = 'link';
        if (campaign.simulation_type === 'file') {
          type = 'file';
        } else if (campaign.simulation_type === 'link') {
          type = 'link';
        }

        // Determine status
        let status: 'active' | 'completed' | 'paused' | 'draft' = 'completed';
        if (campaign.status === 'active') status = 'active';
        else if (campaign.status === 'paused') status = 'paused';
        else if (campaign.status === 'draft') status = 'draft';

        return {
          id: campaign.id,
          name: campaign.name || 'Untitled Campaign',
          type,
          sentDate: new Date(campaign.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          recipients,
          interactions,
          riskLevel,
          clickRate: Math.round(clickRate * 10) / 10,
          status
        };
      });

      setCampaigns(summaryData);

    } catch (err: any) {
      console.error('Error fetching campaign summary:', err);
      setError(err.message);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignSummary();
  }, []);

  return {
    campaigns,
    loading,
    error,
    refetch: fetchCampaignSummary
  };
};
