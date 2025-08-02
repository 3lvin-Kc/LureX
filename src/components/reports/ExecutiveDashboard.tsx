import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  DollarSign, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { ExecutiveDashboardData } from '@/hooks/useAdvancedReports';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface ExecutiveDashboardProps {
  data: ExecutiveDashboardData;
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  // Sample trend data for charts
  const trendData = [
    { month: 'Jan', score: 72, incidents: 8 },
    { month: 'Feb', score: 75, incidents: 6 },
    { month: 'Mar', score: 78, incidents: 4 },
    { month: 'Apr', score: 82, incidents: 3 },
    { month: 'May', score: 85, incidents: 2 },
    { month: 'Jun', score: data.security_posture.overall_score, incidents: 1 }
  ];

  const departmentData = data.security_posture.high_risk_departments.map((dept, index) => ({
    name: dept,
    risk: 85 - (index * 10),
    color: ['#ef4444', '#f97316', '#eab308'][index] || '#6b7280'
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ROI</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.roi_metrics.cost_savings)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{data.roi_metrics.incident_prevention_count} incidents prevented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(data.security_posture.overall_score)}`}>
              {data.security_posture.overall_score}/100
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {data.security_posture.improvement_trend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(data.security_posture.improvement_trend)}% this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaign Success</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.campaign_effectiveness.success_rate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.campaign_effectiveness.repeat_failures}% repeat failures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Hours Saved</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.roi_metrics.training_hours_saved}
            </div>
            <p className="text-xs text-muted-foreground">
              Equivalent to {formatCurrency(data.roi_metrics.training_hours_saved * 50)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Posture Trend</CardTitle>
            <CardDescription>Monthly security score and incident count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Security Score"
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="incidents" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Incidents"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>High-Risk Departments</CardTitle>
            <CardDescription>Departments requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentData.map((dept, index) => (
                <div key={dept.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{dept.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Progress value={dept.risk} className="w-20" />
                    <Badge variant="destructive">{dept.risk}% risk</Badge>
                  </div>
                </div>
              ))}
              {departmentData.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  No high-risk departments identified
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance & Performance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
            <CardDescription>Regulatory framework compliance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">SOX Compliance</span>
              <Badge variant={getScoreVariant(data.compliance_status.sox_compliance)}>
                {data.compliance_status.sox_compliance}%
              </Badge>
            </div>
            <Progress value={data.compliance_status.sox_compliance} className="h-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">GDPR Compliance</span>
              <Badge variant={getScoreVariant(data.compliance_status.gdpr_compliance)}>
                {data.compliance_status.gdpr_compliance}%
              </Badge>
            </div>
            <Progress value={data.compliance_status.gdpr_compliance} className="h-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">ISO 27001</span>
              <Badge variant={getScoreVariant(data.compliance_status.iso27001_compliance)}>
                {data.compliance_status.iso27001_compliance}%
              </Badge>
            </div>
            <Progress value={data.compliance_status.iso27001_compliance} className="h-2" />
            
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Next Audit</p>
              <p className="text-sm font-medium">
                {new Date(data.compliance_status.next_audit_date).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee Engagement</CardTitle>
            <CardDescription>Training participation and awareness</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {data.campaign_effectiveness.employee_engagement}%
              </div>
              <p className="text-sm text-muted-foreground">Overall Engagement</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Training Completion</span>
                <span className="text-sm font-medium">
                  {data.campaign_effectiveness.training_completion}%
                </span>
              </div>
              <Progress value={data.campaign_effectiveness.training_completion} />
              
              <div className="flex justify-between">
                <span className="text-sm">Security Readiness</span>
                <span className="text-sm font-medium">
                  {data.security_posture.security_readiness}%
                </span>
              </div>
              <Progress value={data.security_posture.security_readiness} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Savings</CardTitle>
            <CardDescription>Financial impact of security awareness</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Training Cost Savings</span>
                <span className="text-sm font-medium">
                  {formatCurrency(data.roi_metrics.training_hours_saved * 50)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Incident Prevention</span>
                <span className="text-sm font-medium">
                  {formatCurrency(data.roi_metrics.incident_prevention_count * 10000)}
                </span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total ROI</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(data.roi_metrics.cost_savings)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;