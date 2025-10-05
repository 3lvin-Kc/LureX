import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardMetrics {
  totalCampaigns: number;
  totalInteractions: number;
  activeCampaigns: number;
  overallClickRate: number;
  linkCampaigns: number;
  fileCampaigns: number;
  linkInteractions: number;
  fileInteractions: number;
  totalEmailsSent: number;
  totalReports: number;
  totalSubmissions: number;
}

export interface CampaignPerformanceData {
  name: string;
  sent: number;
  opened: number;
  clicked: number;
  downloaded: number;
  submitted: number;
  simulationType: 'link' | 'file';
}

export interface RecentCampaign {
  id: string;
  name: string;
  simulationType: 'link' | 'file';
  created: string;
  clickRate: string;
  downloadRate?: string;
  status: string;
  totalTargets: number;
  interactions: number;
}

export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [campaignPerformance, setCampaignPerformance] = useState<CampaignPerformanceData[]>([]);
  const [recentCampaigns, setRecentCampaigns] = useState<RecentCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Fetch all campaigns for the user - handle both old and new schema
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, name, created_at, status')
        .eq('user_id', user.id);

      if (campaignsError) throw campaignsError;

      // Calculate basic metrics with existing data
      const totalCampaigns = campaigns?.length || 0;
      const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;

      // Fetch campaign metrics with basic columns that should exist
      const { data: campaignMetrics, error: metricsError } = await supabase
        .from('campaign_metrics')
        .select('campaign_id, sent_at')
        .in('campaign_id', campaigns?.map(c => c.id) || []);

      if (metricsError) throw metricsError;

      const totalInteractions = campaignMetrics?.length || 0;
      
      // Try to get additional metrics if columns exist
      let clickedInteractions = 0;
      let submissions = 0;
      let fileInteractions = 0;
      let totalEmailsSent = 0;
      let totalReports = 0;

      try {
        const { data: clickMetrics } = await supabase
          .from('campaign_metrics')
          .select('campaign_id, clicked_at')
          .in('campaign_id', campaigns?.map(c => c.id) || [])
          .not('clicked_at', 'is', null);
        
        clickedInteractions = clickMetrics?.length || 0;
      } catch (err) {
        // Column doesn't exist yet
      }

      try {
        const { data: submitMetrics } = await supabase
          .from('campaign_metrics')
          .select('campaign_id, data_submitted_at')
          .in('campaign_id', campaigns?.map(c => c.id) || [])
          .not('data_submitted_at', 'is', null);
        
        submissions = submitMetrics?.length || 0;
      } catch (err) {
        // Column doesn't exist yet
      }

      try {
        const { data: fileMetrics } = await supabase
          .from('campaign_metrics')
          .select('campaign_id, file_downloaded_at')
          .in('campaign_id', campaigns?.map(c => c.id) || [])
          .not('file_downloaded_at', 'is', null);
        
        fileInteractions = fileMetrics?.length || 0;
      } catch (err) {
        // Column doesn't exist yet
      }

      // New KPI Queries - Emails Sent
      try {
        const { data: sentMetrics } = await supabase
          .from('campaign_metrics')
          .select('campaign_id')
          .in('campaign_id', campaigns?.map(c => c.id) || [])
          .not('sent_at', 'is', null);
        
        totalEmailsSent = sentMetrics?.length || 0;
      } catch (err) {
        // Column doesn't exist yet
        console.log('sent_at column not available:', err);
      }

      // New KPI Queries - Reports Received
      try {
        const { data: reportMetrics } = await supabase
          .from('campaign_metrics')
          .select('campaign_id')
          .in('campaign_id', campaigns?.map(c => c.id) || [])
          .not('reported_at', 'is', null);
        
        totalReports = reportMetrics?.length || 0;
      } catch (err) {
        // Column doesn't exist yet
        console.log('reported_at column not available:', err);
      }

      const overallClickRate = totalInteractions > 0 
        ? ((clickedInteractions + fileInteractions) / totalInteractions * 100) 
        : 0;

      // Device and risk distribution are now handled by dedicated hooks
      // useDeviceAnalytics provides real device distribution
      // Risk distribution removed as it was not providing actionable insights

      setMetrics({
        totalCampaigns,
        totalInteractions,
        activeCampaigns,
        overallClickRate: Math.round(overallClickRate * 10) / 10,
        linkCampaigns: 0, // Will be updated when simulation_type column exists
        fileCampaigns: 0, // Will be updated when simulation_type column exists
        linkInteractions: clickedInteractions,
        fileInteractions,
        totalEmailsSent,
        totalReports,
        totalSubmissions: submissions,
      });

      // Process campaign performance data (last 6 months)
      const performanceData = processPerformanceData(campaigns || [], campaignMetrics || []);
      setCampaignPerformance(performanceData);

      // Process recent campaigns
      const recentCampaignsData = processRecentCampaigns(campaigns || [], campaignMetrics || []);
      setRecentCampaigns(recentCampaignsData);

    } catch (err: any) {
      console.error('Error fetching dashboard metrics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processPerformanceData = (campaigns: any[], metrics: any[]): CampaignPerformanceData[] => {
    const monthlyData: { [key: string]: CampaignPerformanceData } = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      
      monthlyData[monthKey] = {
        name: monthKey,
        sent: 0,
        opened: 0,
        clicked: 0,
        downloaded: 0,
        submitted: 0,
        simulationType: 'link'
      };
    }

    // Aggregate metrics by month
    metrics.forEach(metric => {
      if (metric.sent_at) {
        const date = new Date(metric.sent_at);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].sent++;
          
          if (metric.additional_data?.email_opened) {
            monthlyData[monthKey].opened++;
          }
          
          if (metric.clicked_at) {
            monthlyData[monthKey].clicked++;
          }
          
          if (metric.file_downloaded_at) {
            monthlyData[monthKey].downloaded++;
          }
          
          if (metric.data_submitted_at) {
            monthlyData[monthKey].submitted++;
          }
        }
      }
    });

    return Object.values(monthlyData);
  };

  const processRecentCampaigns = (campaigns: any[], metrics: any[]): RecentCampaign[] => {
    return campaigns
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(campaign => {
        const campaignMetrics = metrics.filter(m => m.campaign_id === campaign.id);
        const totalTargets = campaignMetrics.length;
        const clicks = campaignMetrics.filter(m => m.clicked_at).length;
        const downloads = campaignMetrics.filter(m => m.file_downloaded_at).length;
        const interactions = clicks + downloads;
        
        const clickRate = totalTargets > 0 ? (clicks / totalTargets * 100).toFixed(1) : '0.0';
        const downloadRate = totalTargets > 0 ? (downloads / totalTargets * 100).toFixed(1) : '0.0';

        return {
          id: campaign.id,
          name: campaign.name,
          simulationType: campaign.simulation_type,
          created: new Date(campaign.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          clickRate: campaign.simulation_type === 'link' ? `${clickRate}%` : `${downloadRate}%`,
          downloadRate: campaign.simulation_type === 'file' ? `${downloadRate}%` : undefined,
          status: campaign.status === 'active' ? 'Active' : 'Completed',
          totalTargets,
          interactions
        };
      });
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  return {
    metrics,
    campaignPerformance,
    recentCampaigns,
    loading,
    error,
    refetch: fetchDashboardMetrics
  };
};
