import React from "react";
import { Mail, Sparkles, Copy, Eye, Bot, Settings, FileText, Target, AlertTriangle, CheckCircle, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const EmailTemplatesContent: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Mail className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Email Templates</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Create compelling phishing emails using AI-powered generation and template customization. Build realistic scenarios that effectively test user awareness.
        </p>
      </div>

      {/* Template Discovery & Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Template Discovery & Selection
          </CardTitle>
          <CardDescription>
            Access your template library and understand the available options for different phishing scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">AI-Generated Templates</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Process:</strong> AI analyzes current threat patterns and generates realistic phishing emails</p>
                <p><strong>Benefits:</strong> Always current with latest attack techniques and trends</p>
                <p><strong>Customization:</strong> Brand-specific content with personalization variables</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Generation Inputs:</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Target Company</Badge>
                  <Badge variant="outline" className="text-xs">Industry Type</Badge>
                  <Badge variant="outline" className="text-xs">Attack Scenario</Badge>
                  <Badge variant="outline" className="text-xs">Urgency Level</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Template Library</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Source:</strong> Pre-built templates based on proven phishing campaigns</p>
                <p><strong>Categories:</strong> Organized by attack type and business scenario</p>
                <p><strong>Testing:</strong> Templates validated for effectiveness and deliverability</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Template Categories:</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">Credential Harvesting</Badge>
                  <Badge variant="outline" className="text-xs">Social Engineering</Badge>
                  <Badge variant="outline" className="text-xs">Malware Delivery</Badge>
                  <Badge variant="outline" className="text-xs">Business Communications</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Template Generation Process */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">AI Template Generation Workflow</h2>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="setup">Setup Parameters</TabsTrigger>
            <TabsTrigger value="generation">Generation Process</TabsTrigger>
            <TabsTrigger value="customization">Customization</TabsTrigger>
            <TabsTrigger value="testing">Testing & Preview</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Step 1: Configure Generation Parameters
                </CardTitle>
                <CardDescription>
                  Set up the AI generation parameters to create targeted, realistic phishing emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Target Company Information</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Provide details about the organization you're targeting to ensure realistic content.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="p-2 bg-muted rounded">
                          <strong>Required:</strong> Company name for brand-specific content
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <strong>Optional:</strong> Industry type for contextual relevance
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <strong>Optional:</strong> Company size for appropriate tone
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Campaign Scenario</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Select the type of phishing attack scenario you want to simulate.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="space-y-1">
                          <p className="font-medium">Common Scenarios:</p>
                          <ul className="text-muted-foreground space-y-1">
                            <li>• Credential harvesting (login pages, account verification)</li>
                            <li>• Financial requests (invoice payments, expense reports)</li>
                            <li>• IT support issues (password resets, system updates)</li>
                            <li>• HR communications (policy updates, training notifications)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Content Parameters</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Fine-tune the email content characteristics for maximum effectiveness.
                      </p>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Urgency Level</h5>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>• Low: Routine communications</div>
                            <div>• Medium: Time-sensitive but not critical</div>
                            <div>• High: Immediate action required</div>
                          </div>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Technical Complexity</h5>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>• Basic: Simple language, clear instructions</div>
                            <div>• Intermediate: Some technical terms</div>
                            <div>• Advanced: Complex scenarios, detailed instructions</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Personalization Options</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Enable dynamic content insertion using recipient data.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="p-2 bg-muted rounded">
                          <strong>Available Variables:</strong> firstName, lastName, department, position, companyName
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <strong>Example:</strong> "Hello [firstName], your [companyName] account requires verification"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Generation Tip:</strong> More specific inputs produce better results. Include industry context, company size, and specific scenarios for the most realistic email content.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Step 2: AI Generation Process
                </CardTitle>
                <CardDescription>
                  Watch the AI create realistic phishing email content based on your parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Generation Timeline</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Content Analysis (5-10 seconds)</p>
                          <p className="text-xs text-muted-foreground">AI analyzes current threat patterns and your parameters</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Template Creation (10-15 seconds)</p>
                          <p className="text-xs text-muted-foreground">AI generates email content, subject line, and sender information</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Personalization Integration (5 seconds)</p>
                          <p className="text-xs text-muted-foreground">Variables are integrated and content is formatted</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Quality Validation (5 seconds)</p>
                          <p className="text-xs text-muted-foreground">Template is checked for realism and effectiveness</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">What AI Generates</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm mb-2">Email Components</h5>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>• Subject line optimized for opens</div>
                          <div>• Realistic sender name and address</div>
                          <div>• Compelling email body content</div>
                          <div>• Strategic call-to-action placement</div>
                          <div>• Mobile-responsive formatting</div>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm mb-2">Content Intelligence</h5>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>• Current event integration</div>
                          <div>• Industry-specific terminology</div>
                          <div>• Psychological trigger placement</div>
                          <div>• Trust indicator inclusion</div>
                          <div>• Urgency optimization</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Generation Quality:</strong> AI templates are designed to achieve high open rates and click-through rates by mimicking real phishing attacks. Each template is validated against current threat intelligence.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Step 3: Template Customization
                </CardTitle>
                <CardDescription>
                  Fine-tune the generated template to match your specific requirements and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Content Personalization</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Use dynamic variables to personalize emails for each recipient.
                      </p>

                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Available Variables</h5>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <code className="bg-muted px-1 rounded">{"{{firstName}}"}</code>
                              <span className="text-muted-foreground">Recipient's first name</span>
                            </div>
                            <div className="flex justify-between">
                              <code className="bg-muted px-1 rounded">{"{{lastName}}"}</code>
                              <span className="text-muted-foreground">Recipient's last name</span>
                            </div>
                            <div className="flex justify-between">
                              <code className="bg-muted px-1 rounded">{"{{department}}"}</code>
                              <span className="text-muted-foreground">Department name</span>
                            </div>
                            <div className="flex justify-between">
                              <code className="bg-muted px-1 rounded">{"{{companyName}}"}</code>
                              <span className="text-muted-foreground">Company name</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Usage Example</h5>
                          <div className="bg-muted p-2 rounded text-xs font-mono">
                            <div>Subject: {"{{firstName}}"}, Action Required for {"{{companyName}}"} Account</div>
                            <div>Body: Hello {"{{firstName}}"}, your {"{{department}}"} team requires immediate attention...</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Visual Customization</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Modify visual elements to match your organization's communication style.
                      </p>

                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Email Styling</h5>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>• Company logo integration</div>
                            <div>• Brand color scheme matching</div>
                            <div>• Font style consistency</div>
                            <div>• Email signature customization</div>
                          </div>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Content Structure</h5>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>• Header/footer customization</div>
                            <div>• Button styling and placement</div>
                            <div>• Link appearance optimization</div>
                            <div>• Mobile responsiveness</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Customization Tip:</strong> Balance realism with your testing objectives. Over-customization can make emails obvious, while under-customization reduces effectiveness. Test different variations to find the optimal balance.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Step 4: Testing & Preview
                </CardTitle>
                <CardDescription>
                  Validate your template before adding it to your campaign library
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Preview Options</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Test how your template appears across different email clients and devices.
                      </p>

                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Desktop Preview</h5>
                          <p className="text-xs text-muted-foreground">
                            View how the email appears in desktop email clients like Outlook, Gmail, and Apple Mail.
                          </p>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Mobile Preview</h5>
                          <p className="text-xs text-muted-foreground">
                            Check mobile responsiveness and formatting on smartphones and tablets.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Variable Testing</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Test personalization variables with sample recipient data.
                      </p>
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm mb-2">Sample Data Testing</h5>
                        <div className="space-y-1 text-xs">
                          <div><strong>Test Recipient:</strong> John Smith, IT Department, TechCorp Inc.</div>
                          <div><strong>Result:</strong> "Hello John, your TechCorp Inc. IT department requires immediate attention..."</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Deliverability Testing</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Ensure your template won't be flagged as spam by email providers.
                      </p>

                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Spam Filter Checks</h5>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>• Subject line spam trigger analysis</div>
                            <div>• Content keyword scanning</div>
                            <div>• Link and attachment safety checks</div>
                            <div>• Sender reputation verification</div>
                          </div>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <h5 className="font-medium text-sm mb-1">Test Sending</h5>
                          <p className="text-xs text-muted-foreground">
                            Send test emails to yourself and colleagues across different email providers to verify delivery and appearance.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Effectiveness Scoring</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Evaluate template quality based on engagement potential.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span>Open Rate Potential</span>
                          <Badge variant="outline">High/Medium/Low</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Click-Through Potential</span>
                          <Badge variant="outline">High/Medium/Low</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Spam Risk</span>
                          <Badge variant="outline">Low/Medium/High</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Testing Best Practice:</strong> Always send test emails to multiple email providers (Gmail, Outlook, Yahoo) and devices before using templates in production campaigns. This ensures consistent appearance and delivery.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Step 5: Deploy to Template Library
                </CardTitle>
                <CardDescription>
                  Save your customized template for use in future campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Template Saving Process</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Template Validation</p>
                          <p className="text-xs text-muted-foreground">Final checks for formatting, links, and personalization variables</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Category Assignment</p>
                          <p className="text-xs text-muted-foreground">Automatic categorization based on content analysis</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Library Integration</p>
                          <p className="text-xs text-muted-foreground">Template added to your personal library for future use</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Template Management</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm mb-2">Organization Features</h5>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>• Template naming and description</div>
                          <div>• Category-based organization</div>
                          <div>• Usage tracking and analytics</div>
                          <div>• Version history and updates</div>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm mb-2">Collaboration Tools</h5>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>• Share templates with team members</div>
                          <div>• Template usage permissions</div>
                          <div>• Performance analytics sharing</div>
                          <div>• Best practice documentation</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Template Lifecycle:</strong> Monitor template performance over time. High-performing templates can be reused, while low-performing ones should be updated or replaced. Track metrics like open rates, click-through rates, and conversion rates to optimize your template library.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Template Categories & Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Template Categories & Effectiveness</CardTitle>
          <CardDescription>
            Understanding different phishing scenarios and their typical success rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-500" />
                <h4 className="font-medium">Credential Harvesting</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Login pages and account verification scenarios</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Success Rate</span>
                  <Badge className="text-xs">High (25-40%)</Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>• Office 365 login requests</div>
                  <div>• Email account verification</div>
                  <div>• Banking credential updates</div>
                  <div>• Corporate portal access</div>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-500" />
                <h4 className="font-medium">Social Engineering</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Authority and urgency-based attacks</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Success Rate</span>
                  <Badge variant="secondary" className="text-xs">Medium (15-25%)</Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>• CEO fraud requests</div>
                  <div>• IT support emergencies</div>
                  <div>• HR policy updates</div>
                  <div>• Executive communications</div>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-orange-500" />
                <h4 className="font-medium">Malware Delivery</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Document and attachment-based attacks</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Success Rate</span>
                  <Badge variant="outline" className="text-xs">Variable (10-30%)</Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>• Invoice attachments</div>
                  <div>• Document sharing requests</div>
                  <div>• Update notifications</div>
                  <div>• Contract reviews</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Issues & Solutions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Template Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">❌ AI Generation Fails</h4>
              <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
                <p><strong>Common Causes:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Incomplete or invalid input parameters</li>
                  <li>Network connectivity issues</li>
                  <li>AI service temporarily unavailable</li>
                  <li>Input contains restricted content</li>
                </ul>
                <p><strong>Solutions:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Verify all required fields are completed</li>
                  <li>Check internet connection and try again</li>
                  <li>Wait a few minutes and retry</li>
                  <li>Use alternative phrasing if content is restricted</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border border-amber-200 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">⚠️ Personalization Variables Not Working</h4>
              <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                <p><strong>Common Causes:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Incorrect variable syntax (missing curly braces)</li>
                  <li>Variable names don't match recipient data</li>
                  <li>Recipient data missing required fields</li>
                  <li>Template not properly saved after editing</li>
                </ul>
                <p><strong>Solutions:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use exact variable names: {"{{firstName}}"}, {"{{companyName}}"}</li>
                  <li>Ensure recipient data includes required fields</li>
                  <li>Test with sample recipient data</li>
                  <li>Save template after making changes</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">ℹ️ Template Not Appearing in Campaigns</h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <p><strong>Common Causes:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Template not saved to library</li>
                  <li>Template in draft status</li>
                  <li>Generation still in progress</li>
                  <li>Template failed validation</li>
                </ul>
                <p><strong>Solutions:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Complete the full generation and save process</li>
                  <li>Check template status in library</li>
                  <li>Wait for generation to complete</li>
                  <li>Review and fix any validation errors</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices Summary */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            Email Template Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-purple-800 dark:text-purple-200">Content Strategy</h4>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                <li>• Use realistic sender names and subjects</li>
                <li>• Include subtle urgency without being alarming</li>
                <li>• Match company communication patterns</li>
                <li>• Test across multiple email clients</li>
                <li>• Balance personalization with realism</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-purple-800 dark:text-purple-200">Technical Optimization</h4>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                <li>• Optimize for mobile email clients</li>
                <li>• Keep file sizes reasonable</li>
                <li>• Use proper HTML email formatting</li>
                <li>• Include alt text for images</li>
                <li>• Test deliverability before full deployment</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
