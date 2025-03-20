
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlassPanel from '@/components/ui/GlassPanel';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Search, Filter, Tag } from 'lucide-react';

const Templates = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Phishing <span className="text-gradient">Templates</span> Library
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">
                Browse our extensive library of realistic phishing templates designed to test various attack vectors.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search templates..." 
                    className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Templates Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <Tabs defaultValue="email" className="max-w-5xl mx-auto">
              <div className="flex justify-center mb-8">
                <TabsList>
                  <TabsTrigger value="email">Email Templates</TabsTrigger>
                  <TabsTrigger value="sms">SMS Templates</TabsTrigger>
                  <TabsTrigger value="voice">Voice Templates</TabsTrigger>
                  <TabsTrigger value="social">Social Media</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="email" className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Password Reset Alert",
                      category: "Credential Harvest",
                      difficulty: "Medium",
                      tags: ["Finance", "Technology"]
                    },
                    {
                      title: "Invoice Payment Request",
                      category: "Financial Fraud",
                      difficulty: "Hard",
                      tags: ["Finance", "Business"]
                    },
                    {
                      title: "Document Share Request",
                      category: "Malware Delivery",
                      difficulty: "Easy",
                      tags: ["Office", "Collaboration"]
                    },
                    {
                      title: "HR Policy Update",
                      category: "Credential Harvest",
                      difficulty: "Medium",
                      tags: ["HR", "Internal"]
                    },
                    {
                      title: "IT Security Alert",
                      category: "Malware Delivery",
                      difficulty: "Hard",
                      tags: ["IT", "Security"]
                    },
                    {
                      title: "CEO Request",
                      category: "Financial Fraud",
                      difficulty: "Hard",
                      tags: ["Executive", "Urgent"]
                    }
                  ].map((template, index) => (
                    <AnimatedCard key={index} className="overflow-hidden h-full">
                      <div className="p-6 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 py-1 px-2 rounded-full">
                            {template.category}
                          </span>
                          <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 py-1 px-2 rounded-full">
                            {template.difficulty}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{template.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                          A realistic template mimicking a legitimate {template.title.toLowerCase()} notification.
                        </p>
                        <div className="flex gap-2 mb-4 flex-wrap">
                          {template.tags.map((tag, tagIndex) => (
                            <div key={tagIndex} className="flex items-center text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Preview</Button>
                          <Button size="sm">Use Template</Button>
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="sms" className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Package Delivery",
                      category: "Link Harvesting",
                      difficulty: "Medium",
                      tags: ["Logistics", "Commerce"]
                    },
                    {
                      title: "Account Alert",
                      category: "Credential Theft",
                      difficulty: "Hard",
                      tags: ["Banking", "Finance"]
                    },
                    {
                      title: "Verification Code",
                      category: "2FA Bypass",
                      difficulty: "Easy",
                      tags: ["Authentication", "Security"]
                    },
                    {
                      title: "Payment Failed",
                      category: "Financial Fraud",
                      difficulty: "Medium",
                      tags: ["Billing", "Commerce"]
                    },
                    {
                      title: "Prize Winner",
                      category: "Data Collection",
                      difficulty: "Easy",
                      tags: ["Marketing", "Contest"]
                    },
                    {
                      title: "Account Locked",
                      category: "Credential Theft",
                      difficulty: "Medium",
                      tags: ["Security", "Banking"]
                    }
                  ].map((template, index) => (
                    <AnimatedCard key={index} className="overflow-hidden h-full">
                      <div className="p-6 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 py-1 px-2 rounded-full">
                            {template.category}
                          </span>
                          <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 py-1 px-2 rounded-full">
                            {template.difficulty}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{template.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                          A convincing SMS template for {template.title.toLowerCase()} notifications.
                        </p>
                        <div className="flex gap-2 mb-4 flex-wrap">
                          {template.tags.map((tag, tagIndex) => (
                            <div key={tagIndex} className="flex items-center text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Preview</Button>
                          <Button size="sm">Use Template</Button>
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="voice" className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Tech Support",
                      category: "Social Engineering",
                      difficulty: "Hard",
                      tags: ["IT", "Support"]
                    },
                    {
                      title: "Bank Verification",
                      category: "Financial Fraud",
                      difficulty: "Medium",
                      tags: ["Banking", "Verification"]
                    },
                    {
                      title: "Survey Request",
                      category: "Information Gathering",
                      difficulty: "Easy",
                      tags: ["Research", "Marketing"]
                    },
                    {
                      title: "Legal Notification",
                      category: "Urgent Action",
                      difficulty: "Hard",
                      tags: ["Legal", "Compliance"]
                    },
                    {
                      title: "Account Security",
                      category: "Credential Theft",
                      difficulty: "Medium",
                      tags: ["Security", "Authentication"]
                    },
                    {
                      title: "Prize Confirmation",
                      category: "Data Collection",
                      difficulty: "Easy",
                      tags: ["Contest", "Marketing"]
                    }
                  ].map((template, index) => (
                    <AnimatedCard key={index} className="overflow-hidden h-full">
                      <div className="p-6 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 py-1 px-2 rounded-full">
                            {template.category}
                          </span>
                          <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 py-1 px-2 rounded-full">
                            {template.difficulty}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{template.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                          Realistic voice script for {template.title.toLowerCase()} simulation calls.
                        </p>
                        <div className="flex gap-2 mb-4 flex-wrap">
                          {template.tags.map((tag, tagIndex) => (
                            <div key={tagIndex} className="flex items-center text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Preview</Button>
                          <Button size="sm">Use Template</Button>
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="social" className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: "LinkedIn Connection",
                      category: "Social Engineering",
                      difficulty: "Medium",
                      tags: ["Professional", "Networking"]
                    },
                    {
                      title: "Social Media Alert",
                      category: "Credential Theft",
                      difficulty: "Medium",
                      tags: ["Security", "Account"]
                    },
                    {
                      title: "Friend Request",
                      category: "Information Gathering",
                      difficulty: "Easy",
                      tags: ["Personal", "Social"]
                    },
                    {
                      title: "Job Opportunity",
                      category: "Data Collection",
                      difficulty: "Hard",
                      tags: ["Career", "Recruitment"]
                    },
                    {
                      title: "Group Invitation",
                      category: "Social Engineering",
                      difficulty: "Medium",
                      tags: ["Community", "Networking"]
                    },
                    {
                      title: "Social Media Contest",
                      category: "Link Harvesting",
                      difficulty: "Easy",
                      tags: ["Marketing", "Contest"]
                    }
                  ].map((template, index) => (
                    <AnimatedCard key={index} className="overflow-hidden h-full">
                      <div className="p-6 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 py-1 px-2 rounded-full">
                            {template.category}
                          </span>
                          <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 py-1 px-2 rounded-full">
                            {template.difficulty}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{template.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                          Convincing social media template for {template.title.toLowerCase()} scenarios.
                        </p>
                        <div className="flex gap-2 mb-4 flex-wrap">
                          {template.tags.map((tag, tagIndex) => (
                            <div key={tagIndex} className="flex items-center text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Preview</Button>
                          <Button size="sm">Use Template</Button>
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
        
        {/* Create Custom Template */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <GlassPanel className="p-8 md:p-12 rounded-2xl max-w-4xl mx-auto" intensity="medium">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight mb-6">
                  Need a <span className="text-gradient">Custom</span> Template?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                  Can't find what you're looking for? Create your own custom phishing template tailored to your specific needs.
                </p>
                
                <Button asChild size="lg" className="rounded-full px-8">
                  <Link to="/dashboard">Create Custom Template</Link>
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

export default Templates;
