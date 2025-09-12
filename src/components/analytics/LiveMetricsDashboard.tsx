import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp, Users, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';
import { realTimeSubscriptionService } from '@/utils/realTimeSubscriptionService';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import EnhancedNotificationCard from './EnhancedNotificationCard';
import HistoricalTimelineView from './HistoricalTimelineView';

interface DashboardMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalTargets: number;
  clickThroughRate: number;
  recentActivity: any[];
}

interface NotificationEvent {
  id: string;
  targetEmail: string;
  eventType: 'sent' | 'opened' | 'clicked' | 'submitted' | 'reported';
  timestamp: string;
  campaignId?: string;
  campaignName?: string;
  userAgent?: string;
  ipAddress?: string;
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
  submittedAt?: string;
  reportedAt?: string;
  additionalData?: any;
}

interface LiveMetricsDashboardProps {
  maxEvents?: number;
}

const LiveMetricsDashboard: React.FC<LiveMetricsDashboardProps> = ({ maxEvents = 20 }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalTargets: 0,
    clickThroughRate: 0,
    recentActivity: []
  });
  
  const [liveEvents, setLiveEvents] = useState<NotificationEvent[]>([]);
  const [newEventCount, setNewEventCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchDashboardMetrics();
    loadRecentActivityIntoFeed();
    
    // Subscribe to real-time updates from campaign metrics
    const channel = supabase
      .channel('campaign-metrics-live-feed')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_metrics'
        },
        (payload) => {
          console.log('Live metrics update:', payload);
          handleRealtimeMetricsUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [maxEvents, isPaused]);

  const handleRealtimeMetricsUpdate = async (payload: any) => {
    const { new: newRecord, old: oldRecord, eventType } = payload;
    
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      // Determine what event just happened
      const currentEventType = determineLatestEventType(newRecord, oldRecord);
      
      if (currentEventType && !isPaused) {
        // Fetch campaign name for the event
        const { data: campaign } = await supabase
          .from('campaigns')
          .select('name')
          .eq('id', newRecord.campaign_id)
          .single();

        const notificationEvent: NotificationEvent = {
          id: newRecord.id,
          targetEmail: newRecord.target_email,
          eventType: currentEventType,
          timestamp: new Date().toISOString(),
          campaignId: newRecord.campaign_id,
          campaignName: campaign?.name || 'Unknown Campaign',
          userAgent: newRecord.user_agent,
          ipAddress: newRecord.ip_address,
          sentAt: newRecord.sent_at,
          openedAt: newRecord.opened_at,
          clickedAt: newRecord.clicked_at,
          submittedAt: newRecord.data_submitted_at,
          reportedAt: newRecord.reported_at,
          additionalData: newRecord.additional_data
        };

        // Add to live feed
        setLiveEvents(prev => {
          const updated = [notificationEvent, ...prev.slice(0, maxEvents - 1)];
          return updated;
        });

        // Increment new event counter
        setNewEventCount(prev => prev + 1);

        // Update metrics
        updateRealTimeMetrics(currentEventType);
      }
    }
  };

  const determineLatestEventType = (newRecord: any, oldRecord?: any): NotificationEvent['eventType'] | null => {
    if (newRecord.reported_at && (!oldRecord || !oldRecord.reported_at)) return 'reported';
    if (newRecord.data_submitted_at && (!oldRecord || !oldRecord.data_submitted_at)) return 'submitted';
    if (newRecord.clicked_at && (!oldRecord || !oldRecord.clicked_at)) return 'clicked';
    if (newRecord.opened_at && (!oldRecord || !oldRecord.opened_at)) return 'opened';
    if (newRecord.delivered_at && (!oldRecord || !oldRecord.delivered_at)) return null; // Don't show delivered events
    if (newRecord.sent_at && (!oldRecord || !oldRecord.sent_at)) return 'sent';
    return null;
  };

  const updateRealTimeMetrics = (eventType: string) => {
    if (eventType === 'clicked') {
      setMetrics(prev => {
        const newClickedCount = prev.recentActivity.filter(m => m.clicked_at).length + 1;
        const totalSent = prev.recentActivity.filter(m => m.sent_at).length;
        const newClickThroughRate = totalSent > 0 ? (newClickedCount / totalSent) * 100 : 0;
        
        return {
          ...prev,
          clickThroughRate: newClickThroughRate
        };
      });
      
      // Refresh recent activity periodically
      if (Math.random() < 0.2) { // 20% chance
        fetchRecentActivity();
      }
    }
  };

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

  const loadRecentActivityIntoFeed = async () => {
    try {
      // Fetch recent metrics from last 24 hours to populate the feed initially
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);

      const { data: recentMetrics, error } = await supabase
        .from('campaign_metrics')
        .select(`
          *,
          campaigns!inner (
            id,
            name
          )
        `)
        .gte('created_at', oneDayAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(maxEvents);

      if (error) throw error;

      // Convert metrics to notification events
      const events: NotificationEvent[] = recentMetrics?.map(metric => {
        // Determine the latest event type for this metric
        let eventType: 'sent' | 'opened' | 'clicked' | 'submitted' | 'reported' = 'sent';
        let timestamp = metric.sent_at;

        if (metric.reported_at) {
          eventType = 'reported';
          timestamp = metric.reported_at;
        } else if (metric.data_submitted_at) {
          eventType = 'submitted';
          timestamp = metric.data_submitted_at;
        } else if (metric.clicked_at) {
          eventType = 'clicked';
          timestamp = metric.clicked_at;
        } else if (metric.opened_at) {
          eventType = 'opened';
          timestamp = metric.opened_at;
        }

        return {
          id: metric.id,
          targetEmail: metric.target_email,
          eventType,
          timestamp,
          campaignId: metric.campaign_id,
          campaignName: metric.campaigns?.name || 'Unknown Campaign',
          userAgent: metric.user_agent,
          ipAddress: metric.ip_address,
          sentAt: metric.sent_at,
          openedAt: metric.opened_at,
          clickedAt: metric.clicked_at,
          submittedAt: metric.data_submitted_at,
          reportedAt: metric.reported_at,
          additionalData: metric.additional_data
        };
      }) || [];

      setLiveEvents(events);
    } catch (error) {
      console.error('Error loading recent activity into feed:', error);
    }
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary animate-pulse" />
                    Live Activity Feed
                  </CardTitle>
                  <CardDescription>
                    Real-time notifications with risk analysis and device information
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {newEventCount > 0 && !isPaused && (
                    <Badge variant="destructive" className="animate-pulse">
                      {newEventCount} new
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsPaused(!isPaused);
                      if (isPaused) {
                        setNewEventCount(0);
                      }
                    }}
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {liveEvents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <h3 className="font-semibold text-lg mb-2">Waiting for live activity</h3>
                  <p>Events will appear here in real-time when campaigns are active</p>
                  <p className="text-sm mt-1">Click on any notification to see detailed information</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {isPaused && (
                    <div className="text-center py-2 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                      Feed paused - Click Resume to continue receiving updates
                    </div>
                  )}
                  
                  {liveEvents.map((event, index) => (
                    <EnhancedNotificationCard
                      key={`${event.id}-${index}`}
                      event={event}
                      isNew={index < newEventCount && !isPaused}
                    />
                  ))}
                  
                  {liveEvents.length >= maxEvents && (
                    <div className="text-center py-4 text-sm text-muted-foreground border-t">
                      Showing latest {maxEvents} events. Older events moved to Recent Activity.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent-activity">
          <HistoricalTimelineView
            activities={metrics.recentActivity}
            onRefresh={fetchRecentActivity}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiveMetricsDashboard;