import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CandlestickDataPoint {
  name: string;
  open: number;
  high: number;
  low: number;
  close: number;
  type: 'link' | 'file';
}

export interface CandlestickData {
  linkData: CandlestickDataPoint[];
  fileData: CandlestickDataPoint[];
}

export const useCandlestickData = () => {
  const [data, setData] = useState<CandlestickData>({ linkData: [], fileData: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandlestickData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get last 6 months of data
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Fetch campaigns with simulation type
      let campaigns;
      try {
        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaigns')
          .select('id, name, created_at, simulation_type')
          .eq('user_id', user.id)
          .gte('created_at', sixMonthsAgo.toISOString());

        if (campaignsError) throw campaignsError;
        campaigns = campaignsData || [];
      } catch (err) {
        // Fallback for campaigns without simulation_type column
        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaigns')
          .select('id, name, created_at')
          .eq('user_id', user.id)
          .gte('created_at', sixMonthsAgo.toISOString());

        if (campaignsError) throw campaignsError;
        campaigns = (campaignsData || []).map(c => ({ ...c, simulation_type: 'link' }));
      }

      if (!campaigns || campaigns.length === 0) {
        // No campaigns - return empty data
        setData({ linkData: [], fileData: [] });
        return;
      }

      // Fetch campaign metrics for all campaigns
      const { data: metrics, error: metricsError } = await supabase
        .from('campaign_metrics')
        .select('campaign_id, sent_at, clicked_at, data_submitted_at, file_downloaded_at')
        .in('campaign_id', campaigns.map(c => c.id));

      if (metricsError) throw metricsError;

      // Process data by month for last 6 months
      const monthlyData = processMonthlyMetrics(campaigns, metrics || []);
      
      setData(monthlyData);

    } catch (err: any) {
      console.error('Error fetching candlestick data:', err);
      setError(err.message);
      // Set fallback empty data
      setData({ linkData: [], fileData: [] });
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyMetrics = (campaigns: any[], metrics: any[]): CandlestickData => {
    const months = [];
    const now = new Date();
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: date.toLocaleDateString('en-US', { month: 'short' }),
        date: date,
        key: `${date.getFullYear()}-${date.getMonth()}`
      });
    }

    const linkData: CandlestickDataPoint[] = [];
    const fileData: CandlestickDataPoint[] = [];

    months.forEach(month => {
      // Get campaigns for this month
      const monthCampaigns = campaigns.filter(campaign => {
        const campaignDate = new Date(campaign.created_at);
        return campaignDate.getFullYear() === month.date.getFullYear() &&
               campaignDate.getMonth() === month.date.getMonth();
      });

      // Process link campaigns
      const linkCampaigns = monthCampaigns.filter(c => 
        !c.simulation_type || c.simulation_type === 'link'
      );
      
      // Process file campaigns  
      const fileCampaigns = monthCampaigns.filter(c => 
        c.simulation_type === 'file'
      );

      // Calculate OHLC for link campaigns
      const linkMetrics = calculateOHLC(linkCampaigns, metrics, 'link');
      linkData.push({
        name: month.name,
        ...linkMetrics,
        type: 'link'
      });

      // Calculate OHLC for file campaigns
      const fileMetrics = calculateOHLC(fileCampaigns, metrics, 'file');
      fileData.push({
        name: month.name,
        ...fileMetrics,
        type: 'file'
      });
    });

    return { linkData, fileData };
  };

  const calculateOHLC = (campaigns: any[], allMetrics: any[], type: 'link' | 'file') => {
    if (campaigns.length === 0) {
      return { open: 0, high: 0, low: 0, close: 0 };
    }

    const campaignIds = campaigns.map(c => c.id);
    const campaignMetrics = allMetrics.filter(m => campaignIds.includes(m.campaign_id));

    // Calculate success rates for each campaign
    const successRates = campaigns.map(campaign => {
      const metrics = campaignMetrics.filter(m => m.campaign_id === campaign.id);
      const totalSent = metrics.length;
      
      if (totalSent === 0) return 0;

      let successfulInteractions = 0;
      
      if (type === 'link') {
        // For link campaigns: clicks + data submissions
        successfulInteractions = metrics.filter(m => 
          m.clicked_at || m.data_submitted_at
        ).length;
      } else {
        // For file campaigns: downloads + opens
        successfulInteractions = metrics.filter(m => 
          m.file_downloaded_at
        ).length;
      }

      return (successfulInteractions / totalSent) * 100;
    });

    if (successRates.length === 0) {
      return { open: 0, high: 0, low: 0, close: 0 };
    }

    // Calculate OHLC from success rates
    const sortedRates = [...successRates].sort((a, b) => a - b);
    
    return {
      open: successRates[0] || 0,
      high: Math.max(...successRates) || 0,
      low: Math.min(...successRates) || 0,
      close: successRates[successRates.length - 1] || 0
    };
  };

  useEffect(() => {
    fetchCandlestickData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchCandlestickData
  };
};
