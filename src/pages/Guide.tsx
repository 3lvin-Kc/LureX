
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info, Lightbulb, Target, Mail, Shield, BarChart4, Users, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Guide = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-2">Phishing Simulation Guide</h1>
        <p className="text-muted-foreground mb-8">
          Learn how to use our platform effectively for your security testing and training needs.
        </p>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="personal">Personal Use</TabsTrigger>
            <TabsTrigger value="enterprise">Enterprise Use</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <CardTitle>Disclaimer for Personal Use</CardTitle>
                </div>
                <CardDescription>
                  Important information before you begin using this tool
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important Notice</AlertTitle>
                  <AlertDescription>
                    This tool is designed for legitimate security testing only. Always obtain proper authorization before
                    conducting any phishing simulations. Unauthorized phishing attempts are illegal and unethical.
                  </AlertDescription>
                </Alert>
                <p>
                  When using this platform for personal security testing, ensure you:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Only test on your own accounts or with explicit permission</li>
                  <li>Document your testing activities and objectives</li>
                  <li>Follow responsible disclosure practices</li>
                  <li>Respect privacy and data protection regulations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  <CardTitle>Quick Start Guide</CardTitle>
                </div>
                <CardDescription>
                  Get started with phishing simulations in a few simple steps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">1. Create a Phishing Page</h3>
                    <p>Use our templates or clone a legitimate website to create a convincing phishing page for testing.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">2. Set Up a Campaign</h3>
                    <p>Configure your campaign settings, target recipients, and tracking options.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">3. Launch and Monitor</h3>
                    <p>Launch your campaign and track results through the analytics dashboard.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">4. Review Results</h3>
                    <p>Analyze the effectiveness of your phishing test and identify areas for improvement.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <CardTitle>Benefits of Personal Security Testing</CardTitle>
                </div>
                <CardDescription>
                  Why regular phishing simulations are valuable for personal security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <Shield className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Enhanced Awareness:</span> Develop a better understanding of phishing tactics and improve your ability to identify threats.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <Target className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Identify Vulnerabilities:</span> Discover your personal security blind spots before real attackers exploit them.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <BarChart4 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Track Improvement:</span> Measure your security awareness progress over time with detailed analytics.
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enterprise">
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  <CardTitle>Enterprise Implementation Guide</CardTitle>
                </div>
                <CardDescription>
                  Comprehensive overview of platform features for organizational use
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <Mail className="h-5 w-5 text-blue-500" />
                    Dashboard & Templates
                  </h3>
                  <p className="mb-2">
                    The dashboard provides a central hub for managing all aspects of your phishing campaigns:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><span className="font-medium">Templates:</span> Access to pre-built phishing templates or create custom ones.</li>
                    <li><span className="font-medium">Clone Website:</span> Feature to clone legitimate websites for realistic simulations.</li>
                    <li><span className="font-medium">Custom HTML:</span> Advanced option to build phishing pages from scratch.</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-red-500" />
                    Campaign Management
                  </h3>
                  <p className="mb-2">
                    Create and manage targeted phishing campaigns:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><span className="font-medium">Target Groups:</span> Create and manage lists of recipients for your campaigns.</li>
                    <li><span className="font-medium">Scheduling:</span> Set campaign start and end dates with automated sending.</li>
                    <li><span className="font-medium">Tracking Options:</span> Configure what user interactions to track (opens, clicks, data entry).</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <BarChart4 className="h-5 w-5 text-indigo-500" />
                    Analytics & Reporting
                  </h3>
                  <p className="mb-2">
                    Comprehensive analytics to measure campaign effectiveness:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><span className="font-medium">Real-time Metrics:</span> Track opens, clicks, and form submissions as they happen.</li>
                    <li><span className="font-medium">Comparative Analysis:</span> Compare performance across campaigns and departments.</li>
                    <li><span className="font-medium">Export Options:</span> Generate detailed reports for stakeholder presentations.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <CardTitle>Enterprise Benefits</CardTitle>
                </div>
                <CardDescription>
                  How regular phishing simulations strengthen your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      Security Compliance
                    </h3>
                    <ul className="space-y-2">
                      <li>Meet security training requirements for regulatory frameworks</li>
                      <li>Document security awareness efforts for audits</li>
                      <li>Demonstrate proactive security measures to stakeholders</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5 text-violet-500" />
                      Risk Reduction
                    </h3>
                    <ul className="space-y-2">
                      <li>Identify departmental security vulnerabilities</li>
                      <li>Reduce successful phishing attacks by up to 75%</li>
                      <li>Create a culture of security awareness</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <BarChart4 className="h-5 w-5 text-emerald-500" />
                      ROI & Cost Savings
                    </h3>
                    <ul className="space-y-2">
                      <li>Prevent costly security breaches</li>
                      <li>Reduce incident response overhead</li>
                      <li>Optimize security training investments</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Shield className="h-5 w-5 text-amber-500" />
                      Continuous Improvement
                    </h3>
                    <ul className="space-y-2">
                      <li>Track security awareness progress over time</li>
                      <li>Identify areas needing additional training</li>
                      <li>Adapt to emerging phishing threats</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Guide;
