import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Award, Target } from 'lucide-react';
import { BenchmarkData } from '@/hooks/useAdvancedReports';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

interface BenchmarkComparisonProps {
  data: BenchmarkData[];
}

const BenchmarkComparison: React.FC<BenchmarkComparisonProps> = ({ data }) => {
  const [selectedIndustry, setSelectedIndustry] = React.useState<string>('all');

  const getPerformanceIndicator = (percentile: number) => {
    if (percentile >= 75) return { icon: Award, color: 'text-green-600', label: 'Top Quartile' };
    if (percentile >= 50) return { icon: TrendingUp, color: 'text-blue-600', label: 'Above Average' };
    if (percentile >= 25) return { icon: Target, color: 'text-yellow-600', label: 'Below Average' };
    return { icon: TrendingDown, color: 'text-red-600', label: 'Bottom Quartile' };
  };

  const getBadgeVariant = (percentile: number) => {
    if (percentile >= 75) return 'default';
    if (percentile >= 50) return 'secondary';
    if (percentile >= 25) return 'outline';
    return 'destructive';
  };

  const filteredData = selectedIndustry === 'all' 
    ? data 
    : data.filter(item => item.industry.toLowerCase().includes(selectedIndustry.toLowerCase()));

  const industries = Array.from(new Set(data.map(item => item.industry.split(' - ')[0])));

  // Prepare chart data for comparison
  const chartData = filteredData.map(item => ({
    name: item.industry.replace(' - ', '\n'),
    your_performance: item.your_performance,
    industry_average: item.industry_average,
    top_quartile: item.top_quartile,
    bottom_quartile: item.bottom_quartile
  }));

  const scatterData = filteredData.map((item, index) => ({
    x: item.industry_average,
    y: item.your_performance,
    name: item.industry,
    percentile: item.percentile_rank
  }));

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Industry Benchmark Analysis</CardTitle>
          <CardDescription>
            Compare your security awareness performance against industry standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="min-w-48">
              <label className="text-sm font-medium mb-2 block">Industry</label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredData.slice(0, 4).map((item, index) => {
          const indicator = getPerformanceIndicator(item.percentile_rank);
          const Icon = indicator.icon;
          
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.industry}</CardTitle>
                <Icon className={`h-4 w-4 ${indicator.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.your_performance.toFixed(1)}%</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    Industry Avg: {item.industry_average.toFixed(1)}%
                  </span>
                  <Badge variant={getBadgeVariant(item.percentile_rank)}>
                    {item.percentile_rank}th percentile
                  </Badge>
                </div>
                <Progress 
                  value={item.percentile_rank} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Comparison</CardTitle>
          <CardDescription>
            Your performance vs industry benchmarks across different metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}%`, 
                  name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                ]}
              />
              <Bar dataKey="your_performance" fill="hsl(var(--primary))" name="Your Performance" />
              <Bar dataKey="industry_average" fill="hsl(var(--muted))" name="Industry Average" />
              <Bar dataKey="top_quartile" fill="hsl(var(--secondary))" name="Top Quartile" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Distribution</CardTitle>
          <CardDescription>
            Your position relative to industry performance distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="x" 
                name="Industry Average" 
                label={{ value: 'Industry Average (%)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                dataKey="y" 
                name="Your Performance" 
                label={{ value: 'Your Performance (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                labelFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <Scatter 
                dataKey="y" 
                fill="hsl(var(--primary))"
                name="Performance Point"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Benchmark Breakdown</CardTitle>
          <CardDescription>
            Complete comparison across all tracked metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredData.map((item, index) => {
              const indicator = getPerformanceIndicator(item.percentile_rank);
              const Icon = indicator.icon;
              
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{item.industry}</h4>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${indicator.color}`} />
                      <Badge variant={getBadgeVariant(item.percentile_rank)}>
                        {indicator.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Your Performance</p>
                      <p className="font-medium text-lg">{item.your_performance.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Industry Average</p>
                      <p className="font-medium">{item.industry_average.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Top Quartile</p>
                      <p className="font-medium">{item.top_quartile.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Percentile Rank</p>
                      <p className="font-medium">{item.percentile_rank}th</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Bottom Quartile</span>
                      <span>Top Quartile</span>
                    </div>
                    <Progress value={item.percentile_rank} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BenchmarkComparison;