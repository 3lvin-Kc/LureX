
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { securityLogger, SecurityEventType } from '@/utils/securityLogger';

export interface ReportData {
  campaignData: Array<{
    name: string;
    sent: number;
    opened: number;
    clicked: number;
    submitted: number;
    reported: number;
  }>;
  departmentData: Array<{
    department: string;
    sent: number;
    opened: number;
    clicked: number;
    submitted: number;
    vulnerability_score: number;
  }>;
  overallMetrics: {
    totalCampaigns: number;
    totalEmailsSent: number;
    averageOpenRate: number;
    averageClickRate: number;
    averageSubmitRate: number;
    averageReportRate: number;
    improvementTrend: number;
  };
  timeSeriesData: Array<{
    date: string;
    campaigns: number;
    emails_sent: number;
    click_rate: number;
    submit_rate: number;
  }>;
}

export const useReports = (timeframe: string = '30') => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData();
  }, [timeframe]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeframe));

      // Fetch campaigns and their metrics
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select(`
          id,
          name,
          created_at,
          status
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (campaignsError) throw campaignsError;

      // Fetch campaign metrics
      const campaignIds = campaigns?.map(c => c.id) || [];
      
      let allMetrics: any[] = [];
      if (campaignIds.length > 0) {
        const { data: metrics, error: metricsError } = await supabase
          .from('campaign_metrics')
          .select('*')
          .in('campaign_id', campaignIds);

        if (metricsError) throw metricsError;
        allMetrics = metrics || [];
      }

      // Process campaign data
      const campaignData = campaigns?.map(campaign => {
        const campaignMetrics = allMetrics.filter(m => m.campaign_id === campaign.id);
        const sent = campaignMetrics.length;
        const opened = campaignMetrics.filter(m => m.opened_at).length;
        const clicked = campaignMetrics.filter(m => m.clicked_at).length;
        const submitted = campaignMetrics.filter(m => m.data_submitted_at).length;
        const reported = campaignMetrics.filter(m => m.reported_at).length;

        return {
          name: campaign.name,
          sent,
          opened,
          clicked,
          submitted,
          reported
        };
      }) || [];

      // Process department data
      const departmentMap = new Map<string, {
        sent: number;
        opened: number;
        clicked: number;
        submitted: number;
      }>();

      // Get target data for department analysis
      if (campaignIds.length > 0) {
        for (const campaignId of campaignIds) {
          // Get campaign's target list
          const { data: campaign } = await supabase
            .from('campaigns')
            .select('target_list_id')
            .eq('id', campaignId)
            .single();

          if (campaign?.target_list_id) {
            // Get targets with departments
            const { data: targets } = await supabase
              .from('targets')
              .select('email, department')
              .eq('list_id', campaign.target_list_id);

            targets?.forEach(target => {
              const dept = target.department || 'Unknown';
              const targetMetrics = allMetrics.filter(m => 
                m.campaign_id === campaignId && m.target_email === target.email
              );

              if (!departmentMap.has(dept)) {
                departmentMap.set(dept, { sent: 0, opened: 0, clicked: 0, submitted: 0 });
              }

              const deptData = departmentMap.get(dept)!;
              targetMetrics.forEach(metric => {
                deptData.sent++;
                if (metric.opened_at) deptData.opened++;
                if (metric.clicked_at) deptData.clicked++;
                if (metric.data_submitted_at) deptData.submitted++;
              });
            });
          }
        }
      }

      const departmentData = Array.from(departmentMap.entries()).map(([department, data]) => ({
        department,
        ...data,
        vulnerability_score: data.sent > 0 ? Math.round((data.submitted / data.sent) * 100) : 0
      }));

      // Calculate overall metrics
      const totalSent = allMetrics.length;
      const totalOpened = allMetrics.filter(m => m.opened_at).length;
      const totalClicked = allMetrics.filter(m => m.clicked_at).length;
      const totalSubmitted = allMetrics.filter(m => m.data_submitted_at).length;
      const totalReported = allMetrics.filter(m => m.reported_at).length;

      const overallMetrics = {
        totalCampaigns: campaigns?.length || 0,
        totalEmailsSent: totalSent,
        averageOpenRate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
        averageClickRate: totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0,
        averageSubmitRate: totalSent > 0 ? Math.round((totalSubmitted / totalSent) * 100) : 0,
        averageReportRate: totalSent > 0 ? Math.round((totalReported / totalSent) * 100) : 0,
        improvementTrend: 0 // Would need historical data for comparison
      };

      // Generate time series data
      const timeSeriesMap = new Map<string, {
        campaigns: number;
        emails_sent: number;
        clicked: number;
        submitted: number;
      }>();

      // Group by date
      campaigns?.forEach(campaign => {
        const date = new Date(campaign.created_at).toISOString().split('T')[0];
        if (!timeSeriesMap.has(date)) {
          timeSeriesMap.set(date, { campaigns: 0, emails_sent: 0, clicked: 0, submitted: 0 });
        }
        
        const dayData = timeSeriesMap.get(date)!;
        dayData.campaigns++;
        
        const campaignMetrics = allMetrics.filter(m => m.campaign_id === campaign.id);
        dayData.emails_sent += campaignMetrics.length;
        dayData.clicked += campaignMetrics.filter(m => m.clicked_at).length;
        dayData.submitted += campaignMetrics.filter(m => m.data_submitted_at).length;
      });

      const timeSeriesData = Array.from(timeSeriesMap.entries()).map(([date, data]) => ({
        date,
        campaigns: data.campaigns,
        emails_sent: data.emails_sent,
        click_rate: data.emails_sent > 0 ? Math.round((data.clicked / data.emails_sent) * 100) : 0,
        submit_rate: data.emails_sent > 0 ? Math.round((data.submitted / data.emails_sent) * 100) : 0
      })).sort((a, b) => a.date.localeCompare(b.date));

      const finalReportData: ReportData = {
        campaignData,
        departmentData,
        overallMetrics,
        timeSeriesData
      };

      setReportData(finalReportData);

      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Generated comprehensive report data",
        { timeframe, metricsCount: allMetrics.length }
      );

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch report data';
      setError(errorMessage);
      
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Failed to generate report data",
        { error: err, timeframe }
      );
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'csv') => {
    try {
      // Call the export function based on format
      const { data, error } = await supabase.functions.invoke('export-report', {
        body: { 
          reportData, 
          format,
          timeframe 
        }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data], { 
        type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `phishing-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        `Exported report in ${format} format`,
        { timeframe }
      );

    } catch (err) {
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        `Failed to export report in ${format} format`,
        { error: err, timeframe }
      );
      throw err;
    }
  };

  return {
    reportData,
    loading,
    error,
    refetch: fetchReportData,
    exportReport
  };
};
