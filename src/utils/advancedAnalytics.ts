
import { supabase } from "@/integrations/supabase/client";
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";

export interface AnalyticsMetrics {
  campaignId: string;
  totalTargets: number;
  emailsSent: number;
  emailsDelivered: number;
  emailsOpened: number;
  emailsClicked: number;
  dataSubmitted: number;
  reported: number;
  
  // Advanced metrics
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  submitRate: number;
  reportRate: number;
  
  // Time-based analysis
  timeToFirstClick?: number; // in minutes
  peakActivityHours: number[];
  
  // Geographic data
  topCountries: Array<{ country: string; count: number; percentage: number }>;
  topRegions: Array<{ region: string; count: number; percentage: number }>;
  
  // Device/Browser analysis
  topUserAgents: Array<{ userAgent: string; count: number; percentage: number }>;
  
  // Trend data
  dailyMetrics: Array<{
    date: string;
    sent: number;
    opened: number;
    clicked: number;
    submitted: number;
  }>;
}

export class AdvancedAnalyticsService {
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
      // Fetch campaign metrics
      const { data: metrics, error: metricsError } = await supabase
        .from('campaign_metrics')
        .select('*')
        .eq('campaign_id', campaignId);

      if (metricsError) throw metricsError;

      // Fetch campaign details for total targets
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select(`
          *,
          target_list:target_lists(target_count)
        `)
        .eq('id', campaignId)
        .single();

      if (campaignError) throw campaignError;

      const totalTargets = campaign.target_list?.target_count || 0;
      
      // Calculate basic metrics
      const emailsSent = metrics.filter(m => m.sent_at).length;
      const emailsDelivered = metrics.filter(m => m.delivered_at).length;
      const emailsOpened = metrics.filter(m => m.opened_at).length;
      const emailsClicked = metrics.filter(m => m.clicked_at).length;
      const dataSubmitted = metrics.filter(m => m.data_submitted_at).length;
      const reported = metrics.filter(m => m.reported_at).length;
      
      // Calculate rates
      const deliveryRate = emailsSent > 0 ? (emailsDelivered / emailsSent) * 100 : 0;
      const openRate = emailsDelivered > 0 ? (emailsOpened / emailsDelivered) * 100 : 0;
      const clickRate = emailsOpened > 0 ? (emailsClicked / emailsOpened) * 100 : 0;
      const submitRate = emailsClicked > 0 ? (dataSubmitted / emailsClicked) * 100 : 0;
      const reportRate = emailsSent > 0 ? (reported / emailsSent) * 100 : 0;
      
      // Calculate time to first click
      const timeToFirstClick = this.calculateTimeToFirstClick(metrics);
      
      // Analyze peak activity hours
      const peakActivityHours = this.analyzePeakActivityHours(metrics);
      
      // Geographic analysis
      const topCountries = this.analyzeGeographicData(metrics, 'country');
      const topRegions = this.analyzeGeographicData(metrics, 'region');
      
      // User agent analysis
      const topUserAgents = this.analyzeUserAgents(metrics);
      
      // Daily metrics trend
      const dailyMetrics = this.calculateDailyMetrics(metrics);

      const analytics: AnalyticsMetrics = {
        campaignId,
        totalTargets,
        emailsSent,
        emailsDelivered,
        emailsOpened,
        emailsClicked,
        dataSubmitted,
        reported,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        openRate: Math.round(openRate * 100) / 100,
        clickRate: Math.round(clickRate * 100) / 100,
        submitRate: Math.round(submitRate * 100) / 100,
        reportRate: Math.round(reportRate * 100) / 100,
        timeToFirstClick,
        peakActivityHours,
        topCountries,
        topRegions,
        topUserAgents,
        dailyMetrics
      };

      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Generated advanced analytics",
        { campaignId, analytics }
      );

      return analytics;
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to generate campaign analytics",
        { error, campaignId }
      );
      throw error;
    }
  }
  
  private calculateTimeToFirstClick(metrics: any[]): number | undefined {
    const clickedMetrics = metrics.filter(m => m.sent_at && m.clicked_at);
    
    if (clickedMetrics.length === 0) return undefined;
    
    const times = clickedMetrics.map(m => {
      const sentTime = new Date(m.sent_at).getTime();
      const clickedTime = new Date(m.clicked_at).getTime();
      return (clickedTime - sentTime) / (1000 * 60); // Convert to minutes
    });
    
    return Math.round(times.reduce((sum, time) => sum + time, 0) / times.length);
  }
  
  private analyzePeakActivityHours(metrics: any[]): number[] {
    const hourCounts: Record<number, number> = {};
    
    metrics.forEach(m => {
      if (m.clicked_at) {
        const hour = new Date(m.clicked_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });
    
    const sortedHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
    
    return sortedHours;
  }
  
  private analyzeGeographicData(metrics: any[], field: 'country' | 'region'): Array<{ [key: string]: string | number }> {
    const counts: Record<string, number> = {};
    const total = metrics.length;
    
    metrics.forEach(m => {
      if (m.additional_data?.location?.[field]) {
        const location = m.additional_data.location[field];
        counts[location] = (counts[location] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({
        [field]: location,
        count,
        percentage: Math.round((count / total) * 10000) / 100
      }));
  }
  
  private analyzeUserAgents(metrics: any[]): Array<{ userAgent: string; count: number; percentage: number }> {
    const counts: Record<string, number> = {};
    const total = metrics.length;
    
    metrics.forEach(m => {
      if (m.user_agent) {
        // Simplify user agent to browser name
        const browser = this.extractBrowserName(m.user_agent);
        counts[browser] = (counts[browser] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([userAgent, count]) => ({
        userAgent,
        count,
        percentage: Math.round((count / total) * 10000) / 100
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
  
  private calculateDailyMetrics(metrics: any[]): Array<{
    date: string;
    sent: number;
    opened: number;
    clicked: number;
    submitted: number;
  }> {
    const dailyData: Record<string, any> = {};
    
    metrics.forEach(m => {
      const dates = {
        sent: m.sent_at ? new Date(m.sent_at).toISOString().split('T')[0] : null,
        opened: m.opened_at ? new Date(m.opened_at).toISOString().split('T')[0] : null,
        clicked: m.clicked_at ? new Date(m.clicked_at).toISOString().split('T')[0] : null,
        submitted: m.data_submitted_at ? new Date(m.data_submitted_at).toISOString().split('T')[0] : null
      };
      
      Object.entries(dates).forEach(([event, date]) => {
        if (date) {
          if (!dailyData[date]) {
            dailyData[date] = { date, sent: 0, opened: 0, clicked: 0, submitted: 0 };
          }
          dailyData[date][event]++;
        }
      });
    });
    
    return Object.values(dailyData).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }
  
  public async getGlobalAnalytics(): Promise<{
    totalCampaigns: number;
    totalEmailsSent: number;
    averageClickRate: number;
    topPerformingCampaigns: Array<{ name: string; clickRate: number }>;
  }> {
    try {
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*');

      if (campaignsError) throw campaignsError;

      const { data: allMetrics, error: metricsError } = await supabase
        .from('campaign_metrics')
        .select('*');

      if (metricsError) throw metricsError;

      const totalCampaigns = campaigns.length;
      const totalEmailsSent = allMetrics.filter(m => m.sent_at).length;
      
      // Calculate average click rate
      const campaignClickRates = campaigns.map(campaign => {
        const campaignMetrics = allMetrics.filter(m => m.campaign_id === campaign.id);
        const opened = campaignMetrics.filter(m => m.opened_at).length;
        const clicked = campaignMetrics.filter(m => m.clicked_at).length;
        return opened > 0 ? (clicked / opened) * 100 : 0;
      });
      
      const averageClickRate = campaignClickRates.length > 0 
        ? campaignClickRates.reduce((sum, rate) => sum + rate, 0) / campaignClickRates.length 
        : 0;

      // Top performing campaigns
      const topPerformingCampaigns = campaigns
        .map(campaign => {
          const campaignMetrics = allMetrics.filter(m => m.campaign_id === campaign.id);
          const opened = campaignMetrics.filter(m => m.opened_at).length;
          const clicked = campaignMetrics.filter(m => m.clicked_at).length;
          const clickRate = opened > 0 ? (clicked / opened) * 100 : 0;
          return { name: campaign.name, clickRate };
        })
        .sort((a, b) => b.clickRate - a.clickRate)
        .slice(0, 5);

      return {
        totalCampaigns,
        totalEmailsSent,
        averageClickRate: Math.round(averageClickRate * 100) / 100,
        topPerformingCampaigns
      };
    } catch (error) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to generate global analytics",
        { error }
      );
      throw error;
    }
  }
}

export const advancedAnalyticsService = AdvancedAnalyticsService.getInstance();
