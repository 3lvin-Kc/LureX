import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SimulationType = 'link' | 'file' | 'combined';

export interface SimulationMetrics {
  emailsSent: number;
  interactions: number; // clicks for link, downloads for file
  submissions: number; // form submissions for link, file opens for file
  reports: number;
  successRate: number;
  riskScore: number;
  averageResponseTime: number; // in seconds
}

export interface SpiderChartData {
  dimension: string;
  linkValue: number;
  fileValue: number;
  mixedValue?: number;
  fullMark: number;
}

export const useSimulationMetrics = (simulationType: SimulationType, timePeriod: number = 30) => {
  const [linkMetrics, setLinkMetrics] = useState<SimulationMetrics | null>(null);
  const [fileMetrics, setFileMetrics] = useState<SimulationMetrics | null>(null);
  const [spiderData, setSpiderData] = useState<SpiderChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSimulationMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate date range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timePeriod);

      // Fetch campaigns with simulation types
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, name, simulation_type, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString());

      if (campaignsError) throw campaignsError;

      const linkCampaigns = campaigns?.filter(c => c.simulation_type === 'link') || [];
      const fileCampaigns = campaigns?.filter(c => c.simulation_type === 'file') || [];
      const mixedCampaigns = campaigns?.filter(c => c.simulation_type === 'mixed') || [];

      // Fetch metrics for link-based campaigns
      const linkMetricsData = await fetchMetricsForType(linkCampaigns.map(c => c.id), 'link');
      setLinkMetrics(linkMetricsData);

      // Fetch metrics for file-based campaigns  
      const fileMetricsData = await fetchMetricsForType(fileCampaigns.map(c => c.id), 'file');
      setFileMetrics(fileMetricsData);

      // Generate spider chart data
      const spiderChartData = generateSpiderData(linkMetricsData, fileMetricsData);
      setSpiderData(spiderChartData);

    } catch (err: any) {
      console.error('Error fetching simulation metrics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetricsForType = async (campaignIds: string[], type: 'link' | 'file'): Promise<SimulationMetrics> => {
    if (campaignIds.length === 0) {
      return {
        emailsSent: 0,
        interactions: 0,
        submissions: 0,
        reports: 0,
        successRate: 0,
        riskScore: 0,
        averageResponseTime: 0
      };
    }

    // Fetch all metrics for campaigns of this type
    const { data: metrics, error } = await supabase
      .from('campaign_metrics')
      .select('*')
      .in('campaign_id', campaignIds);

    if (error) throw error;

    const emailsSent = metrics?.filter(m => m.sent_at).length || 0;
    const reports = metrics?.filter(m => m.reported_at).length || 0;

    let interactions = 0;
    let submissions = 0;
    let totalResponseTime = 0;
    let responseCount = 0;

    if (type === 'link') {
      interactions = metrics?.filter(m => m.clicked_at).length || 0;
      submissions = metrics?.filter(m => m.data_submitted_at).length || 0;
      
      // Calculate average response time for clicks
      metrics?.forEach(m => {
        if (m.sent_at && m.clicked_at) {
          const sentTime = new Date(m.sent_at).getTime();
          const clickTime = new Date(m.clicked_at).getTime();
          totalResponseTime += (clickTime - sentTime) / 1000; // Convert to seconds
          responseCount++;
        }
      });
    } else {
      interactions = metrics?.filter(m => m.file_downloaded_at).length || 0;
      submissions = metrics?.filter(m => m.file_opened_at).length || 0;
      
      // Calculate average response time for downloads
      metrics?.forEach(m => {
        if (m.sent_at && m.file_downloaded_at) {
          const sentTime = new Date(m.sent_at).getTime();
          const downloadTime = new Date(m.file_downloaded_at).getTime();
          totalResponseTime += (downloadTime - sentTime) / 1000;
          responseCount++;
        }
      });
    }

    const successRate = emailsSent > 0 ? (submissions / emailsSent) * 100 : 0;
    const averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;
    
    // Calculate risk score based on success rate, speed, and interaction rate
    const interactionRate = emailsSent > 0 ? (interactions / emailsSent) * 100 : 0;
    const speedFactor = averageResponseTime < 300 ? 1 : averageResponseTime < 600 ? 0.7 : 0.4; // Fast response = higher risk
    const riskScore = Math.min(100, (successRate * 0.4 + interactionRate * 0.3 + speedFactor * 30));

    return {
      emailsSent,
      interactions,
      submissions,
      reports,
      successRate: Math.round(successRate * 10) / 10,
      riskScore: Math.round(riskScore * 10) / 10,
      averageResponseTime: Math.round(averageResponseTime)
    };
  };

  const generateSpiderData = (linkData: SimulationMetrics, fileData: SimulationMetrics): SpiderChartData[] => {
    const maxEmails = Math.max(linkData.emailsSent, fileData.emailsSent);
    const maxInteractions = Math.max(linkData.interactions, fileData.interactions);
    const maxSubmissions = Math.max(linkData.submissions, fileData.submissions);
    const maxReports = Math.max(linkData.reports, fileData.reports);

    return [
      {
        dimension: 'Volume',
        linkValue: linkData.emailsSent,
        fileValue: fileData.emailsSent,
        fullMark: Math.max(maxEmails, 100)
      },
      {
        dimension: 'Engagement',
        linkValue: linkData.interactions,
        fileValue: fileData.interactions,
        fullMark: Math.max(maxInteractions, 50)
      },
      {
        dimension: 'Compromise',
        linkValue: linkData.submissions,
        fileValue: fileData.submissions,
        fullMark: Math.max(maxSubmissions, 25)
      },
      {
        dimension: 'Awareness',
        linkValue: linkData.reports,
        fileValue: fileData.reports,
        fullMark: Math.max(maxReports, 10)
      },
      {
        dimension: 'Risk Score',
        linkValue: linkData.riskScore,
        fileValue: fileData.riskScore,
        fullMark: 100
      },
      {
        dimension: 'Response Speed',
        linkValue: Math.max(0, 100 - (linkData.averageResponseTime / 10)), // Invert for chart (faster = higher score)
        fileValue: Math.max(0, 100 - (fileData.averageResponseTime / 10)),
        fullMark: 100
      }
    ];
  };

  useEffect(() => {
    fetchSimulationMetrics();
  }, [simulationType, timePeriod]);

  return {
    linkMetrics,
    fileMetrics,
    spiderData,
    loading,
    error,
    refetch: fetchSimulationMetrics
  };
};
