import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSimulationMetrics, SimulationType } from './useSimulationMetrics';
import { useCampaignSummary } from './useCampaignSummary';
import { useDepartmentVulnerability } from './useDepartmentVulnerability';
import { useHistoricalActivities } from './useHistoricalActivities';

export interface ComprehensiveReportData {
  // Meta information
  generatedAt: string;
  generatedBy: string;
  organizationName: string;
  timePeriod: number;
  dateRange: { start: string; end: string };
  
  // Executive Summary
  executiveSummary: {
    totalCampaigns: number;
    totalEmailsSent: number;
    overallClickRate: number;
    overallSubmitRate: number;
    overallReportRate: number;
    highRiskDepartments: number;
    criticalFindings: string[];
  };
  
  // Simulation Type Analysis
  simulationMetrics: {
    type: SimulationType;
    linkMetrics: any;
    fileMetrics: any;
    spiderData: any[];
  };
  
  // Campaign Summary
  campaigns: any[];
  
  // Department Risk Analysis
  departments: any[];
  
  // Historical Activities (top 50)
  recentActivities: any[];
}

export const useComprehensiveReportData = (
  simulationType: SimulationType,
  timePeriod: number
) => {
  const [reportData, setReportData] = useState<ComprehensiveReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use existing hooks
  const {
    linkMetrics,
    fileMetrics,
    spiderData,
    loading: metricsLoading,
  } = useSimulationMetrics(simulationType, timePeriod);

  const {
    campaigns,
    loading: campaignsLoading,
  } = useCampaignSummary();

  const {
    departments,
    loading: departmentsLoading,
  } = useDepartmentVulnerability();

  const {
    activities: recentActivities,
    loading: activitiesLoading,
  } = useHistoricalActivities();

  const collectComprehensiveData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user profile information
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, company_name')
        .eq('id', user.id)
        .single();

      const generatedBy = profile?.first_name && profile?.last_name
        ? `${profile.first_name} ${profile.last_name}`
        : user.email || 'Unknown User';

      const organizationName = profile?.company_name || 'Organization';

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timePeriod);

      // Calculate executive summary metrics
      const totalCampaigns = campaigns?.length || 0;
      const totalEmailsSent = (linkMetrics?.emailsSent || 0) + (fileMetrics?.emailsSent || 0);
      const totalClicked = (linkMetrics?.interactions || 0) + (fileMetrics?.interactions || 0);
      const totalSubmitted = (linkMetrics?.submissions || 0) + (fileMetrics?.submissions || 0);
      const totalReported = (linkMetrics?.reports || 0) + (fileMetrics?.reports || 0);

      const overallClickRate = totalEmailsSent > 0
        ? Math.round((totalClicked / totalEmailsSent) * 100 * 10) / 10
        : 0;
      const overallSubmitRate = totalEmailsSent > 0
        ? Math.round((totalSubmitted / totalEmailsSent) * 100 * 10) / 10
        : 0;
      const overallReportRate = totalEmailsSent > 0
        ? Math.round((totalReported / totalEmailsSent) * 100 * 10) / 10
        : 0;

      const highRiskDepartments = departments?.filter(d => d.riskLevel === 'high').length || 0;

      // Generate critical findings
      const criticalFindings: string[] = [];
      if (overallSubmitRate > 20) {
        criticalFindings.push(`High credential compromise rate: ${overallSubmitRate}% of users entered credentials`);
      }
      if (highRiskDepartments > 0) {
        criticalFindings.push(`${highRiskDepartments} department${highRiskDepartments > 1 ? 's' : ''} at high risk`);
      }
      if (overallClickRate > 40) {
        criticalFindings.push(`Critical phishing susceptibility: ${overallClickRate}% click-through rate`);
      }
      if (overallReportRate < 5 && totalEmailsSent > 0) {
        criticalFindings.push(`Low security awareness: Only ${overallReportRate}% report suspicious emails`);
      }
      if (criticalFindings.length === 0) {
        criticalFindings.push('No critical security issues identified in the reporting period');
      }

      const comprehensiveData: ComprehensiveReportData = {
        generatedAt: new Date().toISOString(),
        generatedBy,
        organizationName,
        timePeriod,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        executiveSummary: {
          totalCampaigns,
          totalEmailsSent,
          overallClickRate,
          overallSubmitRate,
          overallReportRate,
          highRiskDepartments,
          criticalFindings,
        },
        simulationMetrics: {
          type: simulationType,
          linkMetrics: linkMetrics || null,
          fileMetrics: fileMetrics || null,
          spiderData: spiderData || [],
        },
        campaigns: campaigns || [],
        departments: departments || [],
        recentActivities: (recentActivities || []).slice(0, 50), // Limit to 50
      };

      setReportData(comprehensiveData);
    } catch (err: any) {
      console.error('Error collecting comprehensive report data:', err);
      setError(err.message);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for all hooks to finish loading
    if (!metricsLoading && !campaignsLoading && !departmentsLoading && !activitiesLoading) {
      collectComprehensiveData();
    }
  }, [
    metricsLoading,
    campaignsLoading,
    departmentsLoading,
    activitiesLoading,
    linkMetrics,
    fileMetrics,
    spiderData,
    campaigns,
    departments,
    recentActivities,
  ]);

  return {
    reportData,
    loading: loading || metricsLoading || campaignsLoading || departmentsLoading || activitiesLoading,
    error,
    refetch: collectComprehensiveData,
  };
};
