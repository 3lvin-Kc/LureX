
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileDown, Filter, Printer, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { format } from "date-fns";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("campaign-reports");

  // Mock data for campaign reports
  const { data: campaignReports, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ["campaign-reports"],
    queryFn: async () => {
      return [
        {
          id: "1",
          campaign_name: "IT Security Alert",
          start_date: "2023-06-02",
          end_date: "2023-06-09",
          targets: 325,
          opened: 178,
          clicked: 86,
          credentials: 42,
          reported: 12,
          status: "Completed"
        },
        {
          id: "2",
          campaign_name: "Password Reset Request",
          start_date: "2023-05-28",
          end_date: "2023-06-11",
          targets: 412,
          opened: 256,
          clicked: 132,
          credentials: 76,
          reported: 28,
          status: "Completed"
        },
        {
          id: "3",
          campaign_name: "Executive Request",
          start_date: "2023-06-05",
          end_date: "2023-06-12",
          targets: 45,
          opened: 38,
          clicked: 14,
          credentials: 8,
          reported: 3,
          status: "Active"
        }
      ];
    },
  });

  // Mock data for user activity logs
  const { data: userLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["user-logs"],
    queryFn: async () => {
      return [
        {
          id: "1",
          email: "john.smith@example.com",
          campaign: "IT Security Alert",
          action: "Opened Email",
          timestamp: "2023-06-04T10:23:15",
          ip_address: "192.168.1.45",
          user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        },
        {
          id: "2",
          email: "john.smith@example.com",
          campaign: "IT Security Alert",
          action: "Clicked Link",
          timestamp: "2023-06-04T10:24:30",
          ip_address: "192.168.1.45",
          user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        },
        {
          id: "3",
          email: "sarah.jones@example.com",
          campaign: "Password Reset Request",
          action: "Submitted Credentials",
          timestamp: "2023-06-05T14:12:08",
          ip_address: "192.168.1.72",
          user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
        },
        {
          id: "4",
          email: "mark.williams@example.com",
          campaign: "Executive Request",
          action: "Reported Phishing",
          timestamp: "2023-06-06T09:45:22",
          ip_address: "192.168.1.103",
          user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)"
        }
      ];
    },
  });

  const renderCampaignReportsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <FileDown className="h-4 w-4" />
            Export CSV
          </Button>
          <Button size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {isLoadingCampaigns ? (
        <div className="text-center py-8">Loading campaign reports...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Date Range</TableHead>
              <TableHead>Targets</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead>Clicked</TableHead>
              <TableHead>Credentials</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaignReports?.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.campaign_name}</TableCell>
                <TableCell>{format(new Date(report.start_date), "MMM d, yyyy")} - {format(new Date(report.end_date), "MMM d, yyyy")}</TableCell>
                <TableCell>{report.targets}</TableCell>
                <TableCell>{report.opened} ({Math.round(report.opened / report.targets * 100)}%)</TableCell>
                <TableCell className="text-amber-600 font-medium">{report.clicked} ({Math.round(report.clicked / report.targets * 100)}%)</TableCell>
                <TableCell className="text-red-600 font-medium">{report.credentials} ({Math.round(report.credentials / report.targets * 100)}%)</TableCell>
                <TableCell className="text-green-600 font-medium">{report.reported} ({Math.round(report.reported / report.targets * 100)}%)</TableCell>
                <TableCell>
                  <Badge variant={report.status === "Active" ? "default" : "secondary"}>
                    {report.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );

  const renderUserLogsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <FileDown className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {isLoadingLogs ? (
        <div className="text-center py-8">Loading user activity logs...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>User Agent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userLogs?.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.email}</TableCell>
                <TableCell>{log.campaign}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      log.action === "Submitted Credentials" ? "destructive" :
                      log.action === "Clicked Link" ? "default" :
                      log.action === "Reported Phishing" ? "success" : "secondary"
                    }
                  >
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}</TableCell>
                <TableCell>{log.ip_address}</TableCell>
                <TableCell className="truncate max-w-[200px]">{log.user_agent}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Reports & Logs</h1>
            <p className="text-muted-foreground">View campaign results and user activity</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Phishing Campaign Analytics</CardTitle>
            <CardDescription>
              Comprehensive reports and logs from your phishing campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="campaign-reports" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-6">
                <TabsTrigger value="campaign-reports">Campaign Reports</TabsTrigger>
                <TabsTrigger value="user-logs">User Activity Logs</TabsTrigger>
                <TabsTrigger value="executive-summary">Executive Summary</TabsTrigger>
              </TabsList>
              
              <TabsContent value="campaign-reports">
                {renderCampaignReportsTab()}
              </TabsContent>
              
              <TabsContent value="user-logs">
                {renderUserLogsTab()}
              </TabsContent>
              
              <TabsContent value="executive-summary">
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">Executive summary reports coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
