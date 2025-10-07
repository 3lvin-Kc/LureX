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

      // Fetch campaign metrics with all interaction columns
      const { data: campaignMetrics, error: metricsError } = await supabase
        .from('campaign_metrics')
        .select('campaign_id, sent_at, opened_at, clicked_at, file_downloaded_at, data_submitted_at, reported_at')
        .in('campaign_id', campaigns?.map(c => c.id) || []);

      if (metricsError) throw metricsError;

      // Count only REAL user interactions (not email sends)
      // Interactions = user opened, clicked, downloaded, submitted, or reported
      const totalInteractions = campaignMetrics?.filter(metric => 
        metric.opened_at || 
        metric.clicked_at || 
        metric.file_downloaded_at || 
        metric.data_submitted_at || 
        metric.reported_at
      ).length || 0;
      
      // Calculate metrics from the data we already fetched
      let clickedInteractions = 0;
      let submissions = 0;
      let fileInteractions = 0;
      let totalEmailsSent = 0;
      let totalReports = 0;

      // Process the metrics we already have
      campaignMetrics?.forEach(metric => {
        // Count emails sent (system action, not user interaction)
        if (metric.sent_at) {
          totalEmailsSent++;
        }
        
        // Count actual user interactions
        if (metric.clicked_at) {
          clickedInteractions++;
        }
        
        if (metric.data_submitted_at) {
          submissions++;
        }
        
        if (metric.file_downloaded_at) {
          fileInteractions++;
        }
        
        if (metric.reported_at) {
          totalReports++;
        }
      });

      // Calculate click rate based on emails sent, not total interactions
      const overallClickRate = totalEmailsSent > 0 
        ? ((clickedInteractions + fileInteractions) / totalEmailsSent * 100) 
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
