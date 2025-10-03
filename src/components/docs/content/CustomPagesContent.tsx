import React from "react";
import { Palette, Code, Smartphone, Monitor, CheckCircle, AlertTriangle, MousePointer, Layers, Zap, Eye, Settings, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const CustomPagesContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Palette className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Custom Pages</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Build custom phishing pages from scratch using our intuitive drag-and-drop visual editor
          or advanced code editor. Create highly targeted, professional-looking pages that perfectly
          match your security testing objectives.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Page Builder Options
          </CardTitle>
          <CardDescription>
            Choose between visual drag-and-drop editing or full code control based on your needs and technical expertise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Palette className="h-6 w-6 text-primary" />
                <h4 className="font-medium">Visual Editor</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Drag-and-drop interface perfect for quick page creation without coding knowledge. Ideal for marketers and non-technical users.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Pre-built component library</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Real-time preview</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>No coding required</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                <strong>Best for:</strong> Simple forms, basic layouts, quick prototypes
              </div>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Code className="h-6 w-6 text-primary" />
                <h4 className="font-medium">Code Editor</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Full HTML/CSS/JavaScript control for advanced users who need complete customization and complex functionality.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Syntax highlighting</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Live preview</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Custom scripting</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                <strong>Best for:</strong> Complex layouts, custom interactions, advanced styling
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Page Templates & Examples
            </CardTitle>
            <CardDescription>
              Pre-built templates organized by phishing scenario and success rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  name: "Microsoft 365 Login Portal",
                  type: "Credential Harvesting",
                  components: "Email input, password field, company branding, SSL indicators",
                  success: "High (35-45%)",
                  useCase: "Test employee familiarity with corporate login procedures"
                },
                {
                  name: "HR Policy Update Notice",
                  type: "Document Access",
                  components: "Official header, policy document preview, download button, urgency messaging",
                  success: "Medium (25-35%)",
                  useCase: "Evaluate response to internal policy communications"
                },
                {
                  name: "Bank Account Verification",
                  type: "Financial Phishing",
                  components: "Bank logo, account details form, security badges, multi-step verification",
                  success: "High (30-40%)",
                  useCase: "Assess handling of financial account security alerts"
                },
                {
                  name: "IT Security Alert",
                  type: "Technical Support",
                  components: "Warning icons, system status indicators, action buttons, technical details",
                  success: "Medium (20-30%)",
                  useCase: "Test response to IT security notifications and requests"
                },
                {
                  name: "Remote Work Authorization",
                  type: "Access Control",
                  components: "Company portal interface, employee verification form, access approval workflow",
                  success: "High (35-45%)",
                  useCase: "Evaluate remote access security awareness"
                },
                {
                  name: "Vendor Invoice Processing",
                  type: "Business Process",
                  components: "Invoice preview, approval form, payment details, document attachments",
                  success: "Medium (25-35%)",
                  useCase: "Test financial process security and vendor verification"
                }
              ].map((template, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <Badge variant="outline" className="text-xs mt-1">{template.type}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {template.success}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{template.components}</p>
                  <p className="text-xs text-muted-foreground italic">{template.useCase}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Responsive Design Features
            </CardTitle>
            <CardDescription>
              All custom pages automatically adapt to different screen sizes and devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <Monitor className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium">Desktop</div>
                  <div className="text-xs text-muted-foreground">1200×800+</div>
                </div>
                <div className="text-center">
                  <Settings className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium">Tablet</div>
                  <div className="text-xs text-muted-foreground">768×1024</div>
                </div>
                <div className="text-center">
                  <Smartphone className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium">Mobile</div>
                  <div className="text-xs text-muted-foreground">375×667</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h5 className="font-medium text-xs">Mobile Optimization</h5>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Touch-friendly buttons</li>
                    <li>• Readable text sizes</li>
                    <li>• Optimized form layouts</li>
                    <li>• Fast loading times</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-xs">Testing Tools</h5>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Device simulation</li>
                    <li>• Network throttling</li>
                    <li>• Touch gesture testing</li>
                    <li>• Performance monitoring</li>
                  </ul>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Responsive Testing Checklist:</p>
                <p>• Verify layout integrity across all screen sizes</p>
                <p>• Test form functionality on mobile devices</p>
                <p>• Check image and media scaling</p>
                <p>• Validate touch interaction points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Advanced Features & Capabilities
          </CardTitle>
          <CardDescription>
            Professional-grade tools for creating sophisticated, realistic phishing pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <MousePointer className="h-4 w-4 text-blue-500" />
                Interactive Elements
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Form Validation:</strong> Real-time input validation and error handling</li>
                <li>• <strong>Progress Indicators:</strong> Multi-step form progress tracking</li>
                <li>• <strong>Modal Dialogs:</strong> Popup windows for additional information</li>
                <li>• <strong>Countdown Timers:</strong> Urgency creation with visual timers</li>
                <li>• <strong>Hover Effects:</strong> Interactive button and link animations</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Eye className="h-4 w-4 text-green-500" />
                Tracking & Analytics
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Click Tracking:</strong> Monitor all user interactions and navigation</li>
                <li>• <strong>Form Analytics:</strong> Track form abandonment and completion rates</li>
                <li>• <strong>Time on Page:</strong> Measure user engagement and attention span</li>
                <li>• <strong>Device Detection:</strong> Identify desktop, mobile, and tablet usage</li>
                <li>• <strong>Geographic Tracking:</strong> Location-based behavior analysis</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Settings className="h-4 w-4 text-purple-500" />
                Security & Performance
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>SSL Certificates:</strong> Automatic HTTPS encryption for all pages</li>
                <li>• <strong>Domain Masking:</strong> Custom domain support for authenticity</li>
                <li>• <strong>Access Controls:</strong> Password protection and IP restrictions</li>
                <li>• <strong>Data Encryption:</strong> Secure handling of captured information</li>
                <li>• <strong>Performance Optimization:</strong> Fast loading and responsive design</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h5 className="font-medium mb-2">Custom Integration Options</h5>
            <p className="text-sm text-muted-foreground">
              Connect your custom pages with external services and APIs for enhanced functionality.
              Support for webhook integrations, database connections, and third-party service authentication.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Troubleshooting & Common Issues
          </CardTitle>
          <CardDescription>
            Solutions to frequently encountered problems when creating custom pages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50/50 dark:bg-red-900/20">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Visual Editor Not Loading
                </h4>
                <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
                  <p><strong>Common Causes:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Browser compatibility issues</li>
                    <li>JavaScript disabled or blocked</li>
                    <li>Slow internet connection</li>
                    <li>Large page complexity</li>
                  </ul>
                  <p><strong>Solutions:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Try a different modern browser</li>
                    <li>Enable JavaScript in browser settings</li>
                    <li>Check internet connection speed</li>
                    <li>Simplify page layout and reduce components</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 border border-amber-200 rounded-lg bg-amber-50/50 dark:bg-amber-900/20">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Code Editor Syntax Errors
                </h4>
                <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                  <p><strong>Common Causes:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Missing closing tags or brackets</li>
                    <li>Incorrect HTML/CSS/JS syntax</li>
                    <li>Conflicting style declarations</li>
                    <li>JavaScript errors preventing preview</li>
                  </ul>
                  <p><strong>Solutions:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use the syntax checker tools</li>
                    <li>Validate HTML structure first</li>
                    <li>Check browser console for errors</li>
                    <li>Test code in small sections</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/50 dark:bg-blue-900/20">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Mobile Responsiveness Issues
                </h4>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <p><strong>Common Causes:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Fixed width elements not adapting</li>
                    <li>Small text sizes on mobile</li>
                    <li>Touch targets too small</li>
                    <li>Horizontal scrolling required</li>
                  </ul>
                  <p><strong>Solutions:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use responsive design tools</li>
                    <li>Test on actual mobile devices</li>
                    <li>Increase button and link sizes</li>
                    <li>Use relative units (%, em, rem)</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 border border-purple-200 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Performance & Loading Issues
                </h4>
                <div className="text-sm text-purple-700 dark:text-purple-300 space-y-2">
                  <p><strong>Common Causes:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Large images or media files</li>
                    <li>Excessive JavaScript execution</li>
                    <li>Too many external dependencies</li>
                    <li>Complex animations or effects</li>
                  </ul>
                  <p><strong>Solutions:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Optimize image file sizes</li>
                    <li>Minimize JavaScript usage</li>
                    <li>Use CDN for external resources</li>
                    <li>Remove unnecessary animations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Need Help?</strong> For complex custom pages or advanced functionality, consider starting with simpler templates and gradually adding complexity. Our support team can provide guidance for sophisticated implementations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
