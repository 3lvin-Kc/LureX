import React from "react";
import { BarChart3, Download, FileText, TrendingUp, Filter, Calendar, Users, Activity } from "lucide-react";

export const ReportsContent: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Reports</h1>
        </div>
        <p className="text-xl text-muted-foreground">
          Generate comprehensive reports to analyze campaign performance, track security awareness progress,
          and demonstrate ROI to stakeholders.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Types & Filters
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-medium">Executive Summary</h3>
                <p className="text-sm text-muted-foreground">High-level overview for leadership</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-medium">Detailed Analytics</h3>
                <p className="text-sm text-muted-foreground">In-depth campaign analysis</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-medium">Department Breakdown</h3>
                <p className="text-sm text-muted-foreground">Performance by organizational unit</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Key Metrics Tracked
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-primary">23.4%</div>
              <div className="text-sm text-muted-foreground">Overall Click Rate</div>
              <div className="text-xs text-muted-foreground">+2.1% from last month</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-primary">8.7%</div>
              <div className="text-sm text-muted-foreground">Credential Submission Rate</div>
              <div className="text-xs text-muted-foreground">-1.3% from last month</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-primary">15.2%</div>
              <div className="text-sm text-muted-foreground">Report Rate</div>
              <div className="text-xs text-muted-foreground">+4.8% from last month</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-primary">87.3%</div>
              <div className="text-sm text-muted-foreground">Training Completion</div>
              <div className="text-xs text-muted-foreground">+12.5% from last month</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Options
          </h2>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="font-medium">PDF Report</span>
              <span className="text-sm text-muted-foreground">Formatted executive summary with charts</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="font-medium">Excel Spreadsheet</span>
              <span className="text-sm text-muted-foreground">Detailed data for custom analysis</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="font-medium">CSV Data Export</span>
              <span className="text-sm text-muted-foreground">Raw data for integration with other tools</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Available Report Data
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-lg">Campaign Performance</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Emails sent vs delivered</li>
                <li>• Open rates and timing</li>
                <li>• Click-through rates</li>
                <li>• Form submission data</li>
                <li>• User reporting behavior</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-lg">Department Analysis</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Vulnerability scores by department</li>
                <li>• Training completion rates</li>
                <li>• Risk level assessments</li>
                <li>• Improvement trends over time</li>
                <li>• Comparative performance metrics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
