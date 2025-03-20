
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import AnimatedCard from '@/components/ui/AnimatedCard';
import GlassPanel from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const workflowSteps = [
    {
      number: "01",
      title: "Design Campaign",
      description: "Create targeted phishing simulations based on your industry-specific threats."
    },
    {
      number: "02",
      title: "Deploy Simulations",
      description: "Schedule and automate phishing campaigns with varying difficulty levels."
    },
    {
      number: "03",
      title: "Monitor Results",
      description: "Track interactions in real-time with comprehensive analytics dashboards."
    },
    {
      number: "04",
      title: "Provide Training",
      description: "Deliver personalized training to employees based on their interactions."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <Hero />
        <Features />
        
        {/* Workflow Section */}
        <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Streamlined <span className="text-gradient">Workflow</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Our intuitive platform guides you through every step of creating, deploying, and analyzing phishing simulations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {workflowSteps.map((step, index) => (
                <div key={index} className="relative">
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/4 right-0 w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-800 -z-10 translate-x-1/2"></div>
                  )}
                  
                  <AnimatedCard className="h-full">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold mb-4">
                        {step.number}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </AnimatedCard>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Templates Section */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Pre-Built <span className="text-gradient">Templates</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Get started quickly with our extensive library of realistic phishing templates designed to test various attack vectors.
              </p>
            </div>
            
            <Tabs defaultValue="email" className="max-w-5xl mx-auto">
              <div className="flex justify-center mb-8">
                <TabsList>
                  <TabsTrigger value="email">Email Templates</TabsTrigger>
                  <TabsTrigger value="sms">SMS Templates</TabsTrigger>
                  <TabsTrigger value="voice">Voice Templates</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="email" className="animate-fade-in">
                <GlassPanel className="p-6 md:p-8 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        title: "Password Reset",
                        category: "Credential Harvest",
                        difficulty: "Medium"
                      },
                      {
                        title: "Invoice Payment",
                        category: "Financial Fraud",
                        difficulty: "Hard"
                      },
                      {
                        title: "Document Share",
                        category: "Malware Delivery",
                        difficulty: "Easy"
                      }
                    ].map((template, index) => (
                      <AnimatedCard key={index} className="overflow-hidden h-full">
                        <div className="p-6">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 py-1 px-2 rounded-full">
                              {template.category}
                            </span>
                            <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 py-1 px-2 rounded-full">
                              {template.difficulty}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{template.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            A realistic template mimicking a legitimate {template.title.toLowerCase()} notification.
                          </p>
                          <Button variant="outline" size="sm" className="w-full">Preview Template</Button>
                        </div>
                      </AnimatedCard>
                    ))}
                  </div>
                </GlassPanel>
              </TabsContent>
              
              <TabsContent value="sms" className="animate-fade-in">
                <GlassPanel className="p-6 md:p-8 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        title: "Package Delivery",
                        category: "Link Harvesting",
                        difficulty: "Medium"
                      },
                      {
                        title: "Account Alert",
                        category: "Credential Theft",
                        difficulty: "Hard"
                      },
                      {
                        title: "Verification Code",
                        category: "2FA Bypass",
                        difficulty: "Easy"
                      }
                    ].map((template, index) => (
                      <AnimatedCard key={index} className="overflow-hidden h-full">
                        <div className="p-6">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 py-1 px-2 rounded-full">
                              {template.category}
                            </span>
                            <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 py-1 px-2 rounded-full">
                              {template.difficulty}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{template.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            A convincing SMS template for {template.title.toLowerCase()} notifications.
                          </p>
                          <Button variant="outline" size="sm" className="w-full">Preview Template</Button>
                        </div>
                      </AnimatedCard>
                    ))}
                  </div>
                </GlassPanel>
              </TabsContent>
              
              <TabsContent value="voice" className="animate-fade-in">
                <GlassPanel className="p-6 md:p-8 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        title: "Tech Support",
                        category: "Social Engineering",
                        difficulty: "Hard"
                      },
                      {
                        title: "Bank Verification",
                        category: "Financial Fraud",
                        difficulty: "Medium"
                      },
                      {
                        title: "Survey Request",
                        category: "Information Gathering",
                        difficulty: "Easy"
                      }
                    ].map((template, index) => (
                      <AnimatedCard key={index} className="overflow-hidden h-full">
                        <div className="p-6">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 py-1 px-2 rounded-full">
                              {template.category}
                            </span>
                            <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 py-1 px-2 rounded-full">
                              {template.difficulty}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{template.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Realistic voice script for {template.title.toLowerCase()} simulation calls.
                          </p>
                          <Button variant="outline" size="sm" className="w-full">Preview Script</Button>
                        </div>
                      </AnimatedCard>
                    ))}
                  </div>
                </GlassPanel>
              </TabsContent>
            </Tabs>
          </div>
        </section>
        
        {/* Analytics Section */}
        <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                  Comprehensive <span className="text-gradient">Analytics</span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  Gain deep insights into your organization's security awareness with our real-time analytics dashboard.
                </p>
                
                <div className="space-y-6">
                  {[
                    {
                      title: "Real-Time Tracking",
                      description: "Monitor employee interactions with simulated phishing attempts as they happen."
                    },
                    {
                      title: "Detailed Reports",
                      description: "Generate comprehensive reports on susceptibility rates and behavior patterns."
                    },
                    {
                      title: "Risk Identification",
                      description: "Identify high-risk employees and departments requiring targeted training."
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex">
                      <div className="mr-4 mt-1">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-10">
                  <Button size="lg" className="rounded-full px-8">
                    Explore Analytics
                  </Button>
                </div>
              </div>
              
              <div>
                <GlassPanel className="p-4 rounded-xl overflow-hidden">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                    <div className="aspect-[4/3] overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg">
                      <div className="text-center p-6">
                        <h3 className="text-xl font-semibold mb-4">Analytics Dashboard</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Interactive visualization of phishing campaign metrics and employee responses.
                        </p>
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-50 dark:from-transparent dark:to-blue-950/10 -z-10" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/50 dark:bg-blue-900/10 rounded-full blur-3xl -z-10" />
          
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <GlassPanel className="p-8 md:p-12 rounded-2xl text-center max-w-4xl mx-auto" intensity="medium">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Ready to <span className="text-gradient">Strengthen</span> Your Security?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Start building resilience against phishing attacks with our comprehensive simulation platform.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="rounded-full px-8">
                  Get Started
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8">
                  Request Demo
                </Button>
              </div>
            </GlassPanel>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
