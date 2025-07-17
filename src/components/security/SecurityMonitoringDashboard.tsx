
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Clock,
  Users,
  Mail,
  MousePointer,
  Target,
  Globe
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { realTimeSubscriptionService } from '@/utils/realTimeSubscriptionService';
import { useReports } from '@/hooks/useReports';

interface SecurityEvent {
  id: string;
  type: 'phishing_attempt' | 'successful_phish' | 'reported_email' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  targetEmail: string;
  campaignId?: string;
  details: Record<string, any>;
}

interface ThreatMetrics {
  vulnerabilityScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  activeThreats: number;
  successfulPhishing: number;
  reportedEmails: number;
  awarenessScore: number;
}

const SecurityMonitoringDashboard: React.FC = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [threatMetrics, setThreatMetrics] = useState<ThreatMetrics>({
    vulnerabilityScore: 0,
    riskLevel: 'low',
    activeThreats: 0,
    successfulPhishing: 0,
    reportedEmails: 0,
    awarenessScore: 0
  });
  const [realtimeActivity, setRealtimeActivity] = useState<any[]>([]);
  const { reportData, loading } = useReports();

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = realTimeSubscriptionService.subscribe(
      'security-monitoring',
      (event) => {
        const securityEvent: SecurityEvent = {
          id: event.id,
          type: event.eventType === 'submitted' ? 'successful_phish' : 
                event.eventType === 'reported' ? 'reported_email' :
                event.eventType === 'clicked' ? 'phishing_attempt' : 'suspicious_activity',
          severity: event.eventType === 'submitted' ? 'critical' :
                   event.eventType === 'clicked' ? 'high' :
                   event.eventType === 'reported' ? 'low' : 'medium',
          timestamp: event.timestamp,
          targetEmail: event.targetEmail,
          campaignId: event.campaignId,
          details: event.metadata || {}
        };

        setSecurityEvents(prev => [securityEvent, ...prev.slice(0, 49)]);
        setRealtimeActivity(prev => [
          {
            time: new Date(event.timestamp).toLocaleTimeString(),
            event: event.eventType,
            target: event.targetEmail,
            severity: securityEvent.severity
          },
          ...prev.slice(0, 19)
        ]);

        // Update threat metrics
        updateThreatMetrics(securityEvent);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (reportData) {
      calculateThreatMetrics();
    }
  }, [reportData]);

  const updateThreatMetrics = (newEvent: SecurityEvent) => {
    setThreatMetrics(prev => {
      const updates = { ...prev };
      
      switch (newEvent.type) {
        case 'successful_phish':
          updates.successfulPhishing += 1;
          updates.activeThreats += 1;
          break;
        case 'reported_email':
          updates.reportedEmails += 1;
          updates.awarenessScore = Math.min(100, updates.awarenessScore + 5);
          break;
        case 'phishing_attempt':
          updates.activeThreats += 1;
          break;
      }

      // Recalculate vulnerability score
      const totalEvents = updates.successfulPhishing + updates.reportedEmails + updates.activeThreats;
      if (totalEvents > 0) {
        updates.vulnerabilityScore = Math.round(
          ((updates.successfulPhishing * 3 + updates.activeThreats * 2 - updates.reportedEmails) / totalEvents) * 25
        );
        updates.vulnerabilityScore = Math.max(0, Math.min(100, updates.vulnerabilityScore));
      }

      // Determine risk level
      if (updates.vulnerabilityScore >= 75) updates.riskLevel = 'critical';
      else if (updates.vulnerabilityScore >= 50) updates.riskLevel = 'high';
      else if (updates.vulnerabilityScore >= 25) updates.riskLevel = 'medium';
      else updates.riskLevel = 'low';

      return updates;
    });
  };

  const calculateThreatMetrics = () => {
    if (!reportData?.campaignData) return;

    const totalSent = reportData.campaignData.reduce((sum, campaign) => sum + campaign.sent, 0);
    const totalClicked = reportData.campaignData.reduce((sum, campaign) => sum + campaign.clicked, 0);
    const totalSubmitted = reportData.campaignData.reduce((sum, campaign) => sum + campaign.submitted, 0);
    const totalReported = reportData.campaignData.reduce((sum, campaign) => sum + (campaign.reported || 0), 0);

    const vulnerabilityScore = totalSent > 0 ? Math.round((totalSubmitted / totalSent) * 100) : 0;
    const awarenessScore = totalSent > 0 ? Math.round((totalReported / totalSent) * 100) : 0;

    let riskLevel: ThreatMetrics['riskLevel'] = 'low';
    if (vulnerabilityScore >= 15) riskLevel = 'critical';
    else if (vulnerabilityScore >= 10) riskLevel = 'high';
    else if (vulnerabilityScore >= 5) riskLevel = 'medium';

    setThreatMetrics({
      vulnerabilityScore,
      riskLevel,
      activeThreats: totalClicked,
      successfulPhishing: totalSubmitted,
      reportedEmails: totalReported,
      awarenessScore
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  const getTrendData = () => {
    if (!reportData?.timeSeriesData) return [];
    
    return reportData.timeSeriesData.map(item => ({
      date: item.date,
      phishing: item.clicked || 0,
      submitted: item.submitted || 0,
      reported: item.reported || 0
    }));
  };

  const getVulnerabilityByDepartment = () => {
    if (!reportData?.departmentData) return [];
    
    return reportData.departmentData.map(dept => ({
      department: dept.department,
      vulnerability: dept.vulnerability_score,
      submitted: dept.submitted,
      total: dept.sent
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Threat Level Alert */}
      <Alert className={`border-2 ${getRiskColor(threatMetrics.riskLevel)}`}>
        <Shield className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>Current Threat Level: {threatMetrics.riskLevel.toUpperCase()}</strong>
            <p className="mt-1">
              Vulnerability Score: {threatMetrics.vulnerabilityScore}% | 
              Active Threats: {threatMetrics.activeThreats} | 
              Awareness Score: {threatMetrics.awarenessScore}%
            </p>
          </div>
          <Badge variant={getRiskBadgeVariant(threatMetrics.riskLevel)} className="ml-4">
            {threatMetrics.riskLevel.toUpperCase()}
          </Badge>
        </AlertDescription>
      </Alert>

      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vulnerability Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{threatMetrics.vulnerabilityScore}%</div>
            <Progress value={threatMetrics.vulnerabilityScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{threatMetrics.activeThreats}</div>
            <p className="text-xs text-muted-foreground">Clicked phishing links</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Phishing</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{threatMetrics.successfulPhishing}</div>
            <p className="text-xs text-muted-foreground">Data submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awareness Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{threatMetrics.awarenessScore}%</div>
            <Progress value={threatMetrics.awarenessScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Security Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Threat Trends</TabsTrigger>
          <TabsTrigger value="departments">Department Risk</TabsTrigger>
          <TabsTrigger value="activity">Live Activity</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Security Threat Trends</CardTitle>
              <CardDescription>Track phishing attempts, successes, and reporting over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="phishing" stroke="#f97316" strokeWidth={2} name="Phishing Attempts" />
                  <Line type="monotone" dataKey="submitted" stroke="#dc2626" strokeWidth={2} name="Successful" />
                  <Line type="monotone" dataKey="reported" stroke="#16a34a" strokeWidth={2} name="Reported" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Department Vulnerability Assessment</CardTitle>
              <CardDescription>Risk levels across different departments</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getVulnerabilityByDepartment()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="vulnerability" fill="#dc2626" name="Vulnerability %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Security Activity
              </CardTitle>
              <CardDescription>Real-time security events and threats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {realtimeActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity. Security events will appear here in real-time.
                  </div>
                ) : (
                  realtimeActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.severity === 'critical' ? 'bg-red-500' :
                        activity.severity === 'high' ? 'bg-orange-500' :
                        activity.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{activity.event.replace('_', ' ')}</span>
                          <Badge variant={activity.severity === 'critical' ? 'destructive' : 'outline'} className="text-xs">
                            {activity.severity}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Target: {activity.target} • {activity.time}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Security Event Log</CardTitle>
              <CardDescription>Detailed log of all security-related events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {securityEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No security events recorded yet.
                  </div>
                ) : (
                  securityEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className={`mt-1 w-3 h-3 rounded-full ${
                        event.severity === 'critical' ? 'bg-red-500' :
                        event.severity === 'high' ? 'bg-orange-500' :
                        event.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{event.type.replace('_', ' ').toUpperCase()}</span>
                          <Badge variant={event.severity === 'critical' ? 'destructive' : 'outline'}>
                            {event.severity}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Target: {event.targetEmail} • {new Date(event.timestamp).toLocaleString()}
                        </div>
                        {Object.keys(event.details).length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Additional details: {JSON.stringify(event.details, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityMonitoringDashboard;
