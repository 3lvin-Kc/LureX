import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, MousePointer, Shield, Users, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCampaigns } from '@/hooks/useCampaigns';
import { supabase } from '@/integrations/supabase/client';
import RealTimeMetrics from '@/components/analytics/RealTimeMetrics';
import { format } from 'date-fns';

const CampaignResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { campaigns, loading } = useCampaigns();
  const [campaign, setCampaign] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [stats, setStats] = useState({
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    submitted: 0,
    reported: 0,
    total_targets: 0
  });

  useEffect(() => {
    if (campaigns && id) {
      const foundCampaign = campaigns.find(c => c.id === id);
      setCampaign(foundCampaign);
      if (foundCampaign) {
        fetchCampaignMetrics();
      }
    }
  }, [campaigns, id]);

  const fetchCampaignMetrics = async () => {
    try {
      const { data: metricsData, error } = await supabase
        .from('campaign_metrics')
        .select('*')
        .eq('campaign_id', id);

      if (error) throw error;

      setMetrics(metricsData || []);
      
      // Calculate statistics
      const totalTargets = metricsData?.length || 0;
      const sent = metricsData?.filter(m => m.sent_at).length || 0;
      const delivered = metricsData?.filter(m => m.delivered_at).length || 0;
      const opened = metricsData?.filter(m => m.opened_at).length || 0;
      const clicked = metricsData?.filter(m => m.clicked_at).length || 0;
      const submitted = metricsData?.filter(m => m.data_submitted_at).length || 0;
      const reported = metricsData?.filter(m => m.reported_at).length || 0;

      setStats({
        sent,
        delivered,
        opened,
        clicked,
        submitted,
        reported,
        total_targets: totalTargets
      });
    } catch (error) {
      console.error('Error fetching campaign metrics:', error);
      toast({
        title: "Error loading results",
        description: "Failed to load campaign results",
        variant: "destructive"
      });
    }
  };

  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const getStatusBadge = (metric: any) => {
    if (metric.reported_at) return <Badge variant="secondary">Reported</Badge>;
    if (metric.data_submitted_at) return <Badge variant="destructive">Fell for Phish</Badge>;
    if (metric.clicked_at) return <Badge className="bg-orange-100 text-orange-800">Clicked</Badge>;
    if (metric.opened_at) return <Badge className="bg-yellow-100 text-yellow-800">Opened</Badge>;
    if (metric.delivered_at) return <Badge className="bg-blue-100 text-blue-800">Delivered</Badge>;
    if (metric.sent_at) return <Badge variant="outline">Sent</Badge>;
    return <Badge variant="outline">Not Sent</Badge>;
  };

  const exportResults = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('export-report', {
        body: { campaignId: id }
      });

      if (error) throw error;

      toast({
        title: "Export started",
        description: "Your report will be available for download shortly"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to export results",
        variant: "destructive"
      });
    }
  };

  if (loading || !campaign) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 max-w-7xl">
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/campaigns')}
          >
            <ArrowLeft size={16} />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{campaign.name} - Results</h1>
            <p className="text-muted-foreground">
              Campaign results and metrics analysis
            </p>
          </div>
          <Button onClick={exportResults} className="flex items-center gap-2">
            <Download size={16} />
            Export Results
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Targets</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_targets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sent}</div>
              <p className="text-xs text-muted-foreground">
                {calculatePercentage(stats.sent, stats.total_targets)}% of targets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clicked Links</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.clicked}</div>
              <p className="text-xs text-muted-foreground">
                {calculatePercentage(stats.clicked, stats.sent)}% click rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reported Phish</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reported}</div>
              <p className="text-xs text-muted-foreground">
                {calculatePercentage(stats.reported, stats.sent)}% reported
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="metrics" className="space-y-6">
          <TabsList>
            <TabsTrigger value="metrics">Real-time Metrics</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics">
            <RealTimeMetrics campaignId={id} />
          </TabsContent>

          <TabsContent value="detailed">
            <Card>
              <CardHeader>
                <CardTitle>Individual Target Results</CardTitle>
                <CardDescription>
                  Detailed breakdown of each target's interaction with the campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Opened At</TableHead>
                      <TableHead>Clicked At</TableHead>
                      <TableHead>Data Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.map((metric: any) => (
                      <TableRow key={metric.id}>
                        <TableCell className="font-medium">{metric.target_email}</TableCell>
                        <TableCell>{getStatusBadge(metric)}</TableCell>
                        <TableCell>
                          {metric.sent_at ? format(new Date(metric.sent_at), 'MMM d, h:mm a') : '—'}
                        </TableCell>
                        <TableCell>
                          {metric.opened_at ? format(new Date(metric.opened_at), 'MMM d, h:mm a') : '—'}
                        </TableCell>
                        <TableCell>
                          {metric.clicked_at ? format(new Date(metric.clicked_at), 'MMM d, h:mm a') : '—'}
                        </TableCell>
                        <TableCell>
                          {metric.data_submitted_at ? format(new Date(metric.data_submitted_at), 'MMM d, h:mm a') : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance Analysis</CardTitle>
                  <CardDescription>
                    Overall performance metrics and improvement areas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Email Delivery Rate</span>
                      <span>{calculatePercentage(stats.delivered, stats.sent)}%</span>
                    </div>
                    <Progress value={calculatePercentage(stats.delivered, stats.sent)} />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Open Rate</span>
                      <span>{calculatePercentage(stats.opened, stats.delivered)}%</span>
                    </div>
                    <Progress value={calculatePercentage(stats.opened, stats.delivered)} />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Click Rate</span>
                      <span>{calculatePercentage(stats.clicked, stats.opened)}%</span>
                    </div>
                    <Progress value={calculatePercentage(stats.clicked, stats.opened)} />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Susceptibility Rate</span>
                      <span>{calculatePercentage(stats.submitted, stats.clicked)}%</span>
                    </div>
                    <Progress value={calculatePercentage(stats.submitted, stats.clicked)} />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Reporting Rate</span>
                      <span>{calculatePercentage(stats.reported, stats.sent)}%</span>
                    </div>
                    <Progress value={calculatePercentage(stats.reported, stats.sent)} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CampaignResults;