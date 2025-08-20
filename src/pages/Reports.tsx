import React, { useState } from "react";
import { BarChart3, Download, Filter, Calendar, Users, Mail, MousePointer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useReports } from "@/hooks/useReports";
import { useCampaigns } from "@/hooks/useCampaigns";
const Reports = () => {
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState("all");
  const [dateRange, setDateRange] = useState("30");
  const {
    reportData,
    loading,
    exportReport
  } = useReports();
  const {
    campaigns
  } = useCampaigns();
  const handleExportPDF = async () => {
    try {
      await exportReport('pdf');
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };
  const handleExportCSV = async () => {
    try {
      await exportReport('csv');
    } catch (error) {
      console.error('Failed to export CSV:', error);
    }
  };
  if (loading) {
    return <DashboardLayout>
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </DashboardLayout>;
  }
  return <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Analyze your phishing campaign performance and security metrics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2" onClick={handleExportPDF}>
              <Download size={16} />
              Export PDF
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={handleExportCSV}>
              <Download size={16} />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="min-w-48">
                <label className="text-sm font-medium mb-2 block">Campaign</label>
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campaigns</SelectItem>
                    {campaigns.map(campaign => <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-32">
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 3 months</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData?.totalCampaigns || 0}</div>
              <p className="text-xs text-muted-foreground">Active campaigns</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData?.emailsSent?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Total delivered</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData?.clickRate || 0}%</div>
              <p className="text-xs text-muted-foreground">Average click rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData?.participants?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Total participants</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaign Details</TabsTrigger>
            
            
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Campaign Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                  <CardDescription>Email interactions by campaign</CardDescription>
                </CardHeader>
                <CardContent>
                  {reportData?.campaignData && reportData.campaignData.length > 0 ? <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportData.campaignData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sent" fill="#8884d8" name="Sent" />
                        <Bar dataKey="opened" fill="#82ca9d" name="Opened" />
                        <Bar dataKey="clicked" fill="#ffc658" name="Clicked" />
                        <Bar dataKey="submitted" fill="#ff7300" name="Submitted" />
                      </BarChart>
                    </ResponsiveContainer> : <div className="flex items-center justify-center h-64 text-muted-foreground">
                      No campaign data available
                    </div>}
                </CardContent>
              </Card>

              {/* Department Vulnerability */}
              <Card>
                
                
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>Detailed performance metrics for each campaign</CardDescription>
              </CardHeader>
              <CardContent>
                {reportData?.campaignData && reportData.campaignData.length > 0 ? <div className="space-y-4">
                    {reportData.campaignData.map((campaign, index) => <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{campaign.name}</h4>
                          <Badge variant="outline">
                            {campaign.sent > 0 ? Math.round(campaign.clicked / campaign.sent * 100) : 0}% click rate
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Sent</p>
                            <p className="font-medium">{campaign.sent}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Opened</p>
                            <p className="font-medium">{campaign.opened}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Clicked</p>
                            <p className="font-medium">{campaign.clicked}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Submitted</p>
                            <p className="font-medium">{campaign.submitted}</p>
                          </div>
                        </div>
                      </div>)}
                  </div> : <div className="text-center py-8 text-muted-foreground">
                    No campaign data available
                  </div>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Risk Analysis</CardTitle>
                <CardDescription>Security awareness by department</CardDescription>
              </CardHeader>
              <CardContent>
                {reportData?.departmentData && reportData.departmentData.length > 0 ? <div className="space-y-4">
                    {reportData.departmentData.map((dept, index) => <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-4 h-4 rounded" style={{
                      backgroundColor: dept.color
                    }}></div>
                          <span className="font-medium">{dept.name}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Progress value={dept.value} className="w-32" />
                          <span className="text-sm font-medium">{dept.value}%</span>
                        </div>
                      </div>)}
                  </div> : <div className="text-center py-8 text-muted-foreground">
                    No department data available
                  </div>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Trends</CardTitle>
                <CardDescription>Track improvement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Trend analysis will be available with more campaign data
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>;
};
export default Reports;