import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, Activity, Lock, Eye, EyeOff, RefreshCw } from "lucide-react";
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";

interface SecurityEvent {
  type: SecurityEventType;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
}

const SecurityMonitoringDashboard: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load initial events
    loadSecurityEvents();
    
    // Set up periodic refresh
    const interval = setInterval(loadSecurityEvents, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadSecurityEvents = () => {
    const latestEvents = securityLogger.getEvents();
    setEvents(latestEvents.slice(-50).reverse()); // Show last 50 events, newest first
  };

  const clearEvents = () => {
    securityLogger.clearEvents();
    setEvents([]);
  };

  const toggleDetails = (index: string) => {
    setShowDetails(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getEventIcon = (type: SecurityEventType) => {
    switch (type) {
      case SecurityEventType.AUTHENTICATION:
        return <Lock className="h-4 w-4" />;
      case SecurityEventType.AUTHORIZATION:
        return <Shield className="h-4 w-4" />;
      case SecurityEventType.SUSPICIOUS_ACTIVITY:
        return <AlertTriangle className="h-4 w-4" />;
      case SecurityEventType.INPUT_VALIDATION:
        return <Eye className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getEventColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'warn':
        return 'secondary';
      case 'info':
      default:
        return 'default';
    }
  };

  const getEventStats = () => {
    const stats = {
      total: events.length,
      errors: events.filter(e => e.level === 'error').length,
      warnings: events.filter(e => e.level === 'warn').length,
      info: events.filter(e => e.level === 'info').length
    };
    
    const byType = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { ...stats, byType };
  };

  const stats = getEventStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time security event monitoring and analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsMonitoring(!isMonitoring)}
            variant={isMonitoring ? "default" : "outline"}
            size="sm"
          >
            {isMonitoring ? (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Monitoring Active
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Start Monitoring
              </>
            )}
          </Button>
          <Button onClick={loadSecurityEvents} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={clearEvents} variant="outline" size="sm">
            Clear Events
          </Button>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.errors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.warnings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Info</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.info}</div>
          </CardContent>
        </Card>
      </div>

      {/* Security Recommendations */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Security Configuration Required</AlertTitle>
        <AlertDescription>
          <p className="mb-2">Complete your security setup by configuring these settings in your Supabase dashboard:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Reduce OTP expiry:</strong> Go to Authentication → Settings → General → Set OTP expiry to 5 minutes</li>
            <li><strong>Enable leaked password protection:</strong> Go to Authentication → Settings → Password Security → Enable</li>
            <li>Regularly review security events below for suspicious patterns</li>
            <li>Set up automated alerts for critical security events</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Event Type Distribution */}
      {Object.keys(stats.byType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Event Distribution by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getEventIcon(type as SecurityEventType)}
                    <span className="capitalize">{type.replace('_', ' ')}</span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>
            Latest security events and activities (showing last 50)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No security events recorded</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event, index) => {
                const eventId = `${event.timestamp}-${index}`;
                return (
                  <div
                    key={eventId}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getEventIcon(event.type)}
                        <div>
                          <div className="font-medium">{event.message}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getEventColor(event.level)}>
                          {event.level.toUpperCase()}
                        </Badge>
                        {event.details && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDetails(eventId)}
                          >
                            {showDetails[eventId] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    {showDetails[eventId] && event.details && (
                      <div className="bg-muted p-3 rounded text-sm">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(event.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitoringDashboard;