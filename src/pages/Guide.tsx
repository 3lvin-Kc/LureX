
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Shield, Users, LayoutDashboard, Target, FileText, Settings, Mail, Globe, Code, ChevronDown, ChevronRight } from "lucide-react";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Guide = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setOpenSection(openSection === sectionId ? null : sectionId);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <section className="py-12 md:py-16 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Phishing Simulation Guide</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                A comprehensive guide to using our phishing simulation platform for improving your organization's security posture
              </p>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4 max-w-6xl">
            <Tabs defaultValue="personal" className="space-y-8">
              <div className="flex justify-center">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="personal">Personal Use</TabsTrigger>
                  <TabsTrigger value="enterprise">Enterprise Use</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="personal" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Getting Started with Personal Phishing Tests</CardTitle>
                    <CardDescription>
                      Learn how to create basic phishing simulations for personal security awareness
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert variant="warning" className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                      <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertTitle>Important Disclaimer</AlertTitle>
                      <AlertDescription>
                        This tool is designed for legitimate security testing and educational purposes only. Always obtain proper authorization before conducting any phishing tests. Unauthorized use against individuals or organizations without consent is illegal and unethical.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Quick Start Guide</h3>
                        <ol className="space-y-4 list-decimal ml-5">
                          <li>
                            <p className="font-medium">Create a phishing page</p>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              Navigate to the Phishing Pages section and click "New Page" to create a custom login form, or use the "Clone Website" feature (beta) to replicate an existing website.
                            </p>
                          </li>
                          <li>
                            <p className="font-medium">Set up a target list</p>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              Add email addresses to your Target Lists for tracking purposes. For personal testing, you can use your own email addresses.
                            </p>
                          </li>
                          <li>
                            <p className="font-medium">Create and send a campaign</p>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              Use the Campaigns section to create a new phishing simulation, linking your phishing page and target list. Schedule the campaign to send immediately or at a future date.
                            </p>
                          </li>
                          <li>
                            <p className="font-medium">Analyze the results</p>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              Review campaign analytics to see open rates, click rates, and form submissions to assess vulnerability to phishing attempts.
                            </p>
                          </li>
                        </ol>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-4">Benefits of Personal Security Testing</h3>
                        <ul className="space-y-3 list-disc ml-5">
                          <li>Understand common phishing techniques and how to identify them</li>
                          <li>Test your personal email security measures and filters</li>
                          <li>Practice security awareness in a controlled environment</li>
                          <li>Learn to recognize social engineering tactics used by attackers</li>
                          <li>Verify the effectiveness of your security training</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="enterprise" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Enterprise Phishing Simulation Platform</CardTitle>
                    <CardDescription>
                      Comprehensive guide to all features for organizational security testing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <p className="text-lg">
                        Our enterprise platform provides comprehensive tools for security teams to conduct realistic phishing simulations, track employee responses, and improve organizational security awareness through targeted training.
                      </p>

                      <div className="space-y-4">
                        {[
                          {
                            id: 'dashboard',
                            icon: <LayoutDashboard className="h-5 w-5" />,
                            title: 'Dashboard',
                            description: 'Central overview of all campaign metrics and activities',
                            content: (
                              <div className="space-y-4">
                                <p>The Dashboard provides a comprehensive overview of your phishing simulation activities, including:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                  <li>Active campaign metrics (click rates, open rates, form submissions)</li>
                                  <li>Historical campaign performance trends</li>
                                  <li>Risk assessment by department or team</li>
                                  <li>Quick access to recently created campaigns and templates</li>
                                  <li>Security posture improvement tracking over time</li>
                                </ul>
                                <p>Use the dashboard to quickly identify vulnerable areas in your organization that require additional security awareness training.</p>
                              </div>
                            )
                          },
                          {
                            id: 'campaigns',
                            icon: <Mail className="h-5 w-5" />,
                            title: 'Campaigns',
                            description: 'Create, manage and schedule phishing simulation campaigns',
                            content: (
                              <div className="space-y-4">
                                <p>The Campaigns section allows you to create and manage phishing simulations:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                  <li>Create new campaigns with customizable parameters</li>
                                  <li>Select email templates, landing pages, and target groups</li>
                                  <li>Schedule one-time or recurring campaigns</li>
                                  <li>Monitor real-time campaign performance</li>
                                  <li>Export detailed campaign results for reporting</li>
                                </ul>
                                <p>Advanced features include A/B testing different phishing approaches and automatic follow-up training for users who fail the simulation.</p>
                              </div>
                            )
                          },
                          {
                            id: 'templates',
                            icon: <FileText className="h-5 w-5" />,
                            title: 'Templates',
                            description: 'Pre-built and custom email templates for phishing simulations',
                            content: (
                              <div className="space-y-4">
                                <p>The Templates section provides a library of phishing email templates:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                  <li>Industry-specific templates (finance, healthcare, technology, etc.)</li>
                                  <li>Templates based on common attack vectors (password reset, account verification, etc.)</li>
                                  <li>Custom template creator with HTML editor</li>
                                  <li>Variable insertion for personalization</li>
                                  <li>Template effectiveness metrics from previous campaigns</li>
                                </ul>
                                <p>Templates can be categorized by difficulty level to gradually increase the challenge for employees as their security awareness improves.</p>
                              </div>
                            )
                          },
                          {
                            id: 'phishing-pages',
                            icon: <Globe className="h-5 w-5" />,
                            title: 'Phishing Pages',
                            description: 'Landing pages that simulate malicious websites',
                            content: (
                              <div className="space-y-4">
                                <p>The Phishing Pages section allows you to create convincing landing pages:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                  <li>Custom page builder with HTML, CSS, and JavaScript support</li>
                                  <li>Website cloner for replicating legitimate sites (beta feature)</li>
                                  <li>Form capture for credential harvesting simulation</li>
                                  <li>Mobile-responsive design preview</li>
                                  <li>Educational overlay display after submission</li>
                                </ul>
                                <p>Note: The Website Cloner feature is in beta and works best with simple websites. For complex sites, we recommend using the custom page builder for more reliable results.</p>
                              </div>
                            )
                          },
                          {
                            id: 'target-lists',
                            icon: <Target className="h-5 w-5" />,
                            title: 'Target Lists',
                            description: 'Manage groups of recipients for phishing campaigns',
                            content: (
                              <div className="space-y-4">
                                <p>The Target Lists section helps you organize campaign recipients:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                  <li>Create custom groups by department, location, or risk level</li>
                                  <li>Import recipients from CSV files</li>
                                  <li>Track individual and group performance metrics</li>
                                  <li>Implement progressive training based on user responses</li>
                                  <li>Exclude specific users or create randomized sample groups</li>
                                </ul>
                                <p>Segmenting your organization allows for targeted campaigns that address specific vulnerabilities or test particular departments that may be at higher risk.</p>
                              </div>
                            )
                          },
                          {
                            id: 'reports',
                            icon: <FileText className="h-5 w-5" />,
                            title: 'Reports',
                            description: 'Comprehensive analytics and security insights',
                            content: (
                              <div className="space-y-4">
                                <p>The Reports section provides detailed analytics on your phishing simulations:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                  <li>Detailed campaign performance metrics</li>
                                  <li>User susceptibility tracking over time</li>
                                  <li>Department and team comparison</li>
                                  <li>Custom report generation for executives and stakeholders</li>
                                  <li>Benchmark comparisons against industry standards</li>
                                </ul>
                                <p>Use these reports to demonstrate ROI on security awareness training and identify areas requiring additional focus.</p>
                              </div>
                            )
                          },
                          {
                            id: 'settings',
                            icon: <Settings className="h-5 w-5" />,
                            title: 'Settings',
                            description: 'Platform configuration and integration options',
                            content: (
                              <div className="space-y-4">
                                <p>The Settings section allows you to configure the platform to your needs:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                  <li>User management and access controls</li>
                                  <li>Email sending configuration and domain verification</li>
                                  <li>Integration with learning management systems</li>
                                  <li>Custom branding options</li>
                                  <li>API access for data integration with other security tools</li>
                                </ul>
                                <p>Configure settings to ensure the platform aligns with your organization's security policies and compliance requirements.</p>
                              </div>
                            )
                          }
                        ].map((section) => (
                          <Collapsible 
                            key={section.id} 
                            open={openSection === section.id}
                            onOpenChange={() => toggleSection(section.id)}
                            className="border rounded-lg overflow-hidden"
                          >
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <div className="flex items-center gap-3">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                  {section.icon}
                                </div>
                                <div className="text-left">
                                  <h3 className="font-semibold text-lg">{section.title}</h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{section.description}</p>
                                </div>
                              </div>
                              {openSection === section.id ? 
                                <ChevronDown className="h-5 w-5 text-gray-500" /> : 
                                <ChevronRight className="h-5 w-5 text-gray-500" />
                              }
                            </CollapsibleTrigger>
                            <CollapsibleContent className="p-4 pt-0 border-t bg-gray-50/50 dark:bg-gray-800/20">
                              {section.content}
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Benefits of Enterprise Phishing Simulations</CardTitle>
                    <CardDescription>
                      How your organization can benefit from regular security testing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mt-1">
                            <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">Enhanced Security Posture</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              Regular phishing simulations identify vulnerabilities in your human firewall before real attackers can exploit them.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mt-1">
                            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">Improved Security Awareness</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              Employees learn to recognize and report suspicious emails, creating a culture of security vigilance.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mt-1">
                            <Code className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">Compliance Adherence</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              Meet regulatory requirements for security awareness training in industries like finance, healthcare, and government.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mt-1">
                            <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">Risk Reduction</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              Reduce the likelihood of successful phishing attacks that could lead to data breaches, ransomware, or financial loss.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mt-1">
                            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">Targeted Training</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              Identify specific departments or individuals who need additional security training based on simulation results.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mt-1">
                            <Code className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">Measurable ROI</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              Track improvement over time with concrete metrics that demonstrate the value of your security awareness program.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="py-10 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Begin strengthening your security posture today with our comprehensive phishing simulation platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '/phishing-pages'}>
                Create First Phishing Page
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Guide;
