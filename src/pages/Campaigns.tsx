
import React, { useState } from "react";
import { PlusCircle, BarChart3, Send, Clock, AlertCircle, CheckCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { format } from "date-fns";

// Mock data for frontend-only implementation
const mockCampaigns = [
  {
    id: "1",
    name: "Q1 Security Training",
    status: "completed",
    schedule_time: "2024-01-15T09:00:00Z",
    template: { name: "Phishing Awareness Template" },
    target_list: { name: "All Employees" },
    created_at: "2024-01-10T09:00:00Z"
  },
  {
    id: "2", 
    name: "Finance Department Test",
    status: "in_progress",
    schedule_time: "2024-02-01T10:00:00Z",
    template: { name: "Banking Simulation" },
    target_list: { name: "Finance Team" },
    created_at: "2024-01-25T09:00:00Z"
  },
  {
    id: "3",
    name: "Executive Spear Phishing",
    status: "draft",
    schedule_time: null,
    template: { name: "CEO Impersonation" },
    target_list: { name: "Leadership Team" },
    created_at: "2024-02-05T09:00:00Z"
  }
];

const Campaigns = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [campaigns] = useState(mockCampaigns);
  const [isLoading] = useState(false);

  const handleStartCampaign = async (campaignId: string) => {
    try {
      // Mock implementation
      console.log('Mock: Starting campaign', campaignId);
      toast({
        title: "Campaign Started",
        description: "Campaign has been queued for execution",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to start campaign",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-200 text-gray-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Edit size={14} />;
      case "scheduled":
        return <Clock size={14} />;
      case "in_progress":
        return <Send size={14} />;
      case "completed":
        return <CheckCircle size={14} />;
      case "canceled":
        return <AlertCircle size={14} />;
      default:
        return null;
    }
  };

  const filteredCampaigns = activeTab === "all" 
    ? campaigns 
    : campaigns?.filter(campaign => campaign.status === activeTab);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Campaigns</h1>
            <p className="text-muted-foreground">Manage your phishing simulation campaigns</p>
          </div>
          <Button 
            onClick={() => navigate("/campaigns/new")}
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} />
            New Campaign
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Campaign Overview</CardTitle>
            <CardDescription>
              View and manage all your phishing simulation campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="all" 
              className="w-full"
              onValueChange={setActiveTab}
            >
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="mt-4">
                {isLoading ? (
                  <div className="text-center py-8">Loading campaigns...</div>
                ) : filteredCampaigns?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No campaigns found</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate("/campaigns/new")}
                    >
                      Create Campaign
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign Name</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Target List</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCampaigns?.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.name}</TableCell>
                          <TableCell>{campaign.template?.name || "—"}</TableCell>
                          <TableCell>{campaign.target_list?.name || "—"}</TableCell>
                          <TableCell>
                            <Badge className={`flex items-center gap-1 ${getStatusColor(campaign.status)}`}>
                              {getStatusIcon(campaign.status)}
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1).replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {campaign.schedule_time 
                              ? format(new Date(campaign.schedule_time), "MMM d, yyyy h:mm a")
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
                                    >
                                      <Edit size={16} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit Campaign</TooltipContent>
                                </Tooltip>

                                {campaign.status === "draft" && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleStartCampaign(campaign.id)}
                                      >
                                        <Send size={16} />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Start Campaign</TooltipContent>
                                  </Tooltip>
                                )}

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => navigate(`/campaigns/${campaign.id}/results`)}
                                    >
                                      <BarChart3 size={16} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View Results</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Campaigns;
