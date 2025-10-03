import React from "react";
import { Rocket, Target, Mail, Calendar, Users, Settings, FileText, Link, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const CreateCampaignContent: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Rocket className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Create Campaign</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Step-by-step guide to creating effective phishing simulation campaigns. Follow this process to launch campaigns that test your organization's security awareness.
        </p>
      </div>

      {/* Campaign Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Choose Your Campaign Type
          </CardTitle>
          <CardDescription>
            Select between link-based or file attachment campaigns based on your testing objectives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Link className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Link-Based Phishing</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Use Case:</strong> Test user behavior with malicious links</p>
                <p><strong>Process:</strong> Email → Click Link → Landing Page → Data Entry</p>
                <p><strong>Tracking:</strong> Email opens, link clicks, form submissions, page interactions</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Required Components:</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Email Template</Badge>
                  <Badge variant="outline" className="text-xs">Target List</Badge>
                  <Badge variant="outline" className="text-xs">Landing Page</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">File Attachment Phishing</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Use Case:</strong> Test user behavior with malicious file attachments</p>
                <p><strong>Process:</strong> Email → Download File → Open File → Tracking</p>
                <p><strong>Tracking:</strong> Email opens, file downloads, file opens, device fingerprinting</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Required Components:</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Email Template</Badge>
                  <Badge variant="outline" className="text-xs">Target List</Badge>
                  <Badge variant="outline" className="text-xs">File Type</Badge>
                  <Badge variant="outline" className="text-xs">File Name</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Campaign Creation */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Campaign Creation Process</h2>

        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basics">Basic Setup</TabsTrigger>
            <TabsTrigger value="simulation">Simulation Config</TabsTrigger>
            <TabsTrigger value="content">Content & Targets</TabsTrigger>
            <TabsTrigger value="schedule">Scheduling</TabsTrigger>
            <TabsTrigger value="launch">Launch</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Step 1: Basic Campaign Information
                </CardTitle>
                <CardDescription>
                  Set up the fundamental details of your phishing campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Campaign Name</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Choose a descriptive name that clearly identifies the campaign's purpose and target audience.
                      </p>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">Examples:</p>
                        <ul className="text-muted-foreground space-y-1">
                          <li>• "Q4 Security Awareness - IT Department"</li>
                          <li>• "New Employee Onboarding Phishing Test"</li>
                          <li>• "Executive Team Credential Harvesting"</li>
                          <li>• "Remote Worker File Attachment Test"</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Campaign Description (Optional)</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Provide context about the campaign's objectives, what you're testing, and expected outcomes.
                      </p>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">Include:</p>
                        <ul className="text-muted-foreground space-y-1">
                          <li>• Testing objectives</li>
                          <li>• Target audience details</li>
                          <li>• Success criteria</li>
                          <li>• Follow-up training plans</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Tip:</strong> Use clear, professional naming conventions. Campaign names appear in reports and analytics, so choose names that make it easy to identify campaigns later.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="simulation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Step 2: Configure Simulation Type
                </CardTitle>
                <CardDescription>
                  Set up the technical details of your phishing simulation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Link-Based Phishing Configuration</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure settings for campaigns that use malicious links to direct users to phishing pages.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-sm mb-1">Landing Page Selection</h5>
                          <p className="text-xs text-muted-foreground">
                            Choose an existing phishing page or create a new one that targets will see when they click the email link.
                          </p>
                          <div className="mt-2 p-2 bg-muted rounded text-xs">
                            <strong>Required:</strong> Select a landing page that matches your campaign objectives
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-sm mb-1">Custom Domain (Optional)</h5>
                          <p className="text-xs text-muted-foreground">
                            Use a custom domain for more realistic phishing URLs. Requires domain verification first.
                          </p>
                          <div className="mt-2 p-2 bg-muted rounded text-xs">
                            <strong>Benefit:</strong> URLs like "company-update.yourdomain.com" vs "random-id.supabase.co"
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">File Attachment Phishing Configuration</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure settings for campaigns that use file attachments to test user behavior.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-sm mb-1">File Type Selection</h5>
                          <p className="text-xs text-muted-foreground">
                            Choose the type of file attachment that matches your testing scenario.
                          </p>
                          <div className="mt-2 space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>PDF Document</span>
                              <Badge variant="outline" className="text-xs">Most Common</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Word Document</span>
                              <Badge variant="outline" className="text-xs">Business Docs</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Excel Spreadsheet</span>
                              <Badge variant="outline" className="text-xs">Financial Data</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>ZIP Archive</span>
                              <Badge variant="outline" className="text-xs">Compressed Files</Badge>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium text-sm mb-1">File Name Strategy</h5>
                          <p className="text-xs text-muted-foreground">
                            Create believable filenames that match the file type and scenario.
                          </p>
                          <div className="mt-2 space-y-1 text-xs">
                            <div className="p-2 bg-muted rounded">
                              <strong>Good:</strong> "Q4_Sales_Report_2024.pdf"
                            </div>
                            <div className="p-2 bg-muted rounded">
                              <strong>Avoid:</strong> "important_document.pdf"
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-sm mb-1">File Type Effectiveness</h5>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span>Invoice/Financial Documents</span>
                              <Badge className="text-xs">High Success</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>HR Policy Updates</span>
                              <Badge variant="secondary" className="text-xs">Medium Success</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>IT Security Alerts</span>
                              <Badge variant="outline" className="text-xs">Variable Success</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Step 3: Select Content & Targets
                </CardTitle>
                <CardDescription>
                  Choose your email template and target audience for the campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Email Template Selection</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Choose from your existing templates or use AI generation for new content.
                      </p>

                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Template Categories</h5>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>• Credential Harvesting (Login pages, account verification)</div>
                            <div>• Social Engineering (Urgency, authority, familiarity)</div>
                            <div>• Malware Delivery (Invoice attachments, document updates)</div>
                            <div>• Business Communications (HR updates, IT notifications)</div>
                          </div>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Template Quality Indicators</h5>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>High open rates in previous tests</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>Mobile-responsive design</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>Matches current threat landscape</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Target List Configuration</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Select the group of users who will receive your phishing simulation.
                      </p>

                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Target List Requirements</h5>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>• Minimum 5 email addresses</div>
                            <div>• Valid email format for all recipients</div>
                            <div>• No duplicate emails in the list</div>
                            <div>• Consider email provider limits</div>
                          </div>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Target Segmentation</h5>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>• Department-based targeting (IT, Finance, HR)</div>
                            <div>• Role-based selection (Executives, Managers, Staff)</div>
                            <div>• Risk-based grouping (Previous failures, training status)</div>
                            <div>• Geographic or location-based targeting</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> Ensure all target email addresses are valid and that recipients expect to receive security testing. Always include an unsubscribe option and respect user preferences.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Step 4: Campaign Scheduling
                </CardTitle>
                <CardDescription>
                  Configure when and how long your campaign should run
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Scheduling Options</h4>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Immediate Launch</h5>
                          <p className="text-xs text-muted-foreground">
                            Send emails immediately after campaign creation. Best for time-sensitive testing or small groups.
                          </p>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Scheduled Launch</h5>
                          <p className="text-xs text-muted-foreground">
                            Schedule emails to be sent at a specific date and time. Allows for coordinated timing across time zones.
                          </p>
                          <div className="mt-2 p-2 bg-muted rounded text-xs">
                            <strong>Note:</strong> Minimum 5-minute delay from creation time
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Campaign Duration</h4>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Duration Settings</h5>
                          <p className="text-xs text-muted-foreground">
                            Set how long the campaign should remain active for collecting responses.
                          </p>
                          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                            <div>• Short campaigns (1-3 days): Urgent scenarios</div>
                            <div>• Medium campaigns (1 week): Standard testing</div>
                            <div>• Long campaigns (2-4 weeks): Comprehensive assessment</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Scheduling Best Practices:</strong> Consider business hours, time zones, and employee availability. Avoid scheduling during holidays, weekends, or known busy periods unless specifically testing those scenarios.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="launch" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Step 5: Launch Your Campaign
                </CardTitle>
                <CardDescription>
                  Final checks and campaign activation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Pre-Launch Checklist</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Verify All Components</p>
                          <p className="text-xs text-muted-foreground">Ensure email template, target list, and landing page/file are properly configured</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Test Email Deliverability</p>
                          <p className="text-xs text-muted-foreground">Send test emails to yourself to verify formatting and links work correctly</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Review Target List</p>
                          <p className="text-xs text-muted-foreground">Double-check that all target email addresses are correct and current</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Check Scheduling</p>
                          <p className="text-xs text-muted-foreground">Confirm timing and duration settings are appropriate for your audience</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Campaign Launch Process</h4>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">Campaign Creation</p>
                        <p className="text-blue-700 dark:text-blue-300 text-xs">
                          All campaign settings are saved and validated. The system prepares the email queue.
                        </p>
                      </div>

                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="font-medium text-green-800 dark:text-green-200 mb-1">Email Processing</p>
                        <p className="text-green-700 dark:text-green-300 text-xs">
                          Emails are personalized for each recipient using template variables and queued for delivery.
                        </p>
                      </div>

                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="font-medium text-purple-800 dark:text-purple-200 mb-1">Real-Time Tracking</p>
                        <p className="text-purple-700 dark:text-purple-300 text-xs">
                          Campaign becomes active in analytics dashboard with live tracking of all interactions.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> Once launched, campaigns cannot be easily stopped or modified. Ensure all settings are correct before clicking "Create Campaign". You can monitor progress in real-time through the analytics dashboard.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Common Issues & Solutions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Common Issues & Solutions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">❌ Campaign Creation Fails</h4>
              <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
                <p><strong>Common Causes:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Missing required components (template, target list, landing page)</li>
                  <li>Invalid email addresses in target list</li>
                  <li>Template contains broken personalization variables</li>
                  <li>Insufficient permissions for campaign creation</li>
                </ul>
                <p><strong>Solutions:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Verify all required fields are completed</li>
                  <li>Test template with sample data before using</li>
                  <li>Check target list for formatting issues</li>
                  <li>Contact administrator if permission issues persist</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border border-amber-200 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">⚠️ Low Email Deliverability</h4>
              <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                <p><strong>Common Causes:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Email content triggers spam filters</li>
                  <li>Sender reputation issues</li>
                  <li>Recipient email provider blocking</li>
                  <li>Large attachment sizes</li>
                </ul>
                <p><strong>Solutions:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Test emails to multiple providers before launch</li>
                  <li>Use realistic sender names and subjects</li>
                  <li>Keep file attachments under 5MB</li>
                  <li>Monitor bounce rates and adjust accordingly</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">ℹ️ Campaign Not Appearing in Analytics</h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <p><strong>Common Causes:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Campaign is still in "draft" status</li>
                  <li>Scheduled campaign hasn't started yet</li>
                  <li>Recipients haven't opened emails yet</li>
                  <li>Analytics dashboard needs refresh</li>
                </ul>
                <p><strong>Solutions:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check campaign status in campaign list</li>
                  <li>Verify scheduled time if applicable</li>
                  <li>Wait for email delivery and opens</li>
                  <li>Refresh analytics dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Campaign Creation Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-green-800 dark:text-green-200">Planning & Preparation</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Start with clear testing objectives</li>
                <li>• Choose appropriate campaign type for your goals</li>
                <li>• Test all components before full launch</li>
                <li>• Plan follow-up training based on results</li>
                <li>• Consider timing and business impact</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-green-800 dark:text-green-200">Execution & Monitoring</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Monitor campaign progress in real-time</li>
                <li>• Be prepared to stop if issues arise</li>
                <li>• Document lessons learned for future campaigns</li>
                <li>• Provide immediate feedback to participants</li>
                <li>• Follow up with targeted training for failures</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
