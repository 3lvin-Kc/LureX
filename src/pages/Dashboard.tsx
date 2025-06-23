
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Mail, MousePointer, Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock data for charts
  const campaignData = [
    { name: 'Jan', campaigns: 4, success: 65 },
    { name: 'Feb', campaigns: 6, success: 70 },
    { name: 'Mar', campaigns: 8, success: 58 },
    { name: 'Apr', campaigns: 5, success: 72 },
    { name: 'May', campaigns: 7, success: 68 },
    { name: 'Jun', campaigns: 9, success: 75 },
  ];

  const departmentData = [
    { name: 'IT', value: 15, color: '#8884d8' },
    { name: 'Finance', value: 25, color: '#82ca9d' },
    { name: 'HR', value: 20, color: '#ffc658' },
    { name: 'Sales', value: 30, color: '#ff7300' },
    { name: 'Marketing', value: 10, color: '#00ff00' },
  ];

  const recentCampaigns = [
    { name: "Q4 Security Training", status: "completed", success: 78, date: "2024-01-15" },
    { name: "Finance Department Test", status: "in_progress", success: 65, date: "2024-01-10" },
    { name: "Executive Phishing Test", status: "scheduled", success: 0, date: "2024-01-20" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "scheduled":
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Monitor your phishing simulation campaigns and security metrics</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">+15% from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18.2%</div>
              <p className="text-xs text-muted-foreground">-3% improvement</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">82</div>
              <p className="text-xs text-muted-foreground">+5 points this month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Campaign Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>Monthly campaign success rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campaignData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="campaigns" fill="#8884d8" name="Campaigns" />
                  <Bar dataKey="success" fill="#82ca9d" name="Success Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Vulnerability */}
          <Card>
            <CardHeader>
              <CardTitle>Department Risk Analysis</CardTitle>
              <CardDescription>Phishing susceptibility by department</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Latest phishing simulation activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCampaigns.map((campaign, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(campaign.status)}
                    <div>
                      <h4 className="font-medium">{campaign.name}</h4>
                      <p className="text-sm text-muted-foreground">{campaign.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status.replace('_', ' ')}
                    </Badge>
                    {campaign.status === "completed" && (
                      <div className="flex items-center space-x-2">
                        <Progress value={campaign.success} className="w-20" />
                        <span className="text-sm font-medium">{campaign.success}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/templates")}>
            <CardContent className="p-6 text-center">
              <Mail className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Email Templates</h3>
              <p className="text-sm text-muted-foreground">Create and manage templates</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/target-lists")}>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Target Lists</h3>
              <p className="text-sm text-muted-foreground">Manage recipient lists</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/phishing-pages")}>
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Phishing Pages</h3>
              <p className="text-sm text-muted-foreground">Create fake login pages</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/reports")}>
            <CardContent className="p-6 text-center">
              <BarChart className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Reports</h3>
              <p className="text-sm text-muted-foreground">View analytics and reports</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
