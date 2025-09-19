import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SpiderChartData } from '@/hooks/useSimulationMetrics';

interface SimulationSpiderChartProps {
  data: SpiderChartData[];
  loading?: boolean;
  className?: string;
}

const SimulationSpiderChart: React.FC<SimulationSpiderChartProps> = ({ 
  data, 
  loading = false, 
  className = "" 
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-card-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.dataKey === 'linkValue' ? 'Link-based' : 'File-based'}:</span>
              <span className="font-medium text-card-foreground">{entry.value}</span>
            </div>
          ))}
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
              {entry.dataKey === 'linkValue' ? 'Link-based Phishing' : 'File-based Phishing'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Simulation Effectiveness Analysis</CardTitle>
          <CardDescription>Comparative performance across simulation types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Simulation Effectiveness Analysis</CardTitle>
          <CardDescription>Comparative performance across simulation types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="text-muted-foreground mb-2">No simulation data available</div>
            <p className="text-sm text-muted-foreground">
              Create campaigns with different simulation types to see comparative analysis
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Simulation Effectiveness Analysis</span>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          </div>
        </CardTitle>
        <CardDescription>
          Comparative performance analysis across different phishing simulation types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid 
                gridType="polygon" 
                className="stroke-muted opacity-30"
              />
              <PolarAngleAxis 
                dataKey="dimension" 
                tick={{ 
                  fontSize: 12, 
                  fill: 'hsl(var(--muted-foreground))',
                  fontWeight: 500
                }}
                className="text-muted-foreground"
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 'dataMax']} 
                tick={{ 
                  fontSize: 10, 
                  fill: 'hsl(var(--muted-foreground))'
                }}
                className="text-muted-foreground"
              />
              <Radar
                name="Link-based"
                dataKey="linkValue"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.1}
                strokeWidth={2}
                dot={{ 
                  fill: 'hsl(var(--chart-1))', 
                  strokeWidth: 2, 
                  r: 4 
                }}
              />
              <Radar
                name="File-based"
                dataKey="fileValue"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.1}
                strokeWidth={2}
                dot={{ 
                  fill: 'hsl(var(--chart-2))', 
                  strokeWidth: 2, 
                  r: 4 
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Chart Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="font-medium text-card-foreground">Volume</div>
            <div className="text-muted-foreground">Total emails sent</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="font-medium text-card-foreground">Engagement</div>
            <div className="text-muted-foreground">Clicks/Downloads</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="font-medium text-card-foreground">Compromise</div>
            <div className="text-muted-foreground">Data submitted/Files opened</div>
          </div>
        </div>
        
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="font-medium text-card-foreground">Awareness</div>
            <div className="text-muted-foreground">Users who reported</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="font-medium text-card-foreground">Risk Score</div>
            <div className="text-muted-foreground">Calculated risk level</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="font-medium text-card-foreground">Response Speed</div>
            <div className="text-muted-foreground">Time to interaction</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimulationSpiderChart;
