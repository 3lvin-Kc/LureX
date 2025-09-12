import React from "react";
import { BarChart3, Download, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const ReportsContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Reports</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Generate comprehensive reports to analyze campaign performance, track security awareness progress, 
          and demonstrate ROI to stakeholders.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <FileText className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium mb-2">Executive Summary</h4>
              <p className="text-sm text-muted-foreground mb-3">High-level overview for leadership</p>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <TrendingUp className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium mb-2">Detailed Analytics</h4>
              <p className="text-sm text-muted-foreground mb-3">In-depth campaign analysis</p>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <BarChart3 className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium mb-2">Department Breakdown</h4>
              <p className="text-sm text-muted-foreground mb-3">Performance by organizational unit</p>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Overall Click Rate</span>
                <Badge variant="secondary">23.4%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Credential Submission Rate</span>
                <Badge variant="destructive">8.7%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Reporting Rate</span>
                <Badge variant="default">15.2%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Training Completion</span>
                <Badge variant="default">87.3%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">PDF Report</span>
                <Button size="sm" variant="outline">Export</Button>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">Excel Spreadsheet</span>
                <Button size="sm" variant="outline">Export</Button>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">CSV Data</span>
                <Button size="sm" variant="outline">Export</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
