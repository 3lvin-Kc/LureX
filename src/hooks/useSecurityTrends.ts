import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SecurityTrendData {
  date: string;
  positiveInteractions: number; // Users who reported
  negativeInteractions: number; // Users who clicked/submitted
  awarenessRate: number; // Percentage of positive interactions
  totalInteractions: number;
}

export const useSecurityTrends = (days: number = 30) => {
  const [trendData, setTrendData] = useState<SecurityTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSecurityTrends = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get user's campaigns
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id')
        .eq('user_id', user.id);

      if (campaignsError) throw campaignsError;

      const campaignIds = campaigns?.map(c => c.id) || [];

      if (campaignIds.length === 0) {
        // No campaigns, return empty data
        setTrendData(generateEmptyTrendData(days));
        return;
      }

      // Fetch all metrics for the date range
      const { data: metrics, error: metricsError } = await supabase
        .from('campaign_metrics')
        .select('sent_at, clicked_at, data_submitted_at, reported_at, file_downloaded_at, file_opened_at')
        .in('campaign_id', campaignIds)
        .gte('sent_at', startDate.toISOString())
        .lte('sent_at', endDate.toISOString())
        .order('sent_at', { ascending: true });

      if (metricsError) throw metricsError;

      // Process data by day
      const dailyData = processDailySecurityData(metrics || [], days);
      setTrendData(dailyData);

    } catch (err: any) {
      console.error('Error fetching security trends:', err);
      setError(err.message);
      setTrendData(generateEmptyTrendData(days));
    } finally {
      setLoading(false);
    }
  };

  const processDailySecurityData = (metrics: any[], days: number): SecurityTrendData[] => {
    const dailyMap = new Map<string, SecurityTrendData>();

    // Initialize all days with zero values
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      dailyMap.set(dateKey, {
        date: displayDate,
        positiveInteractions: 0,
        negativeInteractions: 0,
        awarenessRate: 0,
        totalInteractions: 0
      });
    }

    // Process each metric
    metrics.forEach(metric => {
      if (!metric.sent_at) return;

      const sentDate = new Date(metric.sent_at);
      const dateKey = sentDate.toISOString().split('T')[0];
      const dayData = dailyMap.get(dateKey);

      if (!dayData) return;

      // Count positive interactions (reported)
      if (metric.reported_at) {
        dayData.positiveInteractions++;
        dayData.totalInteractions++;
      }

      // Count negative interactions (clicked, downloaded, submitted, opened)
      if (metric.clicked_at || metric.data_submitted_at || 
          metric.file_downloaded_at || metric.file_opened_at) {
        dayData.negativeInteractions++;
        dayData.totalInteractions++;
      }

      // Calculate awareness rate
      if (dayData.totalInteractions > 0) {
        dayData.awarenessRate = Math.round(
          (dayData.positiveInteractions / dayData.totalInteractions) * 100
        );
      }

      dailyMap.set(dateKey, dayData);
    });

    return Array.from(dailyMap.values());
  };

  const generateEmptyTrendData = (days: number): SecurityTrendData[] => {
    const data: SecurityTrendData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      data.push({
        date: displayDate,
        positiveInteractions: 0,
        negativeInteractions: 0,
        awarenessRate: 0,
        totalInteractions: 0
      });
    }
    
    return data;
  };

  useEffect(() => {
    fetchSecurityTrends();
  }, [days]);

  return {
    trendData,
    loading,
    error,
    refetch: fetchSecurityTrends
  };
};
