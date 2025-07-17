
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { realTimeSubscriptionService, RealTimeMetric } from '@/utils/realTimeSubscriptionService';
import { Activity, Mail, MousePointer, Shield, AlertTriangle, Globe, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LiveMetricsDashboardProps {
  campaignId?: string;
  maxEvents?: number;
}

const LiveMetricsDashboard: React.FC<LiveMetricsDashboardProps> = ({ 
  campaignId, 
  maxEvents = 50 
}) => {
  const [events, setEvents] = useState<RealTimeMetric[]>([]);
  const [metrics, setMetrics] = useState({
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    submitted: 0,
    reported: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(realTimeSubscriptionService.getConnectionStatus());
    };

    const unsubscribe = realTimeSubscriptionService.subscribe(
      'live-metrics-dashboard', 
      (event: RealTimeMetric) => {
        if (!campaignId || event.campaignId === campaignId) {
          setEvents(prev => [event, ...prev.slice(0, maxEvents - 1)]);
          
          setMetrics(prev => ({
            ...prev,
            [event.eventType]: prev[event.eventType as keyof typeof prev] + 1
          }));
          
          setLastUpdate(new Date());
          
          // Show toast for critical events
          if (event.eventType === 'submitted' || event.eventType === 'reported') {
            toast({
              title: `Security Event: ${event.eventType.toUpperCase()}`,
              description: `Target: ${event.targetEmail}`,
              variant: event.eventType === 'reported' ? 'default' : 'destructive'
            });
          }
        }
      }
    );

    // Check connection status initially and periodically
    checkConnection();
    const connectionInterval = setInterval(checkConnection, 5000);

    return () => {
      unsubscribe();
      clearInterval(connectionInterval);
    };
  }, [campaignId, maxEvents, toast]);

  const handleReconnect = async () => {
    try {
      await realTimeSubscriptionService.reconnect();
      toast({
        title: "Reconnected",
        description: "Real-time connection has been restored"
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to reconnect to real-time service",
        variant: "destructive"
      });
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'sent': return <Mail className="h-4 w-4" />;
      case 'delivered': return <Mail className="h-4 w-4" />;
      case 'opened': return <Activity className="h-4 w-4" />;
      case 'clicked': return <MousePointer className="h-4 w-4" />;
      case 'submitted': return <Shield className="h-4 w-4" />;
      case 'reported': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'sent': return 'bg-blue-500';
      case 'delivered': return 'bg-green-500';
      case 'opened': return 'bg-yellow-500';
      case 'clicked': return 'bg-orange-500';
      case 'submitted': return 'bg-red-500';
      case 'reported': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventBadgeVariant = (eventType: string) => {
    switch (eventType) {
      case 'submitted': return 'destructive';
      case 'reported': return 'secondary';
      case 'clicked': return 'outline';
      default: return 'outline';
    }
  };

  const totalEvents = Object.values(metrics).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600">Disconnected</span>
            </>
          )}
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
        {!isConnected && (
          <Button variant="outline" size="sm" onClick={handleReconnect}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Reconnect
          </Button>
        )}
      </div>

      {/* Real-time metrics overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.sent}</div>
            {totalEvents > 0 && (
              <Progress value={(metrics.sent / totalEvents) * 100} className="mt-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.delivered}</div>
            {totalEvents > 0 && (
              <Progress value={(metrics.delivered / totalEvents) * 100} className="mt-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opened</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.opened}</div>
            {totalEvents > 0 && (
              <Progress value={(metrics.opened / totalEvents) * 100} className="mt-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clicked</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.clicked}</div>
            {totalEvents > 0 && (
              <Progress value={(metrics.clicked / totalEvents) * 100} className="mt-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.submitted}</div>
            {totalEvents > 0 && (
              <Progress value={(metrics.submitted / totalEvents) * 100} className="mt-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reported</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.reported}</div>
            {totalEvents > 0 && (
              <Progress value={(metrics.reported / totalEvents) * 100} className="mt-2" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Real-time activity feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Activity Feed
            <Badge variant={isConnected ? "default" : "destructive"} className="ml-2">
              {isConnected ? "LIVE" : "OFFLINE"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Real-time updates from your campaigns ({events.length} recent events)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No activity yet. Events will appear here in real-time.
              </div>
            ) : (
              events.map((event, index) => (
                <div key={`${event.id}-${index}`} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${getEventColor(event.eventType)} animate-pulse`} />
                  <div className="flex items-center gap-2">
                    {getEventIcon(event.eventType)}
                    <span className="font-medium capitalize">{event.eventType}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{event.targetEmail}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                  {event.ipAddress && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      {event.ipAddress}
                    </div>
                  )}
                  <Badge variant={getEventBadgeVariant(event.eventType)} className="text-xs">
                    {event.eventType}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveMetricsDashboard;
