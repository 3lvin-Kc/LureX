
import { supabase } from "@/integrations/supabase/client";
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";

export interface AnalyticsMetrics {
  emailsSent: number;
  emailsDelivered: number;
  emailsOpened: number;
  emailsClicked: number;
  dataSubmitted: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  submitRate: number;
  reportRate: number;
  timeToFirstClick?: number;
  peakActivityHours: number[];
  dailyMetrics: Array<{
    date: string;
    sent: number;
    opened: number;
    clicked: number;
    submitted: number;
  }>;
  topCountries: Array<{
    country: string;
    percentage: number;
  }>;
  topRegions: Array<{
    region: string;
    percentage: number;
  }>;
  topUserAgents: Array<{
    userAgent: string;
    count: number;
    percentage: number;
  }>;
}

class AdvancedAnalyticsService {
  private static instance: AdvancedAnalyticsService;

  private constructor() {}

  public static getInstance(): AdvancedAnalyticsService {
    if (!AdvancedAnalyticsService.instance) {
      AdvancedAnalyticsService.instance = new AdvancedAnalyticsService();
    }
    return AdvancedAnalyticsService.instance;
  }

  public async getCampaignAnalytics(campaignId: string): Promise<AnalyticsMetrics> {
    try {
      // Get campaign metrics from Supabase
      const { data: metrics, error } = await supabase
        .from('campaign_metrics')
        .select('*')
        .eq('campaign_id', campaignId);

      if (error) throw error;

      const totalSent = metrics?.length || 0;
      const totalDelivered = metrics?.filter(m => m.delivered_at).length || 0;
      const totalOpened = metrics?.filter(m => m.opened_at).length || 0;
      const totalClicked = metrics?.filter(m => m.clicked_at).length || 0;
      const totalSubmitted = metrics?.filter(m => m.data_submitted_at).length || 0;
      const totalReported = metrics?.filter(m => m.reported_at).length || 0;

      // Calculate rates
      const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
      const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
      const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;
      const submitRate = totalSent > 0 ? Math.round((totalSubmitted / totalSent) * 100) : 0;
      const reportRate = totalSent > 0 ? Math.round((totalReported / totalSent) * 100) : 0;

      // Calculate time to first click
      const clickedMetrics = metrics?.filter(m => m.clicked_at && m.sent_at) || [];
      let timeToFirstClick: number | undefined;
      
      if (clickedMetrics.length > 0) {
        const times = clickedMetrics.map(m => {
          const sent = new Date(m.sent_at!).getTime();
          const clicked = new Date(m.clicked_at!).getTime();
          return (clicked - sent) / (1000 * 60); // minutes
        });
        timeToFirstClick = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      }

      // Calculate peak activity hours
      const peakActivityHours: number[] = [];
      const hourCounts = new Map<number, number>();
      
      metrics?.forEach(metric => {
        if (metric.clicked_at) {
          const hour = new Date(metric.clicked_at).getHours();
          hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        }
      });

      const sortedHours = Array.from(hourCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour]) => hour);
      
      peakActivityHours.push(...sortedHours);

      // Generate daily metrics
      const dailyMetrics = this.generateDailyMetrics(metrics || []);

      // Analyze geographic data
      const { topCountries, topRegions } = this.analyzeGeographicData(metrics || []);

      // Analyze user agents
      const topUserAgents = this.analyzeUserAgents(metrics || []);

      const result: AnalyticsMetrics = {
        emailsSent: totalSent,
        emailsDelivered: totalDelivered,
        emailsOpened: totalOpened,
        emailsClicked: totalClicked,
        dataSubmitted: totalSubmitted,
        deliveryRate,
        openRate,
        clickRate,
        submitRate,
        reportRate,
        timeToFirstClick,
        peakActivityHours,
        dailyMetrics,
        topCountries,
        topRegions,
        topUserAgents
      };

      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Generated advanced analytics",
        { campaignId, metrics: result }
      );

      return result;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to generate advanced analytics",
        { error, campaignId }
      );
      throw error;
    }
  }

  private generateDailyMetrics(metrics: any[]) {
    const dailyMap = new Map<string, { sent: number; opened: number; clicked: number; submitted: number }>();

    metrics.forEach(metric => {
      if (metric.sent_at) {
        const date = new Date(metric.sent_at).toISOString().split('T')[0];
        
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { sent: 0, opened: 0, clicked: 0, submitted: 0 });
        }
        
        const dayData = dailyMap.get(date)!;
        dayData.sent++;
        if (metric.opened_at) dayData.opened++;
        if (metric.clicked_at) dayData.clicked++;
        if (metric.data_submitted_at) dayData.submitted++;
      }
    });

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private analyzeGeographicData(metrics: any[]) {
    const countryCounts = new Map<string, number>();
    const regionCounts = new Map<string, number>();
    
    metrics.forEach(metric => {
      if (metric.additional_data?.location) {
        const location = metric.additional_data.location;
        if (location.country) {
          countryCounts.set(location.country, (countryCounts.get(location.country) || 0) + 1);
        }
        if (location.region) {
          regionCounts.set(location.region, (regionCounts.get(location.region) || 0) + 1);
        }
      }
    });

    const total = metrics.length;
    
    const topCountries = Array.from(countryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([country, count]) => ({
        country,
        percentage: Math.round((count / total) * 100)
      }));

    const topRegions = Array.from(regionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([region, count]) => ({
        region,
        percentage: Math.round((count / total) * 100)
      }));

    return { topCountries, topRegions };
  }

  private analyzeUserAgents(metrics: any[]) {
    const userAgentCounts = new Map<string, number>();
    
    metrics.forEach(metric => {
      if (metric.user_agent) {
        // Extract browser name from user agent
        const browserName = this.extractBrowserName(metric.user_agent);
        userAgentCounts.set(browserName, (userAgentCounts.get(browserName) || 0) + 1);
      }
    });

    const total = metrics.length;
    
    return Array.from(userAgentCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([userAgent, count]) => ({
        userAgent,
        count,
        percentage: Math.round((count / total) * 100)
      }));
  }

  private extractBrowserName(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Other';
  }
}

export const advancedAnalyticsService = AdvancedAnalyticsService.getInstance();
