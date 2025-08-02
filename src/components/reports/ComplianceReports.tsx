import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Download, 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  FileText,
  Settings,
  Play
} from 'lucide-react';
import { ComplianceReport } from '@/hooks/useAdvancedReports';

interface ComplianceReportsProps {
  reports: ComplianceReport[];
  onGenerateReport: (frameworkType: string) => Promise<void>;
}

const ComplianceReports: React.FC<ComplianceReportsProps> = ({ 
  reports, 
  onGenerateReport 
}) => {
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [generatingReport, setGeneratingReport] = useState<string>('');

  const complianceFrameworks = [
    {
      id: 'SOX',
      name: 'Sarbanes-Oxley (SOX)',
      description: 'Financial reporting and internal controls compliance',
      requirements: [
        'Regular security awareness training documentation',
        'Incident response procedures and testing',
        'Access control and monitoring reports',
        'Risk assessment and mitigation evidence'
      ],
      frequency: 'Quarterly',
      nextDue: '2024-03-31',
      status: 92
    },
    {
      id: 'GDPR',
      name: 'General Data Protection Regulation (GDPR)',
      description: 'Data privacy and protection compliance for EU operations',
      requirements: [
        'Data processing activity records',
        'Privacy impact assessments',
        'Breach notification procedures',
        'Employee privacy training records'
      ],
      frequency: 'Annual',
      nextDue: '2024-05-25',
      status: 88
    },
    {
      id: 'ISO27001',
      name: 'ISO 27001',
      description: 'Information security management system standards',
      requirements: [
        'Information security policy documentation',
        'Risk treatment plans and reviews',
        'Security awareness training matrix',
        'Incident management procedures'
      ],
      frequency: 'Annual',
      nextDue: '2024-07-15',
      status: 85
    },
    {
      id: 'HIPAA',
      name: 'Health Insurance Portability and Accountability Act (HIPAA)',
      description: 'Healthcare data protection and privacy requirements',
      requirements: [
        'Security awareness training documentation',
        'Risk assessments and safeguards',
        'Access control and audit logs',
        'Breach response procedures'
      ],
      frequency: 'Annual',
      nextDue: '2024-04-30',
      status: 90
    },
    {
      id: 'PCI_DSS',
      name: 'Payment Card Industry Data Security Standard (PCI DSS)',
      description: 'Credit card data protection standards',
      requirements: [
        'Security awareness program documentation',
        'Vulnerability management reports',
        'Access control matrices',
        'Security testing results'
      ],
      frequency: 'Annual',
      nextDue: '2024-06-01',
      status: 87
    }
  ];

  const getStatusColor = (status: number) => {
    if (status >= 90) return 'text-green-600';
    if (status >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusVariant = (status: number) => {
    if (status >= 90) return 'default';
    if (status >= 80) return 'secondary';
    return 'destructive';
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleGenerateReport = async (frameworkId: string) => {
    setGeneratingReport(frameworkId);
    try {
      await onGenerateReport(frameworkId);
    } finally {
      setGeneratingReport('');
    }
  };

  const existingReportsByFramework = reports.reduce((acc, report) => {
    if (!acc[report.framework_type]) {
      acc[report.framework_type] = [];
    }
    acc[report.framework_type].push(report);
    return acc;
  }, {} as Record<string, ComplianceReport[]>);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Frameworks</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceFrameworks.length}</div>
            <p className="text-xs text-muted-foreground">Compliance frameworks tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(complianceFrameworks.reduce((sum, f) => sum + f.status, 0) / complianceFrameworks.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Across all frameworks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">Total compliance reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Due</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.min(...complianceFrameworks.map(f => getDaysUntilDue(f.nextDue)))} days
            </div>
            <p className="text-xs text-muted-foreground">Until next audit</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Framework Status</CardTitle>
              <CardDescription>
                Current compliance status across all tracked frameworks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {complianceFrameworks.map((framework) => {
                  const daysUntilDue = getDaysUntilDue(framework.nextDue);
                  const isOverdue = daysUntilDue < 0;
                  const isUrgent = daysUntilDue <= 30 && daysUntilDue >= 0;

                  return (
                    <div key={framework.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{framework.name}</h3>
                          <p className="text-sm text-muted-foreground">{framework.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={getStatusVariant(framework.status)} className="mb-2">
                            {framework.status}% Compliant
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {isOverdue ? (
                              <span className="text-red-600 font-medium">
                                Overdue by {Math.abs(daysUntilDue)} days
                              </span>
                            ) : isUrgent ? (
                              <span className="text-yellow-600 font-medium">
                                Due in {daysUntilDue} days
                              </span>
                            ) : (
                              <span>Due in {daysUntilDue} days</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Progress value={framework.status} className="mb-4" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Key Requirements</h4>
                          <ul className="space-y-1">
                            {framework.requirements.map((req, index) => (
                              <li key={index} className="text-sm flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Reporting Frequency:</span>
                            <span className="font-medium">{framework.frequency}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Next Due Date:</span>
                            <span className="font-medium">{new Date(framework.nextDue).toLocaleDateString()}</span>
                          </div>
                          <Button 
                            onClick={() => handleGenerateReport(framework.id)}
                            disabled={generatingReport === framework.id}
                            className="w-full"
                          >
                            {generatingReport === framework.id ? (
                              <>
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                Generate Report
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Compliance Report</CardTitle>
              <CardDescription>
                Create detailed compliance reports for audits and regulatory requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Framework</label>
                <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose compliance framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {complianceFrameworks.map(framework => (
                      <SelectItem key={framework.id} value={framework.id}>
                        {framework.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFramework && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Report Contents</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Executive summary and compliance scorecard</li>
                    <li>• Detailed security awareness training metrics</li>
                    <li>• Risk assessment findings and mitigations</li>
                    <li>• Incident response and breach documentation</li>
                    <li>• Policy adherence and control effectiveness</li>
                    <li>• Recommendations for improvement</li>
                  </ul>
                </div>
              )}

              <Button 
                onClick={() => selectedFramework && handleGenerateReport(selectedFramework)}
                disabled={!selectedFramework || generatingReport === selectedFramework}
                className="w-full"
              >
                {generatingReport === selectedFramework ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>
                Previously generated compliance reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(existingReportsByFramework).map(([framework, frameworkReports]) => (
                    <div key={framework} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">{framework} Reports</h4>
                      <div className="space-y-2">
                        {frameworkReports.map((report) => (
                          <div key={report.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <div className="font-medium">
                                {report.framework_type} Compliance Report
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Generated: {new Date(report.last_generated_at || '').toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                              <Badge variant={report.is_automated ? 'default' : 'secondary'}>
                                {report.is_automated ? 'Automated' : 'Manual'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No compliance reports generated yet</p>
                  <p className="text-sm">Generate your first report from the Generate tab</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Settings</CardTitle>
              <CardDescription>
                Configure automated reporting and notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Compliance settings configuration</p>
                <p className="text-sm">Configure automated reporting schedules and notification preferences</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceReports;