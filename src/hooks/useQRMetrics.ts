import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QRScanMetrics {
  total_sent: number;
  total_opened: number;
  total_scanned: number;
  unique_scanners: number;
  mobile_scans: number;
  desktop_scans: number;
  scan_rate: number;
  avg_time_to_scan: number;
}

interface QRScan {
  id: string;
  target_email: string;
  scanned_at: string;
  device_type: string;
  is_mobile: boolean;
}

export const useQRMetrics = (campaignId: string) => {
  const [campaignStats, setCampaignStats] = useState<QRScanMetrics | null>(null);
  const [scans, setScans] = useState<QRScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQRMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch campaign metrics
      const { data: metrics, error: metricsError } = await supabase
        .from('campaign_metrics')
        .select('*')
        .eq('campaign_id', campaignId);

      if (metricsError) throw metricsError;

      if (!metrics || metrics.length === 0) {
        setCampaignStats(null);
        setScans([]);
        return;
      }

      // Calculate QR scan metrics
      const totalSent = metrics.filter(m => m.sent_at).length;
      const totalOpened = metrics.filter(m => m.opened_at).length;
      const totalScanned = metrics.filter(m => m.clicked_at).length; // QR scans tracked as clicks
      const uniqueScanners = new Set(metrics.filter(m => m.clicked_at).map(m => m.target_email)).size;

      // Parse device info from user_agent
      const mobileScans = metrics.filter(m => {
        if (!m.user_agent || !m.clicked_at) return false;
        const ua = m.user_agent.toLowerCase();
        return ua.includes('mobile') || ua.includes('android') || ua.includes('iphone');
      }).length;

      const desktopScans = totalScanned - mobileScans;

      // Calculate scan rate
      const scanRate = totalSent > 0 ? (totalScanned / totalSent) * 100 : 0;

      // Calculate average time to scan (in minutes)
      let totalTimeToScan = 0;
      let scanCount = 0;
      metrics.forEach(m => {
        if (m.sent_at && m.clicked_at) {
          const sentTime = new Date(m.sent_at).getTime();
          const scanTime = new Date(m.clicked_at).getTime();
          totalTimeToScan += (scanTime - sentTime) / 60000; // Convert to minutes
          scanCount++;
        }
      });
      const avgTimeToScan = scanCount > 0 ? totalTimeToScan / scanCount : 0;

      setCampaignStats({
        total_sent: totalSent,
        total_opened: totalOpened,
        total_scanned: totalScanned,
        unique_scanners: uniqueScanners,
        mobile_scans: mobileScans,
        desktop_scans: desktopScans,
        scan_rate: scanRate,
        avg_time_to_scan: avgTimeToScan
      });

      // Map scans for recent activity
      const scanData: QRScan[] = metrics
        .filter(m => m.clicked_at)
        .map(m => {
          const ua = m.user_agent?.toLowerCase() || '';
          const isMobile = ua.includes('mobile') || ua.includes('android') || ua.includes('iphone');
          return {
            id: m.id,
            target_email: m.target_email,
            scanned_at: m.clicked_at!,
            device_type: isMobile ? 'Mobile' : 'Desktop',
            is_mobile: isMobile
          };
        })
        .sort((a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime());

      setScans(scanData);

    } catch (err: any) {
      console.error('Error fetching QR metrics:', err);
      setError(err.message);
      setCampaignStats(null);
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRMetrics();
  }, [campaignId]);

  const getRecentScans = (limit: number = 5) => {
    return scans.slice(0, limit);
  };

  const getDeviceBreakdown = () => {
    if (!campaignStats) return [];
    
    const total = campaignStats.total_scanned;
    if (total === 0) return [];

    return [
      {
        device: 'mobile',
        count: campaignStats.mobile_scans,
        percentage: (campaignStats.mobile_scans / total) * 100
      },
      {
        device: 'desktop',
        count: campaignStats.desktop_scans,
        percentage: (campaignStats.desktop_scans / total) * 100
      }
    ];
  };

  const getScanTimeline = () => {
    // Group scans by hour for the last 24 hours
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentScans = scans.filter(scan => 
      new Date(scan.scanned_at) >= last24Hours
    );

    const timeline: { [key: string]: number } = {};
    recentScans.forEach(scan => {
      const hour = new Date(scan.scanned_at).getHours();
      const key = `${hour}:00`;
      timeline[key] = (timeline[key] || 0) + 1;
    });

    return Object.entries(timeline).map(([hour, count]) => ({
      hour,
      count
    }));
  };

  return {
    campaignStats,
    scans,
    loading,
    error,
    refetch: fetchQRMetrics,
    getRecentScans,
    getDeviceBreakdown,
    getScanTimeline
  };
};
