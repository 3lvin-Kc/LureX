
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Book, MessageCircle, Mail, Phone, FileText, Shield, Users, Target } from "lucide-react";

const Help = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground">Get help with LureX platform features and functionality</p>
        </div>

        <Tabs defaultValue="getting-started" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Create Your First Campaign
                  </CardTitle>
                  <CardDescription>Step-by-step guide to setting up phishing simulations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">1. Create Target Lists</h4>
                    <p className="text-sm text-muted-foreground">Import or manually add email addresses of users to test</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">2. Design Email Templates</h4>
                    <p className="text-sm text-muted-foreground">Create realistic phishing emails or use AI generation</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">3. Set Up Phishing Pages</h4>
                    <p className="text-sm text-muted-foreground">Create fake login pages to capture interactions</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">4. Launch Campaign</h4>
                    <p className="text-sm text-muted-foreground">Schedule and monitor your phishing simulation</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Best Practices
                  </CardTitle>
                  <CardDescription>Important guidelines for responsible testing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Authorization Required</h4>
                    <p className="text-sm text-muted-foreground">Only test users you have explicit permission to simulate</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Educational Purpose</h4>
                    <p className="text-sm text-muted-foreground">Use results to improve security awareness training</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Data Protection</h4>
                    <p className="text-sm text-muted-foreground">Handle all captured data according to privacy regulations</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• AI-powered template generation</li>
                    <li>• HTML and text content support</li>
                    <li>• Category-based organization</li>
                    <li>• Version control and editing</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Target Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• CSV import/export</li>
                    <li>• Custom field support</li>
                    <li>• Department organization</li>
                    <li>• Bulk operations</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Reporting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Real-time analytics</li>
                    <li>• PDF/CSV export</li>
                    <li>• Department breakdowns</li>
                    <li>• Trend analysis</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How do I create my first phishing campaign?</AccordionTrigger>
                    <AccordionContent>
                      Start by creating a target list, then design an email template, set up a phishing page if needed, and finally create and launch your campaign from the Campaigns section.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Can I use AI to generate email templates?</AccordionTrigger>
                    <AccordionContent>
                      Yes! Use the "Generate with AI" button in the template editor. Select a category first, and AI will create professional phishing simulation content (LureX AI is still in experimental version so it may not be working as expected)
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>How do I track email opens and clicks?</AccordionTrigger>
                    <AccordionContent>
                      Email tracking is automatically enabled. Open tracking uses invisible pixels, and click tracking redirects through our servers to log interactions before forwarding to the intended destination.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>Is my data secure?</AccordionTrigger>
                    <AccordionContent>
                      Yes, all data is encrypted and stored securely. We use industry-standard security practices and comply with data protection regulations.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Support Channels
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">support@phishguard.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Live chat available 9AM-5PM EST</span>
                  </div>
                </CardContent>
              </Card>

              {/*<Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="h-5 w-5" />
                    Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Documentation
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Community Forum
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Book className="h-4 w-4 mr-2" />
                    Video Tutorials
                  </Button>
                </CardContent>
              </Card>*/}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Help;
