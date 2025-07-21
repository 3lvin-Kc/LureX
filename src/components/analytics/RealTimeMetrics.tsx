
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { realTimeTrackingService, RealTimeEvent } from '@/utils/realTimeTrackingService';
import { Activity, Mail, MousePointer, Shield, AlertTriangle, Globe } from 'lucide-react';

interface RealTimeMetricsProps {
  campaignId?: string;
}

const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({ campaignId }) => {
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [metrics, setMetrics] = useState({
    sent: 0,
    opened: 0,
    clicked: 0,
    submitted: 0,
    reported: 0
  });

  useEffect(() => {
    const unsubscribe = realTimeTrackingService.subscribe('real-time-metrics', (event: RealTimeEvent) => {
      if (!campaignId || event.campaignId === campaignId) {
        setEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
        
        setMetrics(prev => ({
          ...prev,
          [event.eventType]: prev[event.eventType as keyof typeof prev] + 1
        }));
      }
    });

    return unsubscribe;
  }, [campaignId]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'sent':
        return <Mail className="h-4 w-4" />;
      case 'opened':
        return <Activity className="h-4 w-4" />;
      case 'clicked':
        return <MousePointer className="h-4 w-4" />;
      case 'submitted':
        return <Shield className="h-4 w-4" />;
      case 'reported':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'sent':
        return 'bg-blue-500';
      case 'opened':
        return 'bg-green-500';
      case 'clicked':
        return 'bg-yellow-500';
      case 'submitted':
        return 'bg-red-500';
      case 'reported':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const totalEvents = Object.values(metrics).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6">
      {/* Real-time metrics overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <div className="text-2xl font-bold">{metrics.submitted}</div>
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
            <div className="text-2xl font-bold">{metrics.reported}</div>
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
          </CardTitle>
          <CardDescription>
            Real-time updates from your campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activity yet. Events will appear here in real-time.
              </div>
            ) : (
              events.map((event, index) => (
                <div key={`${event.id}-${index}`} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${getEventColor(event.eventType)}`} />
                  <div className="flex items-center gap-2">
                    {getEventIcon(event.eventType)}
                    <span className="font-medium capitalize">{event.eventType}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">{event.targetEmail}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      {event.location.city}, {event.location.country}
                    </div>
                  )}
                  <Badge variant="outline" className="text-xs">
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

export default RealTimeMetrics;
