
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Download, 
  FileText, 
  FileCog, 
  Mail, 
  Filter, 
  Search,
  ArrowDownToLine,
  Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { format } from "date-fns";

const Reports = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("campaign-reports");
  const [searchTerm, setSearchTerm] = useState("");
  const [reportType, setReportType] = useState("all");

  // Mock data for reports since we don't have actual campaign data
  const mockReports = [
    {
      id: "1",
      name: "Q2 Security Awareness Campaign",
      type: "campaign",
      status: "completed",
      date: "2023-06-15T10:30:00",
      sent: 458,
      opened: 342,
      clicked: 187,
      reported: 32
    },
    {
      id: "2",
      name: "IT Department Phishing Test",
      type: "campaign",
      status: "completed",
      date: "2023-05-22T08:45:00",
      sent: 126,
      opened: 108,
      clicked: 42,
      reported: 28
    },
    {
      id: "3",
      name: "New Employee Training",
      type: "training",
      status: "completed",
      date: "2023-07-03T14:20:00",
      sent: 78,
      opened: 75,
      clicked: 18,
      reported: 12
    },
    {
      id: "4",
      name: "Executive Spear Phishing Test",
      type: "campaign",
      status: "in-progress",
      date: "2023-07-18T09:15:00",
      sent: 24,
      opened: 18,
      clicked: 7,
      reported: 3
    },
  ];

  // Mock logs data
  const mockLogs = [
    {
      id: "1",
      event: "Email Opened",
      campaign: "Q2 Security Awareness Campaign",
      user: "john.smith@example.com",
      timestamp: "2023-06-15T10:45:22",
      details: "User agent: Chrome on Windows",
      ip: "192.168.1.45"
    },
    {
      id: "2",
      event: "Link Clicked",
      campaign: "Q2 Security Awareness Campaign",
      user: "jane.doe@example.com",
      timestamp: "2023-06-15T11:12:05",
      details: "Link: reset-password.example.com",
      ip: "192.168.1.87"
    },
    {
      id: "3",
      event: "Credentials Submitted",
      campaign: "IT Department Phishing Test",
      user: "mike.tech@example.com",
      timestamp: "2023-05-22T09:31:47",
      details: "Username and password entered",
      ip: "192.168.2.113"
    },
    {
      id: "4",
      event: "Email Reported",
      campaign: "New Employee Training",
      user: "alice.new@example.com",
      timestamp: "2023-07-03T14:55:10",
      details: "Reported as phishing via Outlook plugin",
      ip: "192.168.3.201"
    },
  ];

  // Filter and search reports
  const filteredReports = mockReports.filter(report => {
    // Filter by type if not "all"
    if (reportType !== "all" && report.type !== reportType) {
      return false;
    }
    
    // Filter by search term if present
    if (
      searchTerm && 
      !report.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    
    return true;
  });

  // Filter and search logs
  const filteredLogs = mockLogs.filter(log => {
    if (
      searchTerm && 
      !(
        log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.campaign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) {
      return false;
    }
    
    return true;
  });

  const handleDownloadPDF = () => {
    toast({
      title: "Downloading PDF Report",
      description: "Your report is being generated and will download shortly."
    });
    
    // In a real implementation, this would generate and download a PDF
    setTimeout(() => {
      const element = document.createElement("a");
      element.setAttribute("href", "data:application/pdf;charset=utf-8,");
      element.setAttribute("download", `phishing_report_${Date.now()}.pdf`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast({
        title: "Download Complete",
        description: "Your PDF report has been downloaded successfully."
      });
    }, 1500);
  };

  const handleExportCSV = () => {
    toast({
      title: "Exporting to CSV",
      description: "Your data is being exported and will download shortly."
    });
    
    // In a real implementation, this would create and download a CSV file
    setTimeout(() => {
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Headers
      csvContent += "Name,Type,Status,Date,Sent,Opened,Clicked,Reported\n";
      
      // Data
      filteredReports.forEach(report => {
        csvContent += `"${report.name}","${report.type}","${report.status}","${report.date}",${report.sent},${report.opened},${report.clicked},${report.reported}\n`;
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `phishing_data_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Complete",
        description: "Your CSV file has been downloaded successfully."
      });
    }, 1500);
  };

  const handlePrint = () => {
    toast({
      title: "Preparing Print",
      description: "Opening print dialog..."
    });
    
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Reports & Logs</h1>
            <p className="text-muted-foreground">View and export campaign reports and activity logs</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer size={16} />
              Print
            </Button>
            <Button 
              variant="outline"
              onClick={handleExportCSV}
              className="flex items-center gap-2"
            >
              <ArrowDownToLine size={16} />
              Export CSV
            </Button>
            <Button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Download PDF
            </Button>
          </div>
        </div>

        <Tabs 
          defaultValue="campaign-reports" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="campaign-reports" className="flex items-center">
              <FileCog className="mr-2 h-4 w-4" />
              Campaign Reports
            </TabsTrigger>
            <TabsTrigger value="activity-logs" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Activity Logs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="campaign-reports" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports..." 
                  className="pl-10 pr-4"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="campaign">Campaigns</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Campaign Reports</CardTitle>
                <CardDescription>
                  Detailed reports of your phishing campaigns and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Metrics</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No reports found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {report.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={report.status === "completed" ? "default" : "secondary"}
                              className="capitalize"
                            >
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(report.date), "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            <div className="flex flex-col text-sm">
                              <div className="grid grid-cols-4 gap-2">
                                <span>Sent: {report.sent}</span>
                                <span>Opened: {report.opened}</span>
                                <span>Clicked: {report.clicked}</span>
                                <span>Reported: {report.reported}</span>
                              </div>
                              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500" 
                                  style={{ width: `${(report.opened / report.sent) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadPDF}
                              >
                                <Download size={14} className="mr-1" />
                                Download
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity-logs" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activity logs..." 
                  className="pl-10 pr-4"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="flex items-center gap-2"
              >
                <ArrowDownToLine size={16} />
                Export Logs
              </Button>
            </div>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>
                  Detailed logs of user interactions with your phishing campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Badge 
                              variant={
                                log.event.includes("Opened") ? "secondary" :
                                log.event.includes("Clicked") ? "default" :
                                log.event.includes("Credentials") ? "destructive" :
                                log.event.includes("Reported") ? "outline" : "default"
                              }
                            >
                              {log.event}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{log.campaign}</TableCell>
                          <TableCell>{log.user}</TableCell>
                          <TableCell>{format(new Date(log.timestamp), "MMM d, HH:mm:ss")}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
                          <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
