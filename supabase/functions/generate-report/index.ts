
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Enum types matching client-side enums
enum ReportType {
  CAMPAIGN_SUMMARY = 'campaign_summary',
  USER_SUSCEPTIBILITY = 'user_susceptibility',
  DEPARTMENT_COMPARISON = 'department_comparison',
  TREND_ANALYSIS = 'trend_analysis',
  VULNERABILITY_ASSESSMENT = 'vulnerability_assessment',
  COMPLIANCE_AUDIT = 'compliance_audit',
  SECURITY_AWARENESS = 'security_awareness',
  EXECUTIVE_SUMMARY = 'executive_summary',
  DATA_EXPORT = 'data_export'
}

enum ComplianceFramework {
  GDPR = 'gdpr',
  HIPAA = 'hipaa',
  PCI_DSS = 'pci_dss',
  ISO_27001 = 'iso_27001',
  NIST_800_53 = 'nist_800_53',
  SOC2 = 'soc2',
  CCPA = 'ccpa',
  LGPD = 'lgpd'
}

interface ReportOptions {
  reportType: ReportType;
  startDate?: string;
  endDate?: string;
  campaignIds?: string[];
  departments?: string[];
  userIds?: string[];
  complianceFrameworks?: ComplianceFramework[];
  includeRawData?: boolean;
  aggregationLevel?: 'daily' | 'weekly' | 'monthly';
  format?: 'pdf' | 'excel' | 'csv' | 'json' | 'html';
  customParameters?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { options } = await req.json() as { options: ReportOptions };
    
    if (!options || !options.reportType) {
      throw new Error("Missing required report options");
    }
    
    console.log("Generating report:", options.reportType);
    
    // Set default date range if not provided
    const endDate = options.endDate ? new Date(options.endDate) : new Date();
    let startDate: Date;
    
    if (options.startDate) {
      startDate = new Date(options.startDate);
    } else {
      // Default to last 30 days if not specified
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }
    
    // Generate report based on type
    const reportData = await generateReportData(options, startDate, endDate);
    
    // Generate report ID
    const reportId = crypto.randomUUID();
    
    // Store the report metadata
    await supabase
      .from("reports")
      .insert({
        id: reportId,
        report_type: options.reportType,
        generated_at: new Date().toISOString(),
        format: options.format || 'pdf',
        parameters: options
      });
    
    // Format the report
    const formattedReport = await formatReport(reportData, options.format || 'pdf');
    
    // Store the report content or return it directly
    if (options.format === 'json') {
      return new Response(
        JSON.stringify({ reportId, data: formattedReport }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      // For other formats, store the report in Supabase Storage and return a download URL
      // This part would typically store the file in a storage bucket
      
      // Placeholder download URL
      const downloadUrl = `${supabaseUrl}/storage/v1/object/reports/${reportId}.${options.format || 'pdf'}`;
      
      return new Response(
        JSON.stringify({ reportId, downloadUrl }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error in generate-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Generate report data based on report type and options
 */
async function generateReportData(
  options: ReportOptions, 
  startDate: Date, 
  endDate: Date
): Promise<any> {
  switch (options.reportType) {
    case ReportType.CAMPAIGN_SUMMARY:
      return generateCampaignSummary(options, startDate, endDate);
      
    case ReportType.USER_SUSCEPTIBILITY:
      return generateUserSusceptibility(options, startDate, endDate);
      
    case ReportType.DEPARTMENT_COMPARISON:
      return generateDepartmentComparison(options, startDate, endDate);
      
    case ReportType.TREND_ANALYSIS:
      return generateTrendAnalysis(options, startDate, endDate);
      
    case ReportType.COMPLIANCE_AUDIT:
      return generateComplianceAudit(options, startDate, endDate);
      
    case ReportType.EXECUTIVE_SUMMARY:
      return generateExecutiveSummary(options, startDate, endDate);
      
    default:
      throw new Error(`Unsupported report type: ${options.reportType}`);
  }
}

/**
 * Format report data into the requested format
 */
async function formatReport(data: any, format: string): Promise<any> {
  // This would implement report formatting based on the requested format
  // For now, just returning the data as-is
  return data;
}

/**
 * Generate campaign summary report
 */
async function generateCampaignSummary(
  options: ReportOptions, 
  startDate: Date, 
  endDate: Date
): Promise<any> {
  try {
    // Get campaigns to include in the report
    const campaignQuery = supabase
      .from("campaigns")
      .select(`
        *,
        email_tracking (*)
      `)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());
    
    // Filter by campaign IDs if specified
    if (options.campaignIds && options.campaignIds.length > 0) {
      campaignQuery.in("id", options.campaignIds);
    }
    
    const { data: campaigns, error } = await campaignQuery;
    
    if (error) throw error;
    
    // Process campaign data
    const campaignSummaries = campaigns.map(campaign => {
      const trackingData = campaign.email_tracking || [];
      
      // Calculate metrics
      const sentCount = trackingData.length;
      const openedCount = trackingData.filter(t => t.opened_at).length;
      const clickedCount = trackingData.filter(t => t.clicked_at).length;
      
      const openRate = sentCount > 0 ? (openedCount / sentCount) * 100 : 0;
      const clickRate = sentCount > 0 ? (clickedCount / sentCount) * 100 : 0;
      const clickThroughRate = openedCount > 0 ? (clickedCount / openedCount) * 100 : 0;
      
      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        startDate: campaign.start_time,
        endDate: campaign.end_time,
        metrics: {
          sentCount,
          openedCount,
          clickedCount,
          openRate,
          clickRate,
          clickThroughRate
        }
      };
    });
    
    // Aggregate overall metrics
    const totalSent = campaignSummaries.reduce((sum, campaign) => sum + campaign.metrics.sentCount, 0);
    const totalOpened = campaignSummaries.reduce((sum, campaign) => sum + campaign.metrics.openedCount, 0);
    const totalClicked = campaignSummaries.reduce((sum, campaign) => sum + campaign.metrics.clickedCount, 0);
    
    const overallOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const overallClickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
    
    return {
      reportType: ReportType.CAMPAIGN_SUMMARY,
      generatedAt: new Date().toISOString(),
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      overallMetrics: {
        campaignCount: campaignSummaries.length,
        totalSent,
        totalOpened,
        totalClicked,
        overallOpenRate,
        overallClickRate
      },
      campaigns: campaignSummaries
    };
  } catch (error) {
    console.error("Error generating campaign summary:", error);
    throw error;
  }
}

/**
 * Generate user susceptibility report
 */
async function generateUserSusceptibility(
  options: ReportOptions, 
  startDate: Date, 
  endDate: Date
): Promise<any> {
  try {
    // This would analyze user-specific phishing susceptibility
    // For now, returning a placeholder
    return {
      reportType: ReportType.USER_SUSCEPTIBILITY,
      generatedAt: new Date().toISOString(),
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      userSusceptibility: []
    };
  } catch (error) {
    console.error("Error generating user susceptibility report:", error);
    throw error;
  }
}

/**
 * Generate department comparison report
 */
async function generateDepartmentComparison(
  options: ReportOptions, 
  startDate: Date, 
  endDate: Date
): Promise<any> {
  try {
    // This would analyze department-level susceptibility
    // For now, returning a placeholder
    return {
      reportType: ReportType.DEPARTMENT_COMPARISON,
      generatedAt: new Date().toISOString(),
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      departmentComparison: []
    };
  } catch (error) {
    console.error("Error generating department comparison report:", error);
    throw error;
  }
}

/**
 * Generate trend analysis report
 */
async function generateTrendAnalysis(
  options: ReportOptions, 
  startDate: Date, 
  endDate: Date
): Promise<any> {
  try {
    // This would analyze trends over time
    // For now, returning a placeholder
    return {
      reportType: ReportType.TREND_ANALYSIS,
      generatedAt: new Date().toISOString(),
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      trends: []
    };
  } catch (error) {
    console.error("Error generating trend analysis report:", error);
    throw error;
  }
}

/**
 * Generate compliance audit report
 */
async function generateComplianceAudit(
  options: ReportOptions, 
  startDate: Date, 
  endDate: Date
): Promise<any> {
  try {
    // This would analyze compliance with various frameworks
    // For now, returning a placeholder
    return {
      reportType: ReportType.COMPLIANCE_AUDIT,
      generatedAt: new Date().toISOString(),
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      frameworks: options.complianceFrameworks || [],
      complianceStatus: []
    };
  } catch (error) {
    console.error("Error generating compliance audit report:", error);
    throw error;
  }
}

/**
 * Generate executive summary report
 */
async function generateExecutiveSummary(
  options: ReportOptions, 
  startDate: Date, 
  endDate: Date
): Promise<any> {
  try {
    // This would generate a high-level summary for executives
    // For now, returning a placeholder
    return {
      reportType: ReportType.EXECUTIVE_SUMMARY,
      generatedAt: new Date().toISOString(),
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      summary: "Executive summary report placeholder"
    };
  } catch (error) {
    console.error("Error generating executive summary report:", error);
    throw error;
  }
}
