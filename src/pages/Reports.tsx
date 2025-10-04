import React, { useState } from "react";
import { BarChart3, Download, Filter, Calendar, Users, Mail, MousePointer, RotateCcw, AlertTriangle, Shield, TrendingUp, Building, ChevronDown, Clock, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import HistoricalTimelineView from "@/components/analytics/HistoricalTimelineView";
import SimulationKPICards from "@/components/analytics/SimulationKPICards";
import SimulationSpiderChart from "@/components/analytics/SimulationSpiderChart";
import { useSimulationMetrics, SimulationType } from "@/hooks/useSimulationMetrics";
import { useSecurityTrends } from "@/hooks/useSecurityTrends";
import { useHistoricalActivities } from "@/hooks/useHistoricalActivities";
import { useDepartmentVulnerability } from "@/hooks/useDepartmentVulnerability";
import { useCampaignSummary } from "@/hooks/useCampaignSummary";
import { useComprehensiveReportData } from "@/hooks/useComprehensiveReportData";
import DepartmentVulnerabilityCards from "@/components/analytics/DepartmentVulnerabilityCards";
import DepartmentDetailsSidebar from "@/components/analytics/DepartmentDetailsSidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";

const Reports = () => {
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState("all");
  const [dateRange, setDateRange] = useState("30");
  const [riskLevel, setRiskLevel] = useState("all");
  const [fileType, setFileType] = useState("all");
  const [showRecentActivity, setShowRecentActivity] = useState(false);
  const [simulationType, setSimulationType] = useState<SimulationType>('combined');
  const [timePeriod, setTimePeriod] = useState(30);
  const [exporting, setExporting] = useState(false);

  // Simulation metrics hook
  const { 
    linkMetrics, 
    fileMetrics, 
    spiderData, 
    loading: simulationLoading 
  } = useSimulationMetrics(simulationType, timePeriod);

  // Security trends hook
  const { 
    trendData, 
    loading: trendsLoading 
  } = useSecurityTrends(timePeriod);

  // Historical activities hook
  const { 
    activities: historicalActivities, 
    loading: activitiesLoading,
    refetch: refetchActivities 
  } = useHistoricalActivities();

  // Department vulnerability hook
  const { 
    departments, 
    loading: departmentsLoading, 
    selectedDepartment, 
    selectDepartment, 
    closeSidebar 
  } = useDepartmentVulnerability();

  // Campaign summary hook
  const {
    campaigns: campaignSummary,
    loading: campaignSummaryLoading
  } = useCampaignSummary();

  // Comprehensive report data hook for PDF export
  const {
    reportData,
    loading: reportDataLoading,
  } = useComprehensiveReportData(simulationType, timePeriod);

  // All data now uses real hooks

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      toast.info('Generating comprehensive PDF report...');

      if (!reportData) {
        toast.error('Report data is still loading. Please wait a moment.');
        return;
      }

      // Call edge function to generate PDF
      const { data, error } = await supabase.functions.invoke('export-report', {
        body: { 
          reportData, 
          format: 'pdf',
          timePeriod,
          simulationType
        }
      });

      if (error) {
        if (error.status === 429) {
          toast.error('Rate limit exceeded. Please wait before generating another report.');
          return;
        }
        throw error;
      }

      // Download PDF (it's actually a text file formatted like a PDF)
      const blob = new Blob([data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `phishing-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF report downloaded successfully!');

      // Log export event
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        'Exported PDF report',
        {
          timePeriod,
          simulationType,
          campaignCount: reportData.campaigns.length,
          departmentCount: reportData.departments.length
        }
      );

    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      toast.info('Generating CSV export...');

      if (!reportData) {
        toast.error('Report data is still loading. Please wait a moment.');
        return;
      }

      // Call edge function to generate CSV
      const { data, error } = await supabase.functions.invoke('export-report', {
        body: { 
          reportData, 
          format: 'csv'
        }
      });

      if (error) throw error;

      // Download CSV
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `phishing-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('CSV export downloaded successfully!');

    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to generate CSV. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'Active' ? 'default' : 'secondary';
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Analyze your phishing campaign performance and security metrics</p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2" disabled={exporting || reportDataLoading}>
                  {exporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Export
                      <ChevronDown size={16} />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportPDF} disabled={exporting || reportDataLoading}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV} disabled={exporting || reportDataLoading}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="outline" 
              onClick={() => setShowRecentActivity(true)}
              className="flex items-center gap-2"
            >
              <Clock size={16} />
              Recent
            </Button>
          </div>
        </div>

        {showRecentActivity ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Recent Activity</h2>
                <p className="text-muted-foreground">Historical user interactions and campaign activities</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowRecentActivity(false)}
                className="flex items-center gap-2"
              >
                <X size={16} />
                Back to Reports
              </Button>
            </div>
            <HistoricalTimelineView 
              activities={historicalActivities}
              onRefresh={refetchActivities}
            />
          </div>
        ) : (
          <>
           
            

            {/* Simulation Type Analysis Section */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Simulation Type Analysis</CardTitle>
                    <CardDescription>Performance metrics by phishing simulation type</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="min-w-48">
                      <label className="text-sm font-medium mb-2 block">Simulation Type</label>
                      <Select value={simulationType} onValueChange={(value: SimulationType) => setSimulationType(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select simulation type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="combined">Combined View</SelectItem>
                          <SelectItem value="link">Link-based Phishing</SelectItem>
                          <SelectItem value="file">File-based Phishing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="min-w-32">
                      <label className="text-sm font-medium mb-2 block">Time Period</label>
                      <Select value={timePeriod.toString()} onValueChange={(value) => setTimePeriod(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">Last 7 days</SelectItem>
                          <SelectItem value="30">Last 30 days</SelectItem>
                          <SelectItem value="90">Last 90 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <SimulationKPICards
                  simulationType={simulationType}
                  linkMetrics={linkMetrics}
                  fileMetrics={fileMetrics}
                  loading={simulationLoading}
                />
              </CardContent>
            </Card>

            {/* Campaign Summary Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Campaign Summary</CardTitle>
            <CardDescription>Overview of all campaign activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Interactions</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Click Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaignSummaryLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : campaignSummary.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No campaigns found. Create your first campaign to see summary data here.
                    </TableCell>
                  </TableRow>
                ) : (
                  campaignSummary.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>
                        <Badge variant={campaign.type === 'file' ? 'destructive' : 'default'}>
                          {campaign.type === 'file' ? 'File' : campaign.type === 'link' ? 'Link' : 'Mixed'}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.sentDate}</TableCell>
                      <TableCell>{campaign.recipients}</TableCell>
                      <TableCell>{campaign.interactions}</TableCell>
                      <TableCell>
                        <Badge variant={
                          campaign.riskLevel === 'high' ? 'destructive' : 
                          campaign.riskLevel === 'medium' ? 'secondary' : 'default'
                        }>
                          {campaign.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.clickRate}%</TableCell>
                      <TableCell>
                        <Badge variant={
                          campaign.status === 'active' ? 'default' : 
                          campaign.status === 'completed' ? 'secondary' : 
                          campaign.status === 'paused' ? 'destructive' : 'outline'
                        }>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Advanced Spider Chart */}
        <SimulationSpiderChart 
          data={spiderData}
          loading={simulationLoading}
          className="mb-6"
        />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <DepartmentVulnerabilityCards 
            departments={departments}
            loading={departmentsLoading}
            onDepartmentClick={selectDepartment}
          />
        </div>

          </>
        )}

        {/* Department Details Sidebar */}
        <DepartmentDetailsSidebar 
          department={selectedDepartment}
          isOpen={!!selectedDepartment}
          onClose={closeSidebar}
        />
      </div>
    </DashboardLayout>
  );
};

export default Reports;
