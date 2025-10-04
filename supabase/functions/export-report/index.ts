import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const { reportData, format } = await req.json();

    if (format === 'pdf') {
      const pdfContent = generatePDFReport(reportData);
      
      return new Response(pdfContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="phishing-report-${new Date().toISOString().split('T')[0]}.txt"`,
          ...corsHeaders
        }
      });
    } else if (format === 'csv') {
      const csvContent = generateCSV(reportData);
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="phishing-report-${new Date().toISOString().split('T')[0]}.csv"`,
          ...corsHeaders
        }
      });
    }

    return new Response('Unsupported format', { status: 400, headers: corsHeaders });

  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to export report' }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    );
  }
});

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***';
  const [local, domain] = email.split('@');
  const masked = local.length > 3 ? local.substring(0, 3) + '***' : '***';
  return `${masked}@${domain}`;
}

function generatePDFReport(reportData: any): string {
  const generatedDate = new Date(reportData.generatedAt).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  const startDate = new Date(reportData.dateRange.start).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const endDate = new Date(reportData.dateRange.end).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  let report = `
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║              PHISHING SIMULATION SECURITY REPORT                          ║
║                                                                           ║
║                      ${reportData.organizationName.padEnd(50).substring(0, 50)}         ║
║                                                                           ║
║  Report Period: ${startDate} - ${endDate}                    ║
║  Generated: ${generatedDate}                              ║
║  Prepared by: ${reportData.generatedBy.padEnd(48).substring(0, 48)}     ║
║                                                                           ║
║                        ⚠️  CONFIDENTIAL  ⚠️                                ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝


═══════════════════════════════════════════════════════════════════════════
                           EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════════════════════════

Report Period: ${startDate} to ${endDate}
Time Frame: Last ${reportData.timePeriod} days

┌─────────────────────────────────────────────────────────────────────────┐
│                          KEY METRICS                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Total Campaigns:           ${String(reportData.executiveSummary.totalCampaigns).padStart(6)}                         │
│  Emails Sent:               ${String(reportData.executiveSummary.totalEmailsSent).padStart(6)}                         │
│  Overall Click Rate:        ${String(reportData.executiveSummary.overallClickRate).padStart(6)}%                        │
│  Credential Submit Rate:    ${String(reportData.executiveSummary.overallSubmitRate).padStart(6)}%                        │
│  Report Rate:               ${String(reportData.executiveSummary.overallReportRate).padStart(6)}%                        │
│  High-Risk Departments:     ${String(reportData.executiveSummary.highRiskDepartments).padStart(6)}                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

CRITICAL FINDINGS
`;

  if (reportData.executiveSummary.criticalFindings.length > 0) {
    reportData.executiveSummary.criticalFindings.forEach((finding: string, index: number) => {
      report += `  ${index + 1}. ${finding}\n`;
    });
  } else {
    report += `  • No critical security issues identified\n`;
  }

  report += `

OVERALL SECURITY POSTURE
`;

  if (reportData.executiveSummary.totalCampaigns === 0) {
    report += `No phishing simulation campaigns were conducted during the reporting period.
To establish a baseline security posture, it is recommended to:
  • Create and deploy initial phishing simulation campaigns
  • Target diverse departments and user groups
  • Establish metrics for ongoing assessment\n`;
  } else if (reportData.executiveSummary.overallSubmitRate > 20) {
    report += `Your organization shows CRITICAL vulnerability to phishing attacks. More than
20% of employees are entering credentials in simulated phishing attempts. Immediate
action required to prevent real-world compromise.\n`;
  } else if (reportData.executiveSummary.overallSubmitRate > 10) {
    report += `Your organization shows ELEVATED vulnerability to phishing attacks. Security
awareness training is recommended to reduce credential compromise rates.\n`;
  } else if (reportData.executiveSummary.overallClickRate > 30) {
    report += `While credential submission rates are acceptable, the high click-through rate
indicates users need additional training in identifying suspicious content.\n`;
  } else {
    report += `Your organization demonstrates GOOD security awareness. Continue regular training
and simulations to maintain this security posture.\n`;
  }


  // Simulation Type Analysis
  report += `

═══════════════════════════════════════════════════════════════════════════
                      SIMULATION TYPE ANALYSIS
═══════════════════════════════════════════════════════════════════════════

This section compares the effectiveness of different phishing simulation types.

`;

  if (!reportData.simulationMetrics.linkMetrics && !reportData.simulationMetrics.fileMetrics) {
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     No simulation data available for the selected period
     
     Create phishing campaigns to begin collecting security metrics.
     Both link-based and file-based simulations are recommended for
     comprehensive security assessment.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  } else {
    report += `┌─────────────────────────────────────────────────────────────────────────┐
│                    LINK-BASED PHISHING SIMULATIONS                      │
├─────────────────────────────────────────────────────────────────────────┤\n`;

    if (reportData.simulationMetrics.linkMetrics) {
      const lm = reportData.simulationMetrics.linkMetrics;
      report += `│  Emails Sent:         ${String(lm.emailsSent).padStart(8)}                                       │
│  Link Clicks:         ${String(lm.interactions).padStart(8)} (${String(lm.emailsSent > 0 ? Math.round((lm.interactions / lm.emailsSent) * 100) : 0).padStart(3)}%)                             │
│  Credentials Entered: ${String(lm.submissions).padStart(8)} (${String(lm.emailsSent > 0 ? Math.round((lm.submissions / lm.emailsSent) * 100) : 0).padStart(3)}%)                             │
│  Reported as Phish:   ${String(lm.reports).padStart(8)} (${String(lm.emailsSent > 0 ? Math.round((lm.reports / lm.emailsSent) * 100) : 0).padStart(3)}%)                             │
│  Risk Score:          ${String(lm.riskScore).padStart(8)}/100                                   │
│  Avg Response Time:   ${String(Math.floor(lm.averageResponseTime / 60)).padStart(8)} min                                     │\n`;
    } else {
      report += `│                                                                         │
│             No link-based campaigns in selected period                  │
│                                                                         │\n`;
    }

    report += `└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    FILE-BASED PHISHING SIMULATIONS                      │
├─────────────────────────────────────────────────────────────────────────┤\n`;

    if (reportData.simulationMetrics.fileMetrics) {
      const fm = reportData.simulationMetrics.fileMetrics;
      report += `│  Emails Sent:         ${String(fm.emailsSent).padStart(8)}                                       │
│  Files Downloaded:    ${String(fm.interactions).padStart(8)} (${String(fm.emailsSent > 0 ? Math.round((fm.interactions / fm.emailsSent) * 100) : 0).padStart(3)}%)                             │
│  Files Opened:        ${String(fm.submissions).padStart(8)} (${String(fm.emailsSent > 0 ? Math.round((fm.submissions / fm.emailsSent) * 100) : 0).padStart(3)}%)                             │
│  Reported as Phish:   ${String(fm.reports).padStart(8)} (${String(fm.emailsSent > 0 ? Math.round((fm.reports / fm.emailsSent) * 100) : 0).padStart(3)}%)                             │
│  Risk Score:          ${String(fm.riskScore).padStart(8)}/100                                   │
│  Avg Response Time:   ${String(Math.floor(fm.averageResponseTime / 60)).padStart(8)} min                                     │\n`;
    } else {
      report += `│                                                                         │
│             No file-based campaigns in selected period                  │
│                                                                         │\n`;
    }

    report += `└─────────────────────────────────────────────────────────────────────────┘

WHAT THIS MEANS:
• Link-based campaigns test users' ability to identify suspicious URLs
• File-based campaigns test caution with email attachments
• Higher success rates indicate greater organizational vulnerability
• Fast response times may indicate impulsive behavior requiring training
`;
  }

  // Campaign Summary
  report += `

═══════════════════════════════════════════════════════════════════════════
                          CAMPAIGN SUMMARY
═══════════════════════════════════════════════════════════════════════════

Overview of all campaigns conducted during the reporting period.

`;

  if (reportData.campaigns.length === 0) {
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     No campaigns found in selected period
     
     Create your first campaign to begin security awareness training.
     Consider starting with a low-risk test group to establish baselines.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  } else {
    report += `Campaign Name                    Type    Date         Rcpts  Interact  Risk   Click%  Status
${'─'.repeat(95)}\n`;

    reportData.campaigns.slice(0, 50).forEach((campaign: any) => {
      const name = campaign.name.substring(0, 30).padEnd(32);
      const type = campaign.type.substring(0, 6).padEnd(8);
      const date = campaign.sentDate.padEnd(12);
      const recipients = String(campaign.recipients).padStart(5);
      const interactions = String(campaign.interactions).padStart(8);
      const risk = campaign.riskLevel.substring(0, 6).padEnd(7);
      const clickRate = String(campaign.clickRate).padStart(6) + '%';
      const status = campaign.status;

      report += `${name}${type}${date}${recipients}${interactions}${risk}${clickRate}  ${status}\n`;
    });

    if (reportData.campaigns.length > 50) {
      report += `\n(Showing 50 of ${reportData.campaigns.length} campaigns. Full data available in dashboard.)\n`;
    }
  }

  // Department Risk Analysis
  report += `

═══════════════════════════════════════════════════════════════════════════
                       DEPARTMENT RISK ANALYSIS
═══════════════════════════════════════════════════════════════════════════

Identifies departments requiring immediate security awareness intervention.

`;

  if (reportData.departments.length === 0) {
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     No department data available
     
     Assign departments to targets in your target lists to enable
     department-level vulnerability analysis and targeted training.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  } else {
    reportData.departments.forEach((dept: any, index: number) => {
      const riskEmoji = dept.riskLevel === 'high' ? '🔴' : dept.riskLevel === 'medium' ? '🟡' : '🟢';
      
      report += `
${riskEmoji} DEPARTMENT: ${dept.name}
   Risk Level: ${dept.riskLevel.toUpperCase()}
   Vulnerability Score: ${dept.vulnerabilityPercentage}%

   STATISTICS
   ├─ Total Users:          ${dept.stats.totalUsers}
   ├─ Failed Users:         ${dept.stats.failedUsers}
   ├─ Link Vulnerability:   ${dept.stats.linkVulnerability}%
   ├─ File Vulnerability:   ${dept.stats.fileVulnerability}%
   ├─ Avg Time to Click:    ${Math.floor(dept.stats.averageTimeToClick / 60)} minutes
   └─ Most Common Failure:  ${dept.stats.mostCommonFailure}

   RECOMMENDATIONS\n`;
      
      dept.recommendations.forEach((rec: string) => {
        report += `   • ${rec}\n`;
      });

      if (index < reportData.departments.length - 1) {
        report += `\n${'─'.repeat(77)}\n`;
      }
    });
  }

  // Recent Activity Timeline
  report += `

═══════════════════════════════════════════════════════════════════════════
                    RECENT ACTIVITY TIMELINE
═══════════════════════════════════════════════════════════════════════════

Last 50 campaign interactions (most recent first).

`;

  if (reportData.recentActivities.length === 0) {
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     No campaign activity recorded
     
     Send your first campaign to see real-time interaction timelines
     and user behavior patterns.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  } else {
    reportData.recentActivities.slice(0, 50).forEach((activity: any) => {
      const timestamp = new Date(activity.sent_at || activity.created_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const campaignName = activity.campaigns?.name || 'Unknown Campaign';
      const maskedEmail = maskEmail(activity.target_email);

      let status = 'Sent';
      if (activity.reported_at) status = 'Reported ✓';
      else if (activity.data_submitted_at) status = 'Submitted ⚠️';
      else if (activity.clicked_at) status = 'Clicked';
      else if (activity.opened_at) status = 'Opened';

      const simType = activity.campaigns?.simulation_type || 'link';

      report += `[${timestamp}] ${campaignName.substring(0, 40)}\n`;
      report += `├─ Target: ${maskedEmail}\n`;
      report += `├─ Status: ${status}\n`;
      report += `└─ Type: ${simType === 'file' ? 'File-based' : 'Link-based'}\n\n`;
    });
  }

  // Recommendations
  report += `

═══════════════════════════════════════════════════════════════════════════
                     ACTIONABLE RECOMMENDATIONS
═══════════════════════════════════════════════════════════════════════════

Based on the analysis above, we recommend the following actions:

`;

  if (reportData.executiveSummary.totalCampaigns === 0) {
    report += `GETTING STARTED (Next 7 Days)
1. Create initial baseline phishing campaign targeting diverse user groups
2. Establish security awareness training program
3. Define acceptable risk thresholds for your organization

`;
  } else {
    report += `IMMEDIATE ACTIONS (Next 7 Days)\n`;

    if (reportData.executiveSummary.overallSubmitRate > 20) {
      report += `1. CRITICAL: Deploy emergency security awareness training
2. Implement multi-factor authentication across all systems
3. Review and strengthen password policies\n`;
    } else if (reportData.executiveSummary.highRiskDepartments > 0) {
      report += `1. Prioritize security training for high-risk departments
2. Schedule one-on-one sessions with repeat offenders
3. Deploy department-specific phishing awareness materials\n`;
    } else {
      report += `1. Continue regular phishing simulations
2. Expand simulation scenarios to cover emerging threats
3. Recognize and reward departments with strong security awareness\n`;
    }

    report += `
SHORT-TERM ACTIONS (Next 30 Days)
1. Implement role-based security training programs
2. Deploy additional simulations with varied complexity
3. Establish security champions program within high-risk departments

LONG-TERM STRATEGY (Next 90 Days)
1. Build security-first organizational culture
2. Implement continuous phishing simulation program
3. Establish metrics-driven security improvement initiatives
`;
  }

  // Appendix
  report += `

═══════════════════════════════════════════════════════════════════════════
                              APPENDIX
═══════════════════════════════════════════════════════════════════════════

METHODOLOGY
───────────
This report analyzes phishing simulation campaigns conducted within your
organization over the specified time period. Simulations are designed to
mirror real-world phishing attacks while maintaining ethical standards.

All interactions are tracked anonymously and used solely for security
improvement purposes.

GLOSSARY
────────
• Click Rate: Percentage of recipients who clicked suspicious links
• Submit Rate: Percentage who entered credentials on phishing pages
• Report Rate: Percentage who reported emails as suspicious
• Vulnerability Score: Composite risk metric (0-100) based on failure rates
• Risk Level: High (>50% vuln), Medium (25-50%), Low (<25%)

ABOUT PHISHING SIMULATIONS
──────────────────────────
Phishing simulations are ethical security tests that help organizations
identify and address security awareness gaps before real attacks occur.
They are a critical component of comprehensive security programs.

PRIVACY & SECURITY
──────────────────
All data in this report is encrypted and access-controlled. Individual
performance data should be used for training purposes only, never for
punitive action. Email addresses are masked in this report to protect
personally identifiable information (PII).

REPORT LIMITATIONS
──────────────────
• Data reflects simulations only; real attack patterns may vary
• Small sample sizes may not be statistically significant
• Department analysis requires proper target list configuration
• Historical trends require multiple reporting periods

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                   Report generated by Phishing Simulation Guardian
                        https://lurex.lovable.app
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  return report;
}

function generateCSV(reportData: any): string {
  let csv = 'Campaign Name,Type,Sent Date,Recipients,Interactions,Risk Level,Click Rate,Status\n';
  
  if (reportData.campaigns && reportData.campaigns.length > 0) {
    reportData.campaigns.forEach((campaign: any) => {
      csv += `"${campaign.name}","${campaign.type}","${campaign.sentDate}",${campaign.recipients},${campaign.interactions},"${campaign.riskLevel}",${campaign.clickRate},"${campaign.status}"\n`;
    });
  }

  csv += '\n\nDepartment Analysis\n';
  csv += 'Department,Total Users,Failed Users,Vulnerability %,Link Vuln %,File Vuln %,Risk Level\n';
  
  if (reportData.departments && reportData.departments.length > 0) {
    reportData.departments.forEach((dept: any) => {
      csv += `"${dept.name}",${dept.stats.totalUsers},${dept.stats.failedUsers},${dept.vulnerabilityPercentage},${dept.stats.linkVulnerability},${dept.stats.fileVulnerability},"${dept.riskLevel}"\n`;
    });
  }

  return csv;
}
