import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MousePointer, FileDown, FileText, Shield, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { SimulationMetrics, SimulationType } from '@/hooks/useSimulationMetrics';

interface SimulationKPICardsProps {
  simulationType: SimulationType;
  linkMetrics: SimulationMetrics | null;
  fileMetrics: SimulationMetrics | null;
  loading?: boolean;
}

const SimulationKPICards: React.FC<SimulationKPICardsProps> = ({
  simulationType,
  linkMetrics,
  fileMetrics,
  loading = false
}) => {
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const LoadingCard = ({ title, icon: Icon }: { title: string; icon: any }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <div className="animate-pulse bg-muted rounded h-6 w-12"></div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Loading...</p>
      </CardContent>
    </Card>
  );

  if (loading) {
    const loadingCards = simulationType === 'combined' 
      ? [
          { title: 'Total Sent', icon: Mail },
          { title: 'Total Interactions', icon: MousePointer },
          { title: 'Total Submissions', icon: AlertTriangle },
          { title: 'Total Reports', icon: Shield },
          { title: 'Average Success Rate', icon: TrendingUp }
        ]
      : simulationType === 'link'
      ? [
          { title: 'Emails Sent', icon: Mail },
          { title: 'Links Clicked', icon: MousePointer },
          { title: 'Credentials Submitted', icon: AlertTriangle },
          { title: 'Reports Received', icon: Shield },
          { title: 'Success Rate', icon: TrendingUp }
        ]
      : [
          { title: 'Emails Sent', icon: Mail },
          { title: 'Files Downloaded', icon: FileDown },
          { title: 'Files Opened', icon: FileText },
          { title: 'Reports Received', icon: Shield },
          { title: 'Success Rate', icon: TrendingUp }
        ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {loadingCards.map((card, index) => (
          <LoadingCard key={index} title={card.title} icon={card.icon} />
        ))}
      </div>
    );
  }

  if (simulationType === 'combined') {
    const totalSent = (linkMetrics?.emailsSent || 0) + (fileMetrics?.emailsSent || 0);
    const totalInteractions = (linkMetrics?.interactions || 0) + (fileMetrics?.interactions || 0);
    const totalSubmissions = (linkMetrics?.submissions || 0) + (fileMetrics?.submissions || 0);
    const totalReports = (linkMetrics?.reports || 0) + (fileMetrics?.reports || 0);
    const avgSuccessRate = totalSent > 0 
      ? ((linkMetrics?.successRate || 0) + (fileMetrics?.successRate || 0)) / 2 
      : 0;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Mail className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All simulation emails</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
              <MousePointer className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInteractions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Clicks + Downloads</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSubmissions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Data submissions + File downloads</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReports.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Users who reported</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Combined effectiveness</p>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Link-based Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">{linkMetrics?.emailsSent || 0}</div>
                  <div className="text-muted-foreground">Emails sent</div>
                </div>
                <div>
                  <div className="font-medium">{linkMetrics?.interactions || 0}</div>
                  <div className="text-muted-foreground">Clicks</div>
                </div>
                <div>
                  <div className="font-medium">{linkMetrics?.submissions || 0}</div>
                  <div className="text-muted-foreground">Submissions</div>
                </div>
                <div>
                  <div className="font-medium">{linkMetrics?.successRate || 0}%</div>
                  <div className="text-muted-foreground">Success rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">
                File-based Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">{fileMetrics?.emailsSent || 0}</div>
                  <div className="text-muted-foreground">Emails sent</div>
                </div>
                <div>
                  <div className="font-medium">{fileMetrics?.interactions || 0}</div>
                  <div className="text-muted-foreground">Downloads</div>
                </div>
                <div>
                  <div className="font-medium">{fileMetrics?.submissions || 0}</div>
                  <div className="text-muted-foreground">File opens</div>
                </div>
                <div>
                  <div className="font-medium">{fileMetrics?.successRate || 0}%</div>
                  <div className="text-muted-foreground">Success rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const metrics = simulationType === 'link' ? linkMetrics : fileMetrics;
  const isLinkType = simulationType === 'link';

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="flex items-center justify-center h-24">
            <p className="text-sm text-muted-foreground">No data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
          <Mail className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.emailsSent.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {isLinkType ? 'Link campaigns' : 'File campaigns'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {isLinkType ? 'Links Clicked' : 'Files Downloaded'}
          </CardTitle>
          {isLinkType ? (
            <MousePointer className="h-4 w-4 text-purple-500" />
          ) : (
            <FileDown className="h-4 w-4 text-indigo-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.interactions.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {isLinkType ? 'Click-through rate' : 'Download rate'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {isLinkType ? 'Credentials Submitted' : 'Files Opened'}
          </CardTitle>
          {isLinkType ? (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          ) : (
            <FileText className="h-4 w-4 text-amber-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.submissions.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {isLinkType ? 'Form submissions' : 'File executions'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reports Received</CardTitle>
          <Shield className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.reports.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Users who reported</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.successRate}%</div>
          <p className="text-xs text-muted-foreground">Campaign effectiveness</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimulationKPICards;
