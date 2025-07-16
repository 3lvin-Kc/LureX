import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import RealTimeMetrics from '@/components/analytics/RealTimeMetrics';
import { useReports } from '@/hooks/useReports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Analytics = () => {
  const { reportData, loading } = useReports();

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
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time monitoring and analysis of your phishing campaigns
          </p>
        </div>
        
        <Tabs defaultValue="realtime" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="realtime">
            <RealTimeMetrics />
          </TabsContent>
          
          <TabsContent value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                  <CardDescription>Email interactions by campaign</CardDescription>
                </CardHeader>
                <CardContent>
                  {reportData?.campaignData && reportData.campaignData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportData.campaignData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sent" fill="hsl(var(--primary))" name="Sent" />
                        <Bar dataKey="opened" fill="hsl(var(--secondary))" name="Opened" />
                        <Bar dataKey="clicked" fill="hsl(var(--destructive))" name="Clicked" />
                        <Bar dataKey="submitted" fill="hsl(var(--destructive) / 0.8)" name="Submitted" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      No campaign data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Success Rate Trends</CardTitle>
                  <CardDescription>Click and submission rates over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {reportData?.campaignData && reportData.campaignData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={reportData.campaignData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="clicked" 
                          stroke="hsl(var(--destructive))" 
                          strokeWidth={2}
                          name="Clicked"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="submitted" 
                          stroke="hsl(var(--destructive) / 0.6)" 
                          strokeWidth={2}
                          name="Submitted"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      No trend data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Security Improvement Trends</CardTitle>
                <CardDescription>Track organizational security awareness over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Trend analysis will be available with more campaign data over time
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;