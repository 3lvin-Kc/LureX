import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import { SecurityTrendData } from '@/hooks/useSecurityTrends';

interface TeamSecurityTrendChartProps {
  data: SecurityTrendData[];
  loading?: boolean;
  className?: string;
}

const TeamSecurityTrendChart: React.FC<TeamSecurityTrendChartProps> = ({ 
  data, 
  loading = false, 
  className = "" 
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="font-medium text-card-foreground mb-3">📅 {label}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Users who reported:</span>
              <span className="font-medium text-green-600">{data?.positiveInteractions || 0}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-muted-foreground">Users who fell for phishing:</span>
              <span className="font-medium text-red-600">{data?.negativeInteractions || 0}</span>
            </div>
            <div className="flex items-center gap-2 text-sm pt-2 border-t border-border">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Awareness rate:</span>
              <span className="font-medium text-blue-600">{data?.awarenessRate || 0}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">
              {entry.dataKey === 'positiveInteractions' ? 'Reported Phishing' : 'Fell for Phishing'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Calculate summary stats
  const totalPositive = data.reduce((sum, day) => sum + day.positiveInteractions, 0);
  const totalNegative = data.reduce((sum, day) => sum + day.negativeInteractions, 0);
  const totalInteractions = totalPositive + totalNegative;
  const overallAwarenessRate = totalInteractions > 0 ? Math.round((totalPositive / totalInteractions) * 100) : 0;

  // Determine trend direction
  const recentDays = data.slice(-7);
  const earlierDays = data.slice(-14, -7);
  const recentAvgAwareness = recentDays.reduce((sum, day) => sum + day.awarenessRate, 0) / recentDays.length;
  const earlierAvgAwareness = earlierDays.reduce((sum, day) => sum + day.awarenessRate, 0) / earlierDays.length;
  const trendDirection = recentAvgAwareness > earlierAvgAwareness ? 'up' : 'down';
  const trendPercentage = Math.abs(recentAvgAwareness - earlierAvgAwareness).toFixed(1);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Team Security Awareness Trend</CardTitle>
          <CardDescription>Daily tracking of positive vs negative phishing responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          Team Security Awareness Trend
        </CardTitle>
        <CardDescription>
          Daily tracking of positive vs negative phishing responses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalPositive}</div>
            <div className="text-sm text-green-700 dark:text-green-400">Reported Phishing</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{totalNegative}</div>
            <div className="text-sm text-red-700 dark:text-red-400">Fell for Phishing</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{overallAwarenessRate}%</div>
            <div className="text-sm text-blue-700 dark:text-blue-400">Awareness Rate</div>
          </div>
        </div>

        {/* Trend Insight */}
        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className={`h-4 w-4 ${trendDirection === 'up' ? 'text-green-500' : 'text-red-500'}`} />
            <span className="font-medium">
              {trendDirection === 'up' ? 'Security awareness is improving!' : 'Security awareness needs attention'}
            </span>
            <span className="text-muted-foreground">
              {trendPercentage}% {trendDirection === 'up' ? 'increase' : 'decrease'} this week
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-30" />
              <XAxis 
                dataKey="date" 
                className="text-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="positiveInteractions"
                stackId="1"
                stroke="hsl(var(--chart-2))"
                fill="url(#positiveGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="negativeInteractions"
                stackId="2"
                stroke="hsl(var(--destructive))"
                fill="url(#negativeGradient)"
                strokeWidth={2}
              />
              <Legend content={<CustomLegend />} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="mt-4 text-center">
          {totalInteractions === 0 ? (
            <p className="text-sm text-muted-foreground">
              No phishing simulation data available for the selected period
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {overallAwarenessRate >= 70 ? '🎉' : overallAwarenessRate >= 50 ? '👍' : '⚠️'} 
              {' '}Your team correctly identified {overallAwarenessRate}% of phishing attempts
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamSecurityTrendChart;
