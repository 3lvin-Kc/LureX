import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { realTimeSubscriptionService } from '@/utils/realTimeSubscriptionService';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface DashboardMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalTargets: number;
  clickThroughRate: number;
  recentActivity: any[];
}

interface LiveMetricsDashboardProps {
  maxEvents?: number;
}

const LiveMetricsDashboard: React.FC<LiveMetricsDashboardProps> = ({ maxEvents = 10 }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalTargets: 0,
    clickThroughRate: 0,
    recentActivity: []
  });
  
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardMetrics();
    
    // Subscribe to real-time updates for live feed
    const unsubscribe = realTimeSubscriptionService.subscribe(
      'dashboard-live-feed',
      (event) => {
        // Add new event to live feed with proper formatting
        const formattedEvent = {
          ...event,
          timestamp: event.timestamp || new Date().toISOString(),
        };
        
        setLiveEvents(prev => [formattedEvent, ...prev.slice(0, maxEvents - 1)]);
        
        // Update click-through rate metric in real-time
        if (event.eventType === 'clicked') {
          setMetrics(prev => {
            const newClickedCount = prev.recentActivity.filter(m => m.clicked_at).length + 1;
            const totalSent = prev.recentActivity.filter(m => m.sent_at).length;
            const newClickThroughRate = totalSent > 0 ? (newClickedCount / totalSent) * 100 : 0;
            
            return {
              ...prev,
              clickThroughRate: newClickThroughRate
            };
          });
        }
        
        // Refresh recent activity data periodically to include new metrics
        if (Math.random() < 0.3) { // 30% chance to refresh on new events
          fetchRecentActivity();
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [maxEvents]);

  const fetchDashboardMetrics = async () => {
    try {
      // Fetch campaign counts
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, status');

      if (campaignsError) throw campaignsError;

      const totalCampaigns = campaigns?.length || 0;
      const activeCampaigns = campaigns?.filter(c => c.status === 'in_progress').length || 0;

      // Fetch target list counts
      const { data: targetLists, error: targetError } = await supabase
        .from('target_lists')
        .select('target_count');

      if (targetError) throw targetError;

      const totalTargets = targetLists?.reduce((sum, list) => sum + (list.target_count || 0), 0) || 0;

      // Fetch recent metrics with enhanced query
      const recentActivity = await fetchRecentActivity();

      // Calculate click-through rate from recent activity
      const sentCount = recentActivity.filter(m => m.sent_at).length || 0;
      const clickedCount = recentActivity.filter(m => m.clicked_at).length || 0;
      const clickThroughRate = sentCount > 0 ? (clickedCount / sentCount) * 100 : 0;

      setMetrics({
        totalCampaigns,
        activeCampaigns,
        totalTargets,
        clickThroughRate,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent metrics with campaign names and enhanced details
      const { data: recentMetrics, error: metricsError } = await supabase
        .from('campaign_metrics')
        .select(`
          *,
          campaigns!inner (
            id,
            name,
            status,
            created_at
          )
        `)
        .order('sent_at', { ascending: false })
        .limit(20);

      if (metricsError) throw metricsError;

      // Filter for active campaigns and recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const filteredMetrics = recentMetrics?.filter(metric => {
        const hasRecentActivity = metric.sent_at && new Date(metric.sent_at) > sevenDaysAgo;
        return hasRecentActivity;
      }) || [];

      // Update recent activity in state
      setMetrics(prev => ({
        ...prev,
        recentActivity: filteredMetrics.slice(0, 10)
      }));

      return filteredMetrics;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  };

  const getEventStatusIcon = (metric: any) => {
    if (metric.reported_at) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (metric.data_submitted_at) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (metric.clicked_at) return <Activity className="h-4 w-4 text-orange-500" />;
    if (metric.opened_at) return <Activity className="h-4 w-4 text-blue-500" />;
    if (metric.delivered_at) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  const getEventStatus = (metric: any) => {
    if (metric.reported_at) return 'Reported';
    if (metric.data_submitted_at) return 'Fell for Phish';
    if (metric.clicked_at) return 'Clicked';
    if (metric.opened_at) return 'Opened';
    if (metric.delivered_at) return 'Delivered';
    return 'Sent';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeCampaigns} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              Running simulations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Targets</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTargets}</div>
            <p className="text-xs text-muted-foreground">
              Across all lists
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click-through Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.clickThroughRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Overall effectiveness
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="live-feed" className="space-y-6">
        <TabsList>
          <TabsTrigger value="live-feed">Live Activity Feed</TabsTrigger>
          <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="live-feed">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Activity
              </CardTitle>
              <CardDescription>
                Live updates from active campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {liveEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Waiting for live activity...</p>
                  <p className="text-sm">Events will appear here in real-time when campaigns are active</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {liveEvents.map((event, index) => (
                    <div key={`${event.id}-${index}`} className="flex items-center gap-4 p-3 border rounded-lg animate-in slide-in-from-top-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{event.targetEmail}</span>
                          <Badge variant="outline" className="text-xs">
                            {event.eventType}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(event.timestamp), 'HH:mm:ss')}
                        </div>
                      </div>
                      {event.location && (
                        <div className="text-xs text-muted-foreground">
                          {event.location.city}, {event.location.country}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent-activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Campaign Activity</CardTitle>
              <CardDescription>
                Latest interactions from your campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Target Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Campaign</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.recentActivity.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p>No recent campaign activity</p>
                        <p className="text-sm">Activity will appear here once campaigns are launched</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    metrics.recentActivity.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium">{activity.target_email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEventStatusIcon(activity)}
                            {getEventStatus(activity)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {activity.sent_at ? format(new Date(activity.sent_at), 'MMM d, h:mm a') : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {activity.campaigns?.name || 'Unknown Campaign'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {activity.campaigns?.status || 'draft'}
                            </span>
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
      </Tabs>
    </div>
  );
};

export default LiveMetricsDashboard;