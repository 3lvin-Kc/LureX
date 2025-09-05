import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Mail, 
  Eye, 
  MousePointer, 
  Shield, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Smartphone,
  Monitor,
  Tablet,
  Clock,
  Globe
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { parseUserAgent, calculateTimeToClick, assessRisk, DeviceInfo, RiskIndicators } from '@/utils/deviceInfoParser';

interface NotificationEvent {
  id: string;
  targetEmail: string;
  eventType: 'sent' | 'opened' | 'clicked' | 'submitted' | 'reported';
  timestamp: string;
  campaignId?: string;
  campaignName?: string;
  userAgent?: string;
  ipAddress?: string;
  location?: {
    city?: string;
    country?: string;
  };
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
  submittedAt?: string;
  reportedAt?: string;
  additionalData?: any;
}

interface EnhancedNotificationCardProps {
  event: NotificationEvent;
  isNew?: boolean;
}

const EnhancedNotificationCard: React.FC<EnhancedNotificationCardProps> = ({ event, isNew = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const deviceInfo: DeviceInfo = event.userAgent ? parseUserAgent(event.userAgent) : {
    deviceType: 'unknown',
    browser: 'Unknown',
    browserVersion: '',
    os: 'Unknown',
    osVersion: ''
  };

  const timeToClick = calculateTimeToClick(event.sentAt, event.openedAt, event.clickedAt);
  
  const riskAssessment: RiskIndicators = assessRisk(
    timeToClick || undefined,
    !!event.submittedAt,
    !!event.reportedAt,
    deviceInfo
  );

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'sent':
        return <Mail className="h-4 w-4" />;
      case 'opened':
        return <Eye className="h-4 w-4" />;
      case 'clicked':
        return <MousePointer className="h-4 w-4" />;
      case 'submitted':
        return <Shield className="h-4 w-4" />;
      case 'reported':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'sent':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'opened':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'clicked':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'submitted':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'reported':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-3 w-3" />;
      case 'tablet':
        return <Tablet className="h-3 w-3" />;
      case 'desktop':
        return <Monitor className="h-3 w-3" />;
      default:
        return <Monitor className="h-3 w-3" />;
    }
  };

  const formatTimeToClick = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <Card className={`transition-all duration-300 ${isNew ? 'animate-in slide-in-from-top-2 border-primary shadow-md' : ''}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full p-0 h-auto">
            <CardContent className="w-full p-4">
              <div className="flex items-center gap-3">
                {/* Event indicator */}
                <div className={`flex-shrink-0 p-2 rounded-full ${getEventColor(event.eventType)}`}>
                  {getEventIcon(event.eventType)}
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{event.targetEmail}</span>
                    <Badge variant="outline" className="text-xs">
                      {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                    </Badge>
                    {riskAssessment.riskLevel !== 'low' && (
                      <Badge className={`text-xs ${riskAssessment.riskBadgeClass}`}>
                        {riskAssessment.riskLevel.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </div>
                    
                    {deviceInfo.deviceType !== 'unknown' && (
                      <div className="flex items-center gap-1">
                        {getDeviceIcon(deviceInfo.deviceType)}
                        <span>{deviceInfo.browser}</span>
                      </div>
                    )}
                    
                    {timeToClick && (
                      <div className={`flex items-center gap-1 ${riskAssessment.riskColor}`}>
                        <MousePointer className="h-3 w-3" />
                        <span>{formatTimeToClick(timeToClick)}</span>
                      </div>
                    )}
                    
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        <span>{event.location.city}, {event.location.country}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expand indicator */}
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardContent>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">
            <div className="space-y-4 border-t pt-4">
              {/* Detailed Event Timeline */}
              {(event.sentAt || event.openedAt || event.clickedAt || event.submittedAt || event.reportedAt) && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Event Timeline</h4>
                  <div className="space-y-2">
                    {event.sentAt && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>Email sent at {format(new Date(event.sentAt), 'MMM d, h:mm:ss a')}</span>
                      </div>
                    )}
                    {event.openedAt && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Opened at {format(new Date(event.openedAt), 'MMM d, h:mm:ss a')}</span>
                      </div>
                    )}
                    {event.clickedAt && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <span>Clicked at {format(new Date(event.clickedAt), 'MMM d, h:mm:ss a')}</span>
                      </div>
                    )}
                    {event.submittedAt && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>Data submitted at {format(new Date(event.submittedAt), 'MMM d, h:mm:ss a')}</span>
                      </div>
                    )}
                    {event.reportedAt && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span>Reported at {format(new Date(event.reportedAt), 'MMM d, h:mm:ss a')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Risk Assessment */}
              <div>
                <h4 className="text-sm font-medium mb-2">Risk Assessment</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Risk Level:</span>
                    <Badge className={riskAssessment.riskBadgeClass}>
                      {riskAssessment.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                  {riskAssessment.riskFactors.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground">Risk Factors:</span>
                      <ul className="list-disc list-inside text-xs text-muted-foreground ml-2">
                        {riskAssessment.riskFactors.map((factor, index) => (
                          <li key={index}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Device Information */}
              {deviceInfo.deviceType !== 'unknown' && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Device Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Device:</span>
                      <span className="ml-1 capitalize">{deviceInfo.deviceType}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">OS:</span>
                      <span className="ml-1">{deviceInfo.os} {deviceInfo.osVersion}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Browser:</span>
                      <span className="ml-1">{deviceInfo.browser} {deviceInfo.browserVersion}</span>
                    </div>
                    {event.ipAddress && (
                      <div>
                        <span className="text-muted-foreground">IP:</span>
                        <span className="ml-1 font-mono">{event.ipAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Campaign Information */}
              {event.campaignName && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Campaign</h4>
                  <p className="text-xs text-muted-foreground">{event.campaignName}</p>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default EnhancedNotificationCard;