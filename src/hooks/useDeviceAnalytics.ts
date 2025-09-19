import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DeviceData {
  name: string;
  value: number;
  fill: string;
  percentage: number;
}

export interface DeviceAnalytics {
  deviceDistribution: DeviceData[];
  totalDevices: number;
  topDevice: string;
  mobilePercentage: number;
  desktopPercentage: number;
  tabletPercentage: number;
}

export const useDeviceAnalytics = () => {
  const [analytics, setAnalytics] = useState<DeviceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseUserAgent = (userAgent: string): string => {
    if (!userAgent) return 'Unknown';
    
    const ua = userAgent.toLowerCase();
    
    // Check for tablet first (more specific)
    if (ua.includes('ipad') || 
        (ua.includes('android') && !ua.includes('mobile')) ||
        ua.includes('tablet')) {
      return 'Tablet';
    }
    
    // Check for mobile
    if (ua.includes('mobile') || 
        ua.includes('iphone') || 
        ua.includes('android') ||
        ua.includes('blackberry') ||
        ua.includes('windows phone')) {
      return 'Mobile';
    }
    
    // Default to desktop
    return 'Desktop';
  };

  const fetchDeviceAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Fetch campaign metrics with user agents
      const { data: metrics, error: metricsError } = await supabase
        .from('campaign_metrics')
        .select(`
          user_agent,
          campaign_id,
          campaigns!inner(user_id)
        `)
        .eq('campaigns.user_id', user.id)
        .not('user_agent', 'is', null);

      if (metricsError) throw metricsError;

      if (!metrics || metrics.length === 0) {
        // No data available - return empty analytics
        setAnalytics({
          deviceDistribution: [],
          totalDevices: 0,
          topDevice: 'No data',
          mobilePercentage: 0,
          desktopPercentage: 0,
          tabletPercentage: 0
        });
        return;
      }

      // Parse user agents and count devices
      const deviceCounts: { [key: string]: number } = {
        'Desktop': 0,
        'Mobile': 0,
        'Tablet': 0
      };

      metrics.forEach(metric => {
        const deviceType = parseUserAgent(metric.user_agent || '');
        deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1;
      });

      const totalDevices = Object.values(deviceCounts).reduce((sum, count) => sum + count, 0);

      // Calculate percentages and create distribution data
      const deviceDistribution: DeviceData[] = [
        {
          name: 'Desktop',
          value: deviceCounts.Desktop,
          fill: 'hsl(var(--chart-1))',
          percentage: totalDevices > 0 ? Math.round((deviceCounts.Desktop / totalDevices) * 100) : 0
        },
        {
          name: 'Mobile',
          value: deviceCounts.Mobile,
          fill: 'hsl(var(--chart-2))',
          percentage: totalDevices > 0 ? Math.round((deviceCounts.Mobile / totalDevices) * 100) : 0
        },
        {
          name: 'Tablet',
          value: deviceCounts.Tablet,
          fill: 'hsl(var(--chart-3))',
          percentage: totalDevices > 0 ? Math.round((deviceCounts.Tablet / totalDevices) * 100) : 0
        }
      ].filter(device => device.value > 0); // Only include devices with actual usage

      // Find top device
      const topDevice = deviceDistribution.reduce((prev, current) => 
        (prev.value > current.value) ? prev : current
      )?.name || 'No data';

      setAnalytics({
        deviceDistribution,
        totalDevices,
        topDevice,
        mobilePercentage: deviceCounts.Mobile > 0 ? Math.round((deviceCounts.Mobile / totalDevices) * 100) : 0,
        desktopPercentage: deviceCounts.Desktop > 0 ? Math.round((deviceCounts.Desktop / totalDevices) * 100) : 0,
        tabletPercentage: deviceCounts.Tablet > 0 ? Math.round((deviceCounts.Tablet / totalDevices) * 100) : 0
      });

    } catch (err: any) {
      console.error('Error fetching device analytics:', err);
      setError(err.message);
      // Set fallback data
      setAnalytics({
        deviceDistribution: [],
        totalDevices: 0,
        topDevice: 'No data',
        mobilePercentage: 0,
        desktopPercentage: 0,
        tabletPercentage: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceAnalytics();
  }, []);

  return {
    analytics,
    loading,
    error,
    refetch: fetchDeviceAnalytics
  };
};
