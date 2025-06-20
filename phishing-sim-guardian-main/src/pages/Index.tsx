
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import AnimatedCard from '@/components/ui/AnimatedCard';
import GlassPanel from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Clock } from 'lucide-react';

const Index = () => {
  const [inProgressOpen, setInProgressOpen] = useState(false);
  const [inProgressType, setInProgressType] = useState("");

  const handleTabClick = (type: string) => {
    if (type === 'sms' || type === 'voice') {
      setInProgressType(type === 'sms' ? 'SMS' : 'Voice');
      setInProgressOpen(true);
      return false;
    }
    return true;
  };

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
                  <TabsTrigger value="sms" onClick={() => handleTabClick('sms')}>SMS Templates</TabsTrigger>
                  <TabsTrigger value="voice" onClick={() => handleTabClick('voice')}>Voice Templates</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="email" className="animate-fade-in">
                <GlassPanel className="p-6 md:p-8 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        title: "Password Reset",
                        category: "Credential Harvest",
                        difficulty: "Medium",
                        description: "A realistic template mimicking a legitimate password reset notification."
                      },
                      {
                        title: "Invoice Payment",
                        category: "Financial Fraud",
                        difficulty: "Hard",
                        description: "A convincing invoice payment request template that appears to be from a trusted vendor."
                      },
                      {
                        title: "Document Share",
                        category: "Malware Delivery",
                        difficulty: "Easy",
                        description: "A template mimicking a legitimate document share notification from popular cloud storage services."
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
                            {template.description}
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
                    {/* SMS Templates content - In Progress, handled by dialog */}
                  </div>
                </GlassPanel>
              </TabsContent>
              
              <TabsContent value="voice" className="animate-fade-in">
                <GlassPanel className="p-6 md:p-8 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Voice Templates content - In Progress, handled by dialog */}
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
                      <img 
                        src="/lovable-uploads/f5d91462-4a22-42de-9ee6-1406b1391d82.png" 
                        alt="Analytics Dashboard" 
                        className="max-w-full rounded-lg"
                      />
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

      {/* In Progress Feature Alert Dialog */}
      <AlertDialog open={inProgressOpen} onOpenChange={setInProgressOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <AlertDialogTitle>Feature In Progress</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4">
              <p className="mb-4">
                {inProgressType} Templates are currently in development and will be available soon.
              </p>
              <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-md border border-amber-200 dark:border-amber-800 text-center">
                <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">
                  Available Soon
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
