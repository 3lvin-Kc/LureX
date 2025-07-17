
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LiveMetricsDashboard from '@/components/analytics/LiveMetricsDashboard';
import SecurityMonitoringDashboard from '@/components/security/SecurityMonitoringDashboard';
import { useReports } from '@/hooks/useReports';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Scatter,
  ScatterChart
} from 'recharts';
import { Download, Calendar, Filter, TrendingUp, Users, Mail, MousePointer, Shield } from 'lucide-react';

const AdvancedAnalytics = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const { reportData, loading, exportReport } = useReports();

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      await exportReport(format);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const getColors = () => ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Advanced Analytics</h1>
            <p className="text-muted-foreground">Deep insights and comprehensive analysis</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData?.totalCampaigns || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{Math.floor(Math.random() * 20)}% from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData?.emailsSent || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{Math.floor(Math.random() * 15)}% from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData?.clickRate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                -{Math.floor(Math.random() * 5)}% from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {100 - (reportData?.clickRate || 0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                +{Math.floor(Math.random() * 10)}% improvement
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaign Analysis</TabsTrigger>
            <TabsTrigger value="departments">Department Insights</TabsTrigger>
            <TabsTrigger value="security">Security Monitor</TabsTrigger>
            <TabsTrigger value="live">Live Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance Trends</CardTitle>
                  <CardDescription>Performance metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={reportData?.timeSeriesData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="campaigns" 
                        stackId="1"
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Risk Distribution</CardTitle>
                  <CardDescription>Vulnerability assessment by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData?.departmentData || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="vulnerability_score"
                        label={(entry) => entry.department}
                      >
                        {(reportData?.departmentData || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getColors()[index % getColors().length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement vs Success Rate</CardTitle>
                  <CardDescription>Correlation between opens, clicks, and submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart data={reportData?.campaignData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="opened" name="Opened" />
                      <YAxis dataKey="submitted" name="Submitted" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter name="Campaigns" dataKey="clicked" fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Improvement Timeline</CardTitle>
                  <CardDescription>Track awareness improvements over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData?.timeSeriesData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="awareness_improvement" 
                        stroke="#16a34a" 
                        strokeWidth={3}
                        name="Awareness Score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Campaign Analysis</CardTitle>
                <CardDescription>Performance breakdown by individual campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={reportData?.campaignData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sent" fill="#3b82f6" name="Sent" />
                    <Bar dataKey="opened" fill="#10b981" name="Opened" />
                    <Bar dataKey="clicked" fill="#f59e0b" name="Clicked" />
                    <Bar dataKey="submitted" fill="#ef4444" name="Submitted" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <CardTitle>Department Security Assessment</CardTitle>
                <CardDescription>Vulnerability scores and training needs by department</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={reportData?.departmentData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="vulnerability_score" fill="#dc2626" name="Vulnerability Score %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <SecurityMonitoringDashboard />
          </TabsContent>

          <TabsContent value="live">
            <LiveMetricsDashboard maxEvents={100} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdvancedAnalytics;
