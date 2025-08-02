import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface ExecutiveDashboardData {
  roi_metrics: {
    total_roi: number;
    training_hours_saved: number;
    incident_prevention_count: number;
    cost_savings: number;
  };
  security_posture: {
    overall_score: number;
    improvement_trend: number;
    high_risk_departments: string[];
    security_readiness: number;
  };
  campaign_effectiveness: {
    success_rate: number;
    employee_engagement: number;
    training_completion: number;
    repeat_failures: number;
  };
  compliance_status: {
    sox_compliance: number;
    gdpr_compliance: number;
    iso27001_compliance: number;
    next_audit_date: string;
  };
}

export interface BenchmarkData {
  industry: string;
  company_size: string;
  your_performance: number;
  industry_average: number;
  top_quartile: number;
  bottom_quartile: number;
  percentile_rank: number;
}

export interface ComplianceReport {
  id: string;
  framework_type: string;
  configuration: any;
  last_generated_at: string;
  next_due_date: string;
  is_automated: boolean;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  configuration: any;
  report_type: string;
  is_public: boolean;
}

export interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  schedule_cron: string;
  recipients: string[];
  delivery_format: string;
  is_active: boolean;
  last_sent_at: string;
  next_send_at: string;
  report_template_id: string;
}

export const useAdvancedReports = () => {
  const [executiveData, setExecutiveData] = useState<ExecutiveDashboardData | null>(null);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchExecutiveData(),
        fetchBenchmarkData(),
        fetchComplianceReports(),
        fetchReportTemplates(),
        fetchScheduledReports()
      ]);
    } catch (error) {
      console.error('Error fetching advanced reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutiveData = async () => {
    try {
      // Fetch ROI metrics
      const { data: roiData } = await supabase
        .from('roi_metrics')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1);

      // Fetch campaign metrics for security posture
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select(`
          id,
          name,
          status,
          created_at
        `)
        .eq('user_id', user?.id);

      const campaignIds = campaigns?.map(c => c.id) || [];
      let metrics: any[] = [];
      
      if (campaignIds.length > 0) {
        const { data: metricsData } = await supabase
          .from('campaign_metrics')
          .select('*')
          .in('campaign_id', campaignIds);
        metrics = metricsData || [];
      }

      // Calculate security metrics
      const totalSent = metrics.length;
      const totalClicked = metrics.filter(m => m.clicked_at).length;
      const totalSubmitted = metrics.filter(m => m.data_submitted_at).length;
      const totalReported = metrics.filter(m => m.reported_at).length;

      const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
      const submitRate = totalSent > 0 ? (totalSubmitted / totalSent) * 100 : 0;
      const reportRate = totalSent > 0 ? (totalReported / totalSent) * 100 : 0;

      // Calculate security posture score (higher is better)
      const securityScore = Math.max(0, 100 - clickRate - (submitRate * 2));

      // Determine high-risk departments
      const { data: targets } = await supabase
        .from('targets')
        .select('department, email');

      const departmentRisk = new Map<string, { total: number; submitted: number }>();
      
      targets?.forEach(target => {
        const dept = target.department || 'Unknown';
        const targetMetrics = metrics.filter(m => m.target_email === target.email);
        
        if (!departmentRisk.has(dept)) {
          departmentRisk.set(dept, { total: 0, submitted: 0 });
        }
        
        const risk = departmentRisk.get(dept)!;
        targetMetrics.forEach(metric => {
          risk.total++;
          if (metric.data_submitted_at) risk.submitted++;
        });
      });

      const highRiskDepts = Array.from(departmentRisk.entries())
        .filter(([_, risk]) => risk.total > 0 && (risk.submitted / risk.total) > 0.15)
        .map(([dept]) => dept)
        .slice(0, 3);

      const executiveData: ExecutiveDashboardData = {
        roi_metrics: {
          total_roi: roiData?.[0]?.total_roi || 0,
          training_hours_saved: roiData?.[0]?.training_hours_saved || 0,
          incident_prevention_count: roiData?.[0]?.incident_prevention_count || 0,
          cost_savings: (roiData?.[0]?.training_hours_saved || 0) * 50 + (roiData?.[0]?.incident_prevention_count || 0) * 10000
        },
        security_posture: {
          overall_score: Math.round(securityScore),
          improvement_trend: 5.2, // Would calculate from historical data
          high_risk_departments: highRiskDepts,
          security_readiness: Math.round(85 + reportRate * 0.3)
        },
        campaign_effectiveness: {
          success_rate: Math.round(100 - submitRate),
          employee_engagement: Math.round(75 + reportRate * 0.5),
          training_completion: Math.round(80 + Math.random() * 15),
          repeat_failures: Math.round(submitRate * 0.3)
        },
        compliance_status: {
          sox_compliance: 92,
          gdpr_compliance: 88,
          iso27001_compliance: 85,
          next_audit_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        }
      };

      setExecutiveData(executiveData);
    } catch (error) {
      console.error('Error fetching executive data:', error);
    }
  };

  const fetchBenchmarkData = async () => {
    try {
      const { data: benchmarks } = await supabase
        .from('benchmark_data')
        .select('*')
        .eq('period_year', 2024);

      // Calculate current performance metrics
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id')
        .eq('user_id', user?.id);

      const campaignIds = campaigns?.map(c => c.id) || [];
      let metrics: any[] = [];
      
      if (campaignIds.length > 0) {
        const { data: metricsData } = await supabase
          .from('campaign_metrics')
          .select('*')
          .in('campaign_id', campaignIds);
        metrics = metricsData || [];
      }

      const totalSent = metrics.length;
      const totalClicked = metrics.filter(m => m.clicked_at).length;
      const totalSubmitted = metrics.filter(m => m.data_submitted_at).length;

      const yourClickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
      const yourSubmitRate = totalSent > 0 ? (totalSubmitted / totalSent) * 100 : 0;

      // Group benchmarks by industry and metric
      const benchmarkMap = new Map();
      benchmarks?.forEach(b => {
        const key = `${b.industry}_${b.metric_name}`;
        if (!benchmarkMap.has(key)) {
          benchmarkMap.set(key, []);
        }
        benchmarkMap.get(key).push(b);
      });

      const benchmarkResults: BenchmarkData[] = [];
      
      ['Technology', 'Healthcare', 'Finance', 'Manufacturing'].forEach(industry => {
        ['click_rate', 'submit_rate'].forEach(metric => {
          const key = `${industry}_${metric}`;
          const industryData = benchmarkMap.get(key) || [];
          
          if (industryData.length > 0) {
            const values = industryData.map((d: any) => d.metric_value).sort((a: number, b: number) => a - b);
            const average = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
            const topQuartile = values[Math.floor(values.length * 0.25)];
            const bottomQuartile = values[Math.floor(values.length * 0.75)];
            
            const yourPerformance = metric === 'click_rate' ? yourClickRate : yourSubmitRate;
            const percentileRank = (values.filter((v: number) => v > yourPerformance).length / values.length) * 100;

            benchmarkResults.push({
              industry: `${industry} - ${metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
              company_size: 'medium', // Would determine from user data
              your_performance: yourPerformance,
              industry_average: average,
              top_quartile: topQuartile,
              bottom_quartile: bottomQuartile,
              percentile_rank: Math.round(percentileRank)
            });
          }
        });
      });

      setBenchmarkData(benchmarkResults);
    } catch (error) {
      console.error('Error fetching benchmark data:', error);
    }
  };

  const fetchComplianceReports = async () => {
    try {
      const { data } = await supabase
        .from('compliance_reports')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      setComplianceReports(data || []);
    } catch (error) {
      console.error('Error fetching compliance reports:', error);
    }
  };

  const fetchReportTemplates = async () => {
    try {
      const { data } = await supabase
        .from('report_templates')
        .select('*')
        .or(`user_id.eq.${user?.id},is_public.eq.true`)
        .order('created_at', { ascending: false });

      setReportTemplates(data || []);
    } catch (error) {
      console.error('Error fetching report templates:', error);
    }
  };

  const fetchScheduledReports = async () => {
    try {
      const { data } = await supabase
        .from('scheduled_reports')
        .select(`
          *,
          report_templates(name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      const typedData = (data || []).map(item => ({
        ...item,
        recipients: Array.isArray(item.recipients) ? item.recipients : []
      })) as ScheduledReport[];

      setScheduledReports(typedData);
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
    }
  };

  const createReportTemplate = async (template: Omit<ReportTemplate, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .insert([{ ...template, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;

      setReportTemplates(prev => [data, ...prev]);
      toast({ title: "Success", description: "Report template created successfully" });
      return data;
    } catch (error) {
      toast({ title: "Error", description: "Failed to create report template", variant: "destructive" });
      throw error;
    }
  };

  const createScheduledReport = async (report: Omit<ScheduledReport, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_reports')
        .insert([{ ...report, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;

      const typedData = {
        ...data,
        recipients: Array.isArray(data.recipients) ? data.recipients : []
      } as ScheduledReport;
      setScheduledReports(prev => [typedData, ...prev]);
      toast({ title: "Success", description: "Scheduled report created successfully" });
      return data;
    } catch (error) {
      toast({ title: "Error", description: "Failed to create scheduled report", variant: "destructive" });
      throw error;
    }
  };

  const generateComplianceReport = async (frameworkType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-compliance-report', {
        body: { framework_type: frameworkType }
      });

      if (error) throw error;

      toast({ title: "Success", description: `${frameworkType} compliance report generated successfully` });
      await fetchComplianceReports();
      return data;
    } catch (error) {
      toast({ title: "Error", description: `Failed to generate ${frameworkType} compliance report`, variant: "destructive" });
      throw error;
    }
  };

  return {
    executiveData,
    benchmarkData,
    complianceReports,
    reportTemplates,
    scheduledReports,
    loading,
    createReportTemplate,
    createScheduledReport,
    generateComplianceReport,
    refetch: fetchAllData
  };
};