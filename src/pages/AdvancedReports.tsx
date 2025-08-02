import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAdvancedReports } from '@/hooks/useAdvancedReports';
import ExecutiveDashboard from '@/components/reports/ExecutiveDashboard';
import BenchmarkComparison from '@/components/reports/BenchmarkComparison';
import CustomReportBuilder from '@/components/reports/CustomReportBuilder';
import ComplianceReports from '@/components/reports/ComplianceReports';
import ScheduledReporting from '@/components/reports/ScheduledReporting';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdvancedReports = () => {
  const {
    executiveData,
    benchmarkData,
    complianceReports,
    reportTemplates,
    scheduledReports,
    loading,
    createReportTemplate,
    createScheduledReport,
    generateComplianceReport
  } = useAdvancedReports();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Advanced Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Executive dashboards, compliance reports, benchmarks, and automated reporting
          </p>
        </div>

        <Tabs defaultValue="executive" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="executive">Executive Dashboard</TabsTrigger>
            <TabsTrigger value="compliance">Compliance Reports</TabsTrigger>
            <TabsTrigger value="benchmarks">Benchmark Comparison</TabsTrigger>
            <TabsTrigger value="builder">Custom Report Builder</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reporting</TabsTrigger>
          </TabsList>

          <TabsContent value="executive">
            {executiveData ? (
              <ExecutiveDashboard data={executiveData} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Executive Dashboard</CardTitle>
                  <CardDescription>Loading executive metrics...</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="compliance">
            <ComplianceReports 
              reports={complianceReports}
              onGenerateReport={generateComplianceReport}
            />
          </TabsContent>

          <TabsContent value="benchmarks">
            <BenchmarkComparison data={benchmarkData} />
          </TabsContent>

          <TabsContent value="builder">
            <CustomReportBuilder 
              templates={reportTemplates}
              onCreateTemplate={createReportTemplate}
            />
          </TabsContent>

          <TabsContent value="scheduled">
            <ScheduledReporting 
              scheduledReports={scheduledReports}
              reportTemplates={reportTemplates}
              onCreateScheduledReport={createScheduledReport}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdvancedReports;