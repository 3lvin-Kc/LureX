import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Target, 
  MousePointer, 
  Mail, 
  Download, 
  Shield, 
  Activity, 
  TrendingUp,
  AlertTriangle,
  Users,
  BarChart3,
  LineChart,
  PieChart
} from "lucide-react";

export const MetricsExplanationContent: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-4 text-foreground">How Metrics Work</h1>
        <p className="text-lg text-muted-foreground">
          A comprehensive technical explanation of how LureX calculates, processes, and presents 
          phishing simulation metrics across the platform. This guide covers all metric calculations, 
          data aggregation methods, and performance indicators used in the Dashboard and Reports sections.
        </p>
      </div>

      <Separator />

      {/* Overview */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          System Overview
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Metrics Architecture</CardTitle>
            <CardDescription>Understanding the data flow and calculation pipeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              LureX employs a multi-layered metrics architecture that captures, processes, and analyzes 
              phishing simulation data in real-time. The system operates on three fundamental data tables: 
              campaigns, campaign_metrics, and targets. When a phishing simulation is initiated, the system 
              begins tracking user interactions through timestamped events stored in the campaign_metrics table.
            </p>
            
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Data Collection Flow</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                <li>Campaign creation triggers target list association and template binding</li>
                <li>Email dispatch creates initial metric records with sent_at timestamps</li>
                <li>User interactions update corresponding timestamp fields in real-time</li>
                <li>Aggregation engines process raw metrics into actionable insights</li>
                <li>Visualization components render processed data across multiple views</li>
              </ol>
            </div>

            <p className="text-sm text-muted-foreground">
              All metrics are calculated dynamically on-demand, ensuring that dashboard displays always 
              reflect the most current state of campaigns. The system employs sophisticated aggregation 
              algorithms to handle large-scale simulations efficiently while maintaining sub-second query 
              response times.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Campaign Performance Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Campaign Performance Section
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Performance Analytics</CardTitle>
            <CardDescription>How the Campaign Performance section calculates and displays data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Triggering Mechanism</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Campaign Performance section is automatically triggered when the Dashboard page loads. 
                It utilizes the useDashboardMetrics and useCandlestickData hooks which execute asynchronous 
                database queries upon component mount. The system retrieves all campaigns associated with 
                the authenticated user, fetches corresponding metrics from the campaign_metrics table, and 
                processes this data through aggregation functions.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Data Processing Pipeline</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The processing pipeline operates in multiple stages. First, campaigns are filtered by user 
                ownership and temporal boundaries (last 6 months for performance trends). The system then 
                queries campaign_metrics to retrieve interaction timestamps including sent_at, clicked_at, 
                file_downloaded_at, and data_submitted_at. These raw timestamps are aggregated by month, 
                counting occurrences of each event type within monthly buckets.
              </p>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                For candlestick visualization, campaigns are segregated by simulation_type (link vs file). 
                Each campaign's performance is calculated as percentages: open rate, click rate (for link 
                campaigns), and download rate (for file campaigns). These percentages are mapped to 
                candlestick chart coordinates where the opening value represents initial engagement, high 
                represents peak performance, low represents minimum engagement, and close represents final 
                performance state.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Visual Representation Logic</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Campaign Performance section renders two parallel candlestick charts: one for link-based 
                simulations (displayed in green tones) and another for file-based simulations (displayed in 
                red tones). Each candlestick represents a campaign's lifecycle performance. Bullish candlesticks 
                (where close exceeds open) indicate improving user awareness and decreasing vulnerability over 
                time. Bearish candlesticks indicate deteriorating security posture within that campaign period.
              </p>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                When no data exists, the system displays appropriate empty state indicators. The charts 
                dynamically resize based on viewport dimensions and update in real-time as new campaign 
                data flows into the system.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Core Metrics */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          Core Metrics Calculations
        </h2>
        
        <div className="space-y-4">
          {/* Total Campaigns */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Total Campaigns</CardTitle>
                <Badge variant="outline">Count Metric</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Calculation Method:</strong> Simple count of all campaign records in the campaigns 
                table where user_id matches the authenticated user. This metric includes campaigns in all 
                states: draft, active, paused, and completed.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Update Frequency:</strong> Recalculated on every dashboard load or when the refetch 
                function is explicitly invoked. The count is performed server-side via Supabase queries.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Business Significance:</strong> Provides a high-level indicator of simulation activity 
                volume. A steadily increasing total campaigns metric indicates consistent security training 
                program execution.
              </p>
            </CardContent>
          </Card>

          {/* Active Campaigns */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Active Campaigns</CardTitle>
                <Badge variant="outline">Filtered Count</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Calculation Method:</strong> Count of campaigns where status field equals 'active'. 
                Active campaigns are those currently in execution phase, meaning targets can still interact 
                with phishing emails and landing pages.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>State Transition Logic:</strong> Campaigns transition to active state when scheduled_time 
                is reached or immediately upon manual launch. They remain active until manually paused or 
                marked complete by the user.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Operational Use:</strong> High active campaign counts may indicate ongoing training 
                initiatives across multiple departments. Zero active campaigns suggests dormant security 
                awareness programs requiring attention.
              </p>
            </CardContent>
          </Card>

          {/* Total Interactions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Total Interactions</CardTitle>
                <Badge variant="outline">Aggregated Count</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Calculation Method:</strong> Sum of all campaign_metrics records where clicked_at OR 
                file_downloaded_at is not null. This represents any meaningful user engagement with the 
                phishing simulation beyond email receipt.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Interaction Classification:</strong> For link-based campaigns, interactions are recorded 
                when users click phishing URLs. For file-based campaigns, interactions occur when malicious 
                file attachments are downloaded. Combined metrics merge both types.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Analytical Value:</strong> Higher interaction counts indicate greater user susceptibility 
                to phishing attacks. This metric serves as the denominator for calculating engagement-based 
                rates like click rate and download rate.
              </p>
            </CardContent>
          </Card>

          {/* Overall Click Rate */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Overall Click Rate</CardTitle>
                <Badge variant="outline">Percentage Metric</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Calculation Formula:</strong> ((Total Clicked + Total Downloaded) / Total Sent) × 100. 
                The numerator combines both link clicks and file downloads to provide unified engagement metric 
                across simulation types.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Data Sources:</strong> Total Clicked is derived from campaign_metrics records with 
                non-null clicked_at timestamps. Total Downloaded comes from non-null file_downloaded_at fields. 
                Total Sent represents all records with non-null sent_at timestamps.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Precision Handling:</strong> The result is rounded to one decimal place for readability. 
                When no emails have been sent (denominator equals zero), the system returns 0% rather than 
                undefined to prevent display errors.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Benchmarking Context:</strong> Industry average click rates typically range from 15-30%. 
                Rates above 30% suggest heightened organizational vulnerability requiring immediate intervention.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Simulation Type Metrics */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <PieChart className="h-6 w-6 text-primary" />
          Simulation Type Analysis
        </h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Link-Based vs File-Based Metrics</CardTitle>
            <CardDescription>How different simulation types are tracked and compared</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Simulation Type Segregation</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The system categorizes campaigns by simulation_type field: 'link', 'file', or 'mixed'. Link-based 
                simulations focus on URL-based phishing attacks where success is measured by landing page visits. 
                File-based simulations test susceptibility to malicious attachments measured through download events. 
                Mixed campaigns combine both vectors in a single simulation.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Link-Based Metrics Processing</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Link campaigns track three primary interaction stages: email send (sent_at), link click (clicked_at), 
                and credential submission (data_submitted_at). The system calculates click-through rate as clicks 
                divided by sends. Conversion rate represents submissions divided by clicks, indicating how many 
                users who visited the phishing page actually entered sensitive data.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Success rate for link campaigns is calculated as (submissions / emails sent) × 100, representing 
                the ultimate goal of credential harvesting. Response time metrics measure the average duration 
                between email send and link click, providing insights into user behavior patterns and urgency 
                response conditioning.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">File-Based Metrics Processing</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                File campaigns track download events (file_downloaded_at) as the primary success indicator. Unlike 
                link campaigns, file simulations cannot track actual file execution due to technical limitations. 
                The download rate is calculated as downloads divided by sends, representing users who obtained 
                potentially malicious files.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The system previously tracked file opens but this has been removed as it's technically impossible 
                to monitor local file interactions after download. Modern file-based metrics focus solely on the 
                download action as the compromising event. File interaction time measures duration from email 
                receipt to download, indicating user decision-making speed under social engineering pressure.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Combined Simulation Analysis</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When analyzing overall system performance, link and file metrics are unified through normalized 
                percentage calculations. The system treats link clicks and file downloads as equivalent interaction 
                events. Submissions (credential entries) and downloads are combined into a unified "success" metric 
                representing complete compromise scenarios.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Spider chart visualizations overlay link and file metrics across six dimensions: volume (emails sent), 
                engagement (interactions), compromise (submissions/downloads), awareness (reports), risk score 
                (composite vulnerability index), and response speed (average interaction time). This multi-dimensional 
                view enables direct comparison of attack vector effectiveness.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Advanced Metrics */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Advanced Performance Indicators
        </h2>
        
        <div className="space-y-4">
          {/* Risk Score */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Risk Score Calculation</CardTitle>
                <Badge variant="destructive">Composite Metric</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Algorithm:</strong> Risk Score = (Success Rate × 0.4) + (Interaction Rate × 0.3) + 
                (Speed Factor × 30). This weighted formula combines three vulnerability indicators into a 
                0-100 scale where higher scores indicate greater organizational risk.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Success Rate Component:</strong> Represents the percentage of users who completed the 
                compromising action (credential submission or file download). Weighted at 40% as this is the 
                most critical security failure mode.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Interaction Rate Component:</strong> Percentage of users who engaged with phishing 
                content regardless of final outcome. Weighted at 30% as it indicates initial susceptibility 
                and poor email hygiene practices.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Speed Factor Component:</strong> Normalized metric where faster interaction times (under 
                5 minutes) receive factor of 1.0, medium times (5-10 minutes) receive 0.7, and slower times 
                receive 0.4. This is weighted at 30 points, recognizing that rapid responses indicate higher 
                vulnerability to urgency-based social engineering tactics.
              </p>
            </CardContent>
          </Card>

          {/* Average Response Time */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Average Response Time</CardTitle>
                <Badge variant="outline">Temporal Metric</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Calculation Method:</strong> For each metric record where both sent_at and interaction 
                timestamp (clicked_at or file_downloaded_at) exist, calculate the difference in seconds. Sum 
                all differences and divide by count of records with both timestamps.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Statistical Treatment:</strong> The system filters out outliers beyond 24 hours as these 
                typically represent delayed batch processing rather than genuine user behavior. The final average 
                is rounded to whole seconds for readability.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Behavioral Insights:</strong> Response times under 2 minutes suggest impulsive clicking 
                without critical evaluation. Times between 2-10 minutes indicate cursory examination. Times 
                exceeding 30 minutes may represent users who opened emails later or required multiple decision 
                points before acting.
              </p>
            </CardContent>
          </Card>

          {/* Report Rate */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Phishing Report Rate</CardTitle>
                <Badge variant="secondary">Awareness Metric</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Calculation Formula:</strong> (Total Reported / Total Sent) × 100. Represents the 
                percentage of recipients who identified the simulation as suspicious and used proper reporting 
                mechanisms.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Data Capture:</strong> Reports are recorded when users click designated "Report Phishing" 
                buttons or when reported_at timestamps are populated in campaign_metrics. The system distinguishes 
                between reports made before interaction (ideal behavior) and reports after interaction (post-incident 
                awareness).
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Target Benchmarks:</strong> Mature security awareness programs typically achieve 10-20% 
                report rates. Organizations with rates below 5% require enhanced training on reporting procedures. 
                Rates above 30% indicate excellent security culture penetration.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Department Analytics */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Department-Level Analytics
        </h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Departmental Vulnerability Assessment</CardTitle>
            <CardDescription>How the system segments and analyzes risk by organizational unit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Department Identification</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Departments are extracted from the targets table where each target record includes a department 
                field. The system aggregates all metrics by department through a join operation between campaign_metrics 
                and targets tables using target_email as the linking key.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Department-Specific Metrics</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For each department, the system calculates total emails sent, total clicks, total submissions, 
                click rate, submission rate, and report rate using the same formulas as organization-wide metrics 
                but filtered by department. The system also computes department-specific average response times 
                and risk scores.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Risk Level Classification</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Departments are classified into risk tiers based on their click rate: High Risk (click rate ≥ 30%), 
                Medium Risk (click rate 15-29%), and Low Risk (click rate &lt; 15%). This classification drives 
                visual indicators, badge colors, and priority ordering in department vulnerability displays.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Comparative Analysis</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The system generates department comparison charts showing relative performance across organizational 
                units. Bar charts display click rates sorted from highest to lowest vulnerability. Heatmap 
                visualizations reveal patterns of weakness across different business functions, enabling targeted 
                remediation strategies.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Real-Time Components */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Real-Time Tracking & Live Feeds
        </h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Live Activity Monitoring</CardTitle>
            <CardDescription>How the system provides real-time simulation tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Event Stream Architecture</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The real-time tracking system leverages Supabase realtime subscriptions to monitor campaign_metrics 
                table changes. When any metric record is inserted or updated, the system receives push notifications 
                through WebSocket connections. The realTimeTrackingService processes these events and broadcasts 
                them to all subscribed components.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Event Type Determination</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Each incoming metric update is analyzed to determine the event type. The system examines which 
                timestamp fields changed: new clicked_at values generate 'link_click' events, new file_downloaded_at 
                values create 'file_download' events, new data_submitted_at values produce 'credential_submit' 
                events, and new reported_at values trigger 'phishing_report' events.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Live Feed Presentation</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The LiveMetricsDashboard component maintains a rolling buffer of the most recent 50 events. Each 
                event displays target email (anonymized to first initial + last name when available), event type, 
                timestamp, and associated campaign. Events are color-coded by severity: red for credential 
                submissions (critical), orange for clicks/downloads (high), and green for reports (positive).
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Historical Timeline Construction</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The historical timeline view queries campaign_metrics with temporal sorting, reconstructing the 
                chronological sequence of simulation events. Each metric record generates up to four timeline 
                entries (send, click/download, submit, report) based on which timestamps are populated. The 
                timeline supports filtering by campaign, date range, and event type.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Reports Tab Analytics */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Reports Tab Analytics
        </h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Comprehensive Report Generation</CardTitle>
            <CardDescription>Detailed analysis metrics available in the Reports section</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Executive Summary Metrics</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The executive summary aggregates all campaigns within the selected timeframe (default 30 days) 
                and calculates organization-wide statistics: total campaigns executed, total emails sent across 
                all campaigns, overall click rate, overall submission rate, overall report rate, count of high-risk 
                departments, and a list of critical security findings extracted from the data.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Campaign-Level Detail Reports</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Each campaign receives a detailed breakdown including: campaign name, simulation type, target 
                count, emails successfully sent, total interactions, submission count, report count, click/download 
                rate, submission rate, report rate, average response time, risk score, and status. This granular 
                view enables performance comparison across different simulation approaches and templates.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Trend Analysis Charts</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The reports section includes time-series visualizations showing metric evolution over the selected 
                period. Line charts track click rate progression, submission rate trends, and report rate 
                improvements week-over-week or month-over-month. These trend lines help identify whether security 
                awareness training is effectively reducing organizational vulnerability over time.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Device Analytics Integration</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Reports incorporate device distribution analysis by parsing user_agent strings from campaign_metrics. 
                The system categorizes interactions into Desktop, Mobile, and Tablet segments. Device-specific 
                vulnerability patterns emerge, such as higher click rates on mobile devices where UI constraints 
                make phishing indicators less visible.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Export Functionality</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The system generates downloadable reports in PDF and CSV formats. PDF reports include executive 
                summaries, data visualizations, department breakdowns, and actionable recommendations. CSV exports 
                provide raw data tables for further analysis in external tools like Excel or business intelligence 
                platforms. Export operations are performed by dedicated edge functions that format and package data 
                server-side before delivery.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Data Quality & Accuracy */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Data Quality & Accuracy
        </h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Ensuring Metric Reliability</CardTitle>
            <CardDescription>How the system maintains data integrity and calculation accuracy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Timestamp Validation</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All metric calculations depend on timestamp accuracy. The system validates that interaction 
                timestamps (clicked_at, file_downloaded_at, data_submitted_at, reported_at) occur chronologically 
                after the sent_at timestamp. Records violating this constraint are flagged and excluded from 
                calculations to prevent data corruption from affecting metrics.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Deduplication Logic</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Campaign metrics are stored per-target-per-campaign. The system ensures each target-campaign 
                combination produces exactly one metric record, preventing double-counting. When multiple events 
                occur for the same target in a campaign, timestamps are updated in place rather than creating 
                duplicate records.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Error Handling & Fallbacks</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All metric calculations implement defensive programming with null checks and division-by-zero 
                guards. When insufficient data exists to calculate a metric (e.g., calculating click rate with 
                zero emails sent), the system returns 0 or appropriate null values rather than failing. Loading 
                states and error boundaries prevent UI crashes when data fetching fails.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Performance Optimization</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Metric queries employ database indexes on campaign_id, user_id, and timestamp fields to ensure 
                sub-second query performance even with millions of metric records. Aggregation operations use 
                database-level GROUP BY clauses rather than application-level processing to leverage PostgreSQL's 
                optimized aggregation engine. React hooks implement memoization to prevent unnecessary recalculations 
                when component props haven't changed.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Best Practices */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-primary" />
          Interpretation Best Practices
        </h2>
        
        <Card>
          <CardHeader>
            <CardTitle>How to Use Metrics Effectively</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">Context Matters</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Metrics should always be interpreted within organizational context. A 25% click rate in a finance 
                department handling sensitive transactions warrants immediate concern, while the same rate in a 
                marketing department might be acceptable given different risk exposure.
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm text-orange-900 dark:text-orange-100">Trend Over Snapshot</h4>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Single campaign results can be anomalous. Focus on trend lines across multiple simulations over 
                time. Improving trends (decreasing click rates, increasing report rates) indicate effective 
                training. Stagnant or worsening trends signal the need for program adjustments.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm text-green-900 dark:text-green-100">Actionable Insights</h4>
              <p className="text-sm text-green-800 dark:text-green-200">
                Use department-level metrics to target remediation. High-risk departments require additional 
                training, modified onboarding processes, and potentially technology controls like enhanced email 
                filtering. Low-risk departments can serve as security culture ambassadors.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm text-purple-900 dark:text-purple-100">Positive Indicators</h4>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Don't focus solely on negative metrics (clicks, submissions). Celebrate and reinforce positive 
                behaviors indicated by high report rates and improving response times. Recognition programs for 
                departments with strong reporting metrics can drive cultural change.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Technical Architecture */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <LineChart className="h-6 w-6 text-primary" />
          Technical Implementation Details
        </h2>
        
        <Card>
          <CardHeader>
            <CardTitle>System Architecture Overview</CardTitle>
            <CardDescription>How metrics flow through the technical stack</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Data Layer</h4>
              <p className="text-sm text-muted-foreground">
                PostgreSQL database hosted on Supabase provides the persistence layer. Tables use UUID primary 
                keys for security and scalability. Row-level security policies ensure users can only access 
                their own campaign data. Triggers maintain referential integrity and update aggregate counters 
                automatically.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">API Layer</h4>
              <p className="text-sm text-muted-foreground">
                Supabase client library provides typed API access. Custom hooks (useDashboardMetrics, 
                useSimulationMetrics, useCampaignSummary, etc.) encapsulate data fetching logic and state 
                management. React Query could be integrated for advanced caching strategies in future iterations.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Business Logic Layer</h4>
              <p className="text-sm text-muted-foreground">
                Processing functions (processPerformanceData, fetchMetricsForType, generateSpiderData, etc.) 
                transform raw database records into calculated metrics. These pure functions are unit-testable 
                and can be extracted into utility modules for reuse across different components.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Presentation Layer</h4>
              <p className="text-sm text-muted-foreground">
                React components consume hooks and render visualizations using Recharts library. Components 
                handle loading states, error boundaries, and empty states gracefully. Responsive design ensures 
                metrics displays adapt to different viewport sizes from mobile to desktop.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Real-Time Layer</h4>
              <p className="text-sm text-muted-foreground">
                WebSocket connections via Supabase Realtime enable live metric updates. The realTimeTrackingService 
                manages subscriptions, event parsing, and state synchronization. This architecture ensures 
                dashboard displays reflect simulation activity within seconds of occurrence.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};