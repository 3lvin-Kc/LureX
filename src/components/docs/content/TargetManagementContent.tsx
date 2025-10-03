import React from "react";
import { Users, Upload, Filter, UserCheck, UserX, Database, AlertTriangle, CheckCircle, Settings, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const TargetManagementContent: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Target Management</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Organize and manage your phishing simulation recipients with advanced targeting, grouping, and data management capabilities.
        </p>
      </div>

      {/* Target Import Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Target Import Methods
          </CardTitle>
          <CardDescription>
            Multiple ways to add and manage recipients for your phishing campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">CSV/Excel Import</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Process:</strong> Upload spreadsheet files with recipient data</p>
                <p><strong>Benefits:</strong> Bulk import, existing data integration</p>
                <p><strong>Formats:</strong> CSV, Excel (.xlsx, .xls)</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Required Columns:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                    <span>Email Address</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Recommended</Badge>
                    <span>First Name, Last Name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                    <span>Department, Job Title, Phone</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                
              </div>
              
              
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Manual Entry</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Process:</strong> Add recipients individually through web interface</p>
                <p><strong>Benefits:</strong> Precise control, immediate availability</p>
                <p><strong>Use Case:</strong> Small groups, specific targeting</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Entry Process:</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>• Email validation in real-time</div>
                  <div>• Duplicate checking</div>
                  <div>• Bulk entry capabilities</div>
                  <div>• Immediate list assignment</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Import Workflow */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Target Import Workflow</h2>

        <Tabs defaultValue="csv-import" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="csv-import">CSV Import</TabsTrigger>
            
            <TabsTrigger value="manual-entry">Manual Entry</TabsTrigger>
            <TabsTrigger value="data-validation">Data Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="csv-import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  CSV/Excel Import Process
                </CardTitle>
                <CardDescription>
                  Step-by-step guide to importing target data from spreadsheet files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Step 1: Prepare Your Data</h4>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm mb-2">File Format Requirements</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>First row must contain column headers</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Email column must be named "email" or "email_address"</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Maximum file size: 10MB</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Maximum rows: 50,000</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm mb-2">Sample CSV Structure</h5>
                        <div className="bg-muted p-3 rounded font-mono text-xs">
                          <div>email,first_name,last_name,department,position</div>
                          <div>john.smith@company.com,John,Smith,IT,Developer</div>
                          <div>jane.doe@company.com,Jane,Doe,HR,Manager</div>
                          <div>mike.johnson@company.com,Mike,Johnson,Finance,Analyst</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Step 2: Upload Process</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">File Selection</p>
                          <p className="text-xs text-muted-foreground">Browse and select your CSV or Excel file</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Column Mapping</p>
                          <p className="text-xs text-muted-foreground">System automatically detects and maps columns</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Data Preview</p>
                          <p className="text-xs text-muted-foreground">Review first few rows before import</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Import Execution</p>
                          <p className="text-xs text-muted-foreground">Process and validate all recipient data</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Step 3: Post-Import Actions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm mb-2">Automatic Actions</h5>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>• Duplicate email detection and removal</div>
                          <div>• Email format validation</div>
                          <div>• Data normalization and cleanup</div>
                          <div>• Target list creation or update</div>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm mb-2">Manual Review</h5>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>• Import summary and statistics</div>
                          <div>• Error and warning reports</div>
                          <div>• Data quality assessment</div>
                          <div>• List assignment options</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Import Best Practice:</strong> Always review your data before importing. Check for duplicate emails, invalid formats, and missing required fields. Large imports may take several minutes to process.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="manual-entry" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Manual Target Entry
                </CardTitle>
                <CardDescription>
                  Add recipients individually for precise control and immediate availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Individual Entry Process</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Basic Information</p>
                          <p className="text-xs text-muted-foreground">Email address (required), first name, last name</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Organizational Data</p>
                          <p className="text-xs text-muted-foreground">Department, job title, location, manager</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Contact Information</p>
                          <p className="text-xs text-muted-foreground">Phone number, additional email addresses</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">List Assignment</p>
                          <p className="text-xs text-muted-foreground">Assign to existing or new target lists</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Bulk Entry Features</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm mb-2">Copy-Paste Import</h5>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>• Paste multiple email addresses</div>
                          <div>• Tab-separated values support</div>
                          <div>• Automatic format detection</div>
                          <div>• Real-time validation</div>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm mb-2">Template-Based Entry</h5>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>• Pre-defined field templates</div>
                          <div>• Department-specific forms</div>
                          <div>• Role-based data requirements</div>
                          <div>• Validation rule customization</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <UserCheck className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Manual Entry Tip:</strong> Use for small groups, executive teams, or when you need immediate availability. Manual entries are validated in real-time and available for campaigns immediately after creation.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data-validation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Data Validation & Quality
                </CardTitle>
                <CardDescription>
                  Ensure data accuracy and completeness before using in campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Validation Rules</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Automatic checks applied to all imported and entered data.
                      </p>

                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Email Validation</h5>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>• RFC 5322 compliant format checking</div>
                            <div>• Domain existence verification</div>
                            <div>• MX record validation</div>
                            <div>• Disposable email detection</div>
                          </div>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Data Format Checks</h5>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>• Phone number format validation</div>
                            <div>• Name field completeness</div>
                            <div>• Department name standardization</div>
                            <div>• Duplicate detection across lists</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Quality Metrics</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Track and improve your target data quality over time.
                      </p>

                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Data Completeness</h5>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>• Required field completion rates</div>
                            <div>• Optional field utilization</div>
                            <div>• Missing data identification</div>
                            <div>• Completeness scoring</div>
                          </div>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Data Accuracy</h5>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>• Email deliverability rates</div>
                            <div>• Bounce rate monitoring</div>
                            <div>• Invalid email identification</div>
                            <div>• Data freshness tracking</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Data Quality Impact:</strong> High-quality target data improves campaign effectiveness, reduces bounce rates, and ensures better personalization. Regular validation and cleanup should be part of your target management routine.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Target Grouping & Segmentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Target Grouping & Segmentation
          </CardTitle>
          <CardDescription>
            Organize targets into logical groups for effective campaign targeting and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Organizational Grouping</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Create groups based on company structure and roles.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">IT Department</Badge>
                    <span className="text-xs text-muted-foreground">Technical staff, system administrators</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Executives</Badge>
                    <span className="text-xs text-muted-foreground">C-level, VPs, directors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Finance Team</Badge>
                    <span className="text-xs text-muted-foreground">Accounting, financial analysts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Remote Workers</Badge>
                    <span className="text-xs text-muted-foreground">Off-site and distributed teams</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Risk-Based Grouping</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Segment targets based on their security risk profile.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs">High Risk</Badge>
                    <span className="text-xs text-muted-foreground">Previous phishing failures, low training scores</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Medium Risk</Badge>
                    <span className="text-xs text-muted-foreground">Some training gaps, moderate awareness</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Low Risk</Badge>
                    <span className="text-xs text-muted-foreground">Good security practices, recent training</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Smart Filtering</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Advanced filtering capabilities for precise target selection.
                </p>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Filter Criteria</h5>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>• Department or division</div>
                      <div>• Job title or role level</div>
                      <div>• Geographic location</div>
                      <div>• Training completion status</div>
                      <div>• Previous campaign participation</div>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Exclusion Rules</h5>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>• Recent campaign participants</div>
                      <div>• Opt-out preferences</div>
                      <div>• Vacation or leave status</div>
                      <div>• Executive or VIP exclusions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Analytics & Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Target Analytics & Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">1,247</div>
              <div className="text-sm text-muted-foreground">Total Recipients</div>
              <div className="text-xs text-muted-foreground mt-1">Across all lists</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">89%</div>
              <div className="text-sm text-muted-foreground">Active Targets</div>
              <div className="text-xs text-muted-foreground mt-1">Valid email addresses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">23</div>
              <div className="text-sm text-muted-foreground">Target Groups</div>
              <div className="text-xs text-muted-foreground mt-1">Organized segments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600 mb-1">156</div>
              <div className="text-sm text-muted-foreground">New This Month</div>
              <div className="text-xs text-muted-foreground mt-1">Recent additions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Issues & Solutions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Target Management Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">❌ Import Process Fails</h4>
              <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
                <p><strong>Common Causes:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>File format not supported or corrupted</li>
                  <li>Missing required columns (email)</li>
                  <li>File size exceeds limits (10MB)</li>
                  <li>Invalid characters or encoding issues</li>
                </ul>
                <p><strong>Solutions:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Verify file format and size requirements</li>
                  <li>Check for required email column</li>
                  <li>Ensure proper CSV formatting</li>
                  <li>Try with a smaller sample file first</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border border-amber-200 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">⚠️ Duplicate Email Detection</h4>
              <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                <p><strong>Common Causes:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Same email in multiple source files</li>
                  <li>Case variations (John@ vs john@)</li>
                  <li>Plus addressing variations</li>
                  <li>Existing targets in system</li>
                </ul>
                <p><strong>Solutions:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Review and clean source data before import</li>
                  <li>Use data validation tools</li>
                  <li>Check existing target lists for overlaps</li>
                  <li>Enable duplicate detection during import</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">ℹ️ AD Sync Issues</h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <p><strong>Common Causes:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Incorrect connection credentials</li>
                  <li>Network connectivity problems</li>
                  <li>Permission restrictions</li>
                  <li>AD schema changes</li>
                </ul>
                <p><strong>Solutions:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Verify AD connection settings</li>
                  <li>Test connectivity separately</li>
                  <li>Check user permissions</li>
                  <li>Contact IT for schema verification</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Target Management Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Data Quality Management</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Verify email addresses before campaigns</li>
                <li>• Keep recipient data current and accurate</li>
                <li>• Remove bounced or invalid emails regularly</li>
                <li>• Validate data during import process</li>
                <li>• Maintain data backup and version history</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Targeting Strategy</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Start with high-risk departments</li>
                <li>• Consider user training history and experience</li>
                <li>• Respect opt-out preferences and requests</li>
                <li>• Plan progressive difficulty levels</li>
                <li>• Monitor campaign performance by segment</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
