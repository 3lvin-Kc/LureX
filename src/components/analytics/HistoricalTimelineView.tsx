import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Calendar, 
  Filter, 
  Mail, 
  Eye, 
  MousePointer, 
  Shield, 
  AlertTriangle,
  Clock,
  User,
  Building
} from 'lucide-react';
import { format, isToday, isYesterday, subDays } from 'date-fns';
import EnhancedNotificationCard from './EnhancedNotificationCard';

interface ActivityEvent {
  id: string;
  target_email: string;
  campaign_id?: string;
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  data_submitted_at?: string;
  reported_at?: string;
  user_agent?: string;
  ip_address?: string;
  additional_data?: any;
  campaigns?: {
    id: string;
    name: string;
    status: string;
    created_at: string;
  };
}

interface HistoricalTimelineViewProps {
  activities: ActivityEvent[];
  onRefresh?: () => void;
}

const HistoricalTimelineView: React.FC<HistoricalTimelineViewProps> = ({ activities, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [filteredActivities, setFilteredActivities] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    let filtered = [...activities];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.target_email.toLowerCase().includes(search) ||
        activity.campaigns?.name.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(activity => {
        switch (statusFilter) {
          case 'reported':
            return activity.reported_at;
          case 'submitted':
            return activity.data_submitted_at;
          case 'clicked':
            return activity.clicked_at && !activity.data_submitted_at;
          case 'opened':
            return activity.opened_at && !activity.clicked_at;
          case 'sent':
            return activity.sent_at && !activity.opened_at;
          default:
            return true;
        }
      });
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const cutoffDate = (() => {
        switch (dateFilter) {
          case 'today':
            return subDays(now, 0);
          case 'yesterday':
            return subDays(now, 1);
          case 'week':
            return subDays(now, 7);
          case 'month':
            return subDays(now, 30);
          default:
            return new Date(0);
        }
      })();

      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.sent_at || activity.opened_at || activity.clicked_at || '');
        return activityDate >= cutoffDate;
      });
    }

    // Sort by most recent activity
    filtered.sort((a, b) => {
      const getLatestTimestamp = (activity: ActivityEvent) => {
        const timestamps = [
          activity.sent_at,
          activity.opened_at, 
          activity.clicked_at,
          activity.data_submitted_at,
          activity.reported_at
        ].filter(Boolean).map(t => new Date(t!).getTime());
        
        return Math.max(...timestamps);
      };
      
      return getLatestTimestamp(b) - getLatestTimestamp(a);
    });

    setFilteredActivities(filtered);
  }, [activities, searchTerm, statusFilter, dateFilter]);

  const getEventStatus = (activity: ActivityEvent) => {
    if (activity.reported_at) return 'reported';
    if (activity.data_submitted_at) return 'submitted';
    if (activity.clicked_at) return 'clicked';
    if (activity.opened_at) return 'opened';
    if (activity.sent_at) return 'sent';
    return 'unknown';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reported':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Reported</Badge>;
      case 'submitted':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Fell for Phish</Badge>;
      case 'clicked':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Clicked</Badge>;
      case 'opened':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Opened</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Sent</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const groupByDate = (activities: ActivityEvent[]) => {
    const groups = new Map<string, ActivityEvent[]>();
    
    activities.forEach(activity => {
      const activityDate = new Date(activity.sent_at || activity.opened_at || activity.clicked_at || '');
      let dateKey: string;
      
      if (isToday(activityDate)) {
        dateKey = 'Today';
      } else if (isYesterday(activityDate)) {
        dateKey = 'Yesterday';
      } else {
        dateKey = format(activityDate, 'MMMM d, yyyy');
      }
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(activity);
    });
    
    return groups;
  };

  const groupedActivities = groupByDate(filteredActivities);

  const convertToNotificationEvent = (activity: ActivityEvent) => {
    const latestEventType = getEventStatus(activity);
    const latestTimestamp = (() => {
      switch (latestEventType) {
        case 'reported': return activity.reported_at!;
        case 'submitted': return activity.data_submitted_at!;
        case 'clicked': return activity.clicked_at!;
        case 'opened': return activity.opened_at!;
        case 'sent': return activity.sent_at!;
        default: return activity.sent_at || new Date().toISOString();
      }
    })();

    return {
      id: activity.id,
      targetEmail: activity.target_email,
      eventType: latestEventType as 'sent' | 'opened' | 'clicked' | 'submitted' | 'reported',
      timestamp: latestTimestamp,
      campaignId: activity.campaign_id,
      campaignName: activity.campaigns?.name,
      userAgent: activity.user_agent,
      ipAddress: activity.ip_address,
      sentAt: activity.sent_at,
      openedAt: activity.opened_at,
      clickedAt: activity.clicked_at,
      submittedAt: activity.data_submitted_at,
      reportedAt: activity.reported_at,
      additionalData: activity.additional_data
    };
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Historical Activity Timeline
              </CardTitle>
              <CardDescription>
                Complete history of campaign interactions with detailed analysis
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <Calendar className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or campaign name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="submitted">Fell for Phish</SelectItem>
                <SelectItem value="clicked">Clicked</SelectItem>
                <SelectItem value="opened">Opened</SelectItem>
                <SelectItem value="sent">Sent Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results summary */}
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Showing {filteredActivities.length} of {activities.length} events</span>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-6">
        {Array.from(groupedActivities.entries()).map(([dateGroup, dayActivities]) => (
          <div key={dateGroup} className="space-y-4">
            {/* Date header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center gap-3 py-2 border-b">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-lg">{dateGroup}</h3>
                <Badge variant="outline" className="text-xs">
                  {dayActivities.length} events
                </Badge>
              </div>
            </div>

            {/* Events for this date */}
            <div className="space-y-3 pl-7">
              {dayActivities.map((activity) => (
                <EnhancedNotificationCard
                  key={activity.id}
                  event={convertToNotificationEvent(activity)}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredActivities.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="font-semibold text-lg mb-2">No activities found</h3>
              <p className="text-muted-foreground mb-4">
                {activities.length === 0 
                  ? "No campaign activity has been recorded yet." 
                  : "Try adjusting your filters to see more results."
                }
              </p>
              {activities.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDateFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HistoricalTimelineView;