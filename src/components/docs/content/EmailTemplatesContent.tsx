import React from "react";
import { Mail, Sparkles, Copy, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
          Create compelling phishing emails using AI-powered templates or customize existing ones 
          to match real-world attack scenarios.
        </p>
      </div>

      {/* Template Types */}
      <Card>
        <CardHeader>
          <CardTitle>Template Categories</CardTitle>
          <CardDescription>Choose from various phishing email types based on common attack vectors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <h4 className="font-medium mb-2">Credential Harvesting</h4>
              <p className="text-sm text-muted-foreground mb-3">Login pages for popular services</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">Office 365</Badge>
                <Badge variant="secondary" className="text-xs">Gmail</Badge>
                <Badge variant="secondary" className="text-xs">Banking</Badge>
              </div>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <h4 className="font-medium mb-2">Social Engineering</h4>
              <p className="text-sm text-muted-foreground mb-3">Urgency and authority-based attacks</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">CEO Fraud</Badge>
                <Badge variant="secondary" className="text-xs">IT Support</Badge>
                <Badge variant="secondary" className="text-xs">HR Updates</Badge>
              </div>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <h4 className="font-medium mb-2">Malware Delivery</h4>
              <p className="text-sm text-muted-foreground mb-3">Attachment and link-based attacks</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">Invoice</Badge>
                <Badge variant="secondary" className="text-xs">Document</Badge>
                <Badge variant="secondary" className="text-xs">Update</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Template Generation */}
      <Card className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span>AI-Powered Template Generation</span>
          </CardTitle>
          <CardDescription>
            Generate realistic phishing emails using advanced AI that analyzes current threat patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">AI Capabilities</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Brand-specific template generation</li>
                  <li>• Current event integration</li>
                  <li>• Language and tone matching</li>
                  <li>• Personalization variables</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Customization Options</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Target company branding</li>
                  <li>• Industry-specific content</li>
                  <li>• Urgency level adjustment</li>
                  <li>• Technical complexity</li>
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-sm font-medium">Try AI Template Generator</span>
              <Button size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Customization */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Template Customization</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Personalization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Dynamic Variables</h4>
                <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                <div>Hello {`{{firstName}}`},</div>
                  <div>Your {`{{companyName}}`} account...</div>
                  <div>Department: {`{{department}}`}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Available Variables</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">firstName</Badge>
                  <Badge variant="outline">lastName</Badge>
                  <Badge variant="outline">email</Badge>
                  <Badge variant="outline">companyName</Badge>
                  <Badge variant="outline">department</Badge>
                  <Badge variant="outline">position</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visual Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Branding Elements</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Company logos and colors</li>
                  <li>• Email signatures</li>
                  <li>• Header and footer styling</li>
                  <li>• Font and layout matching</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Preview Options</h4>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Desktop
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Mobile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Template Library */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Templates</CardTitle>
          <CardDescription>Ready-to-use templates based on real-world phishing campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: "Office 365 Security Alert",
                category: "Credential Harvesting",
                description: "Fake security notification requiring password verification",
                usage: "High"
              },
              {
                name: "IT Department Update",
                category: "Social Engineering", 
                description: "Urgent system maintenance requiring user action",
                usage: "Medium"
              },
              {
                name: "Invoice Payment Request",
                category: "Malware Delivery",
                description: "Fake invoice with malicious attachment",
                usage: "High"
              }
            ].map((template, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                    <Badge variant={template.usage === 'High' ? 'default' : 'outline'} className="text-xs">
                      {template.usage} Usage
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Email Template Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Content Guidelines</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use realistic sender addresses</li>
                <li>• Include subtle urgency cues</li>
                <li>• Match company communication style</li>
                <li>• Test across email clients</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Technical Considerations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Optimize for mobile devices</li>
                <li>• Avoid spam filter triggers</li>
                <li>• Include proper tracking pixels</li>
                <li>• Test deliverability rates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
