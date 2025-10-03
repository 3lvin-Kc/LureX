import React from "react";
import { Globe, Copy, Download, Eye, CheckCircle, AlertTriangle, Wifi, Shield, Smartphone, Monitor } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const WebsiteCloneContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Globe className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Website Clone</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Create pixel-perfect replicas of legitimate websites for realistic phishing simulations
          using our advanced cloning technology. Perfect for testing employee awareness against
          sophisticated social engineering attacks.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            How Website Cloning Works
          </CardTitle>
          <CardDescription>
            Our automated system extracts, processes, and deploys website clones in minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">1. Enter Target URL</h4>
              <p className="text-sm text-muted-foreground">
                Provide the complete URL of the website you want to clone. Our system validates the URL format and checks site accessibility.
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                <strong>Requirements:</strong> Valid HTTP/HTTPS URL, publicly accessible site
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">2. Automated Extraction</h4>
              <p className="text-sm text-muted-foreground">
                AI-powered system extracts HTML structure, CSS styles, JavaScript functionality, and all associated assets from the target site.
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                <strong>Extracts:</strong> HTML, CSS, JS, images, fonts, and external dependencies
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Copy className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">3. Deploy & Test</h4>
              <p className="text-sm text-muted-foreground">
                Clone is hosted on secure servers with automatic SSL certificates and tracking scripts for comprehensive user behavior analysis.
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                <strong>Includes:</strong> Mobile responsiveness, form tracking, click monitoring
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Popular Clone Targets
            </CardTitle>
            <CardDescription>
              Most commonly cloned websites for phishing simulations, organized by category and difficulty
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  name: "Microsoft 365 Login",
                  category: "Corporate Productivity",
                  difficulty: "Easy",
                  description: "Office 365 and Azure login pages - very familiar to most employees",
                  success: "High (35-45%)"
                },
                {
                  name: "Gmail Sign-in",
                  category: "Email Services",
                  difficulty: "Easy",
                  description: "Google's email platform - widely used across all industries",
                  success: "High (30-40%)"
                },
                {
                  name: "Bank of America",
                  category: "Financial Services",
                  difficulty: "Hard",
                  description: "Complex banking interface with advanced security features",
                  success: "Medium (20-30%)"
                },
                {
                  name: "LinkedIn Login",
                  category: "Professional Network",
                  difficulty: "Medium",
                  description: "Business social platform - common for recruitment phishing",
                  success: "Medium (25-35%)"
                },
                {
                  name: "Dropbox Business",
                  category: "Cloud Storage",
                  difficulty: "Medium",
                  description: "File sharing platform popular in enterprise environments",
                  success: "Medium (25-35%)"
                },
                {
                  name: "SharePoint Portal",
                  category: "Corporate Intranet",
                  difficulty: "Easy",
                  description: "Internal company portals - highly trusted by employees",
                  success: "Very High (40-50%)"
                }
              ].map((target, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{target.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{target.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{target.category}</Badge>
                      <span className="text-xs text-muted-foreground">Success: {target.success}</span>
                    </div>
                  </div>
                  <Badge
                    variant={target.difficulty === 'Easy' ? 'secondary' : target.difficulty === 'Medium' ? 'default' : 'destructive'}
                    className="text-xs ml-2"
                  >
                    {target.difficulty}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Clone Features & Capabilities
            </CardTitle>
            <CardDescription>
              What our cloning system captures and enhances for maximum effectiveness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Automatic Enhancements
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• <strong>Tracking Integration:</strong> Automatic click, form, and behavior tracking</li>
                  <li>• <strong>Mobile Responsive:</strong> Ensures compatibility across all devices</li>
                  <li>• <strong>SSL Security:</strong> Automatic certificate provisioning for HTTPS</li>
                  <li>• <strong>Form Capture:</strong> All form submissions and data entry tracking</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-blue-500" />
                  Technical Processing
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• <strong>Asset Optimization:</strong> Images, fonts, and resources are optimized</li>
                  <li>• <strong>URL Normalization:</strong> Relative URLs converted to absolute paths</li>
                  <li>• <strong>Dependency Resolution:</strong> External CSS/JS dependencies are inlined</li>
                  <li>• <strong>Content Sanitization:</strong> Removes potentially problematic scripts</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-purple-500" />
                  Quality Assurance
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• <strong>Visual Fidelity:</strong> Maintains original design and branding</li>
                  <li>• <strong>Functionality Testing:</strong> Forms and interactive elements verified</li>
                  <li>• <strong>Performance Monitoring:</strong> Load times and responsiveness checked</li>
                  <li>• <strong>Cross-Browser Testing:</strong> Compatible with major browsers</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Troubleshooting Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Troubleshooting & Common Issues
          </CardTitle>
          <CardDescription>
            Solutions to common problems encountered during website cloning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50/50 dark:bg-red-900/20">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Clone Fails to Generate
                </h4>
                <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
                  <p><strong>Common Causes:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Invalid or unreachable URL</li>
                    <li>Website requires authentication/login</li>
                    <li>Site blocks automated access</li>
                    <li>Network connectivity issues</li>
                  </ul>
                  <p><strong>Solutions:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Verify URL is accessible in browser</li>
                    <li>Check for login requirements or CAPTCHA</li>
                    <li>Try a different target website</li>
                    <li>Contact support if issue persists</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 border border-amber-200 rounded-lg bg-amber-50/50 dark:bg-amber-900/20">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Missing Assets or Broken Layout
                </h4>
                <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                  <p><strong>Common Causes:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>External resources blocked or restricted</li>
                    <li>Dynamic content loading via JavaScript</li>
                    <li>Complex single-page applications</li>
                    <li>Anti-bot protection measures</li>
                  </ul>
                  <p><strong>Solutions:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Test simpler, static websites first</li>
                    <li>Check browser console for errors</li>
                    <li>Consider using custom pages for complex sites</li>
                    <li>Report issues for manual review</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/50 dark:bg-blue-900/20">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Mobile Responsiveness Issues
                </h4>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <p><strong>Common Causes:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Original site not mobile-optimized</li>
                    <li>Complex responsive CSS conflicts</li>
                    <li>Viewport meta tag issues</li>
                    <li>Touch interaction problems</li>
                  </ul>
                  <p><strong>Solutions:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Test on multiple device sizes</li>
                    <li>Check original site responsiveness first</li>
                    <li>Use browser dev tools for testing</li>
                    <li>Consider custom page creation for better mobile experience</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 border border-purple-200 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Performance & Loading Issues
                </h4>
                <div className="text-sm text-purple-700 dark:text-purple-300 space-y-2">
                  <p><strong>Common Causes:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Large images or heavy assets</li>
                    <li>Complex JavaScript frameworks</li>
                    <li>External dependency failures</li>
                    <li>Slow original website performance</li>
                  </ul>
                  <p><strong>Solutions:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Test loading times before cloning</li>
                    <li>Check asset sizes and optimize if needed</li>
                    <li>Monitor network requests in browser</li>
                    <li>Consider optimizing original assets</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Need Help?</strong> If you encounter persistent issues, our support team can manually review and optimize complex website clones. Some highly dynamic or protected sites may require custom handling.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200">Legal & Ethical Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Authorization Required</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Only clone sites for authorized testing</li>
                <li>• Obtain proper permissions</li>
                <li>• Document approval process</li>
                <li>• Respect intellectual property</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Best Practices</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Use for security training only</li>
                <li>• Implement proper disclaimers</li>
                <li>• Secure cloned content</li>
                <li>• Regular cleanup of old clones</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

