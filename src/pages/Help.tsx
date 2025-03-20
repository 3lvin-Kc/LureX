
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlassPanel from '@/components/ui/GlassPanel';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { 
  HelpCircle, 
  Play, 
  Book, 
  FileText, 
  MessageSquare, 
  Mail,
  ChevronDown,
  ChevronRight,
  Search
} from 'lucide-react';

const Help = () => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);
  
  const toggleFaq = (index: number) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                How can we <span className="text-gradient">help</span> you?
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Find answers, tutorials, and resources to help you get the most out of the Phishing Guardian platform.
              </p>
              
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search for help or topics..." 
                  className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-300 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              {[
                {
                  title: "Getting Started",
                  description: "New to the platform? Learn the basics with our quick start guides.",
                  icon: Play,
                  color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                },
                {
                  title: "Documentation",
                  description: "Comprehensive guides and API references for advanced users.",
                  icon: Book,
                  color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                },
                {
                  title: "Tutorials",
                  description: "Step-by-step tutorials to help you create effective campaigns.",
                  icon: FileText,
                  color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                },
                {
                  title: "Support",
                  description: "Need personalized help? Contact our support team.",
                  icon: MessageSquare,
                  color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                }
              ].map((item, index) => (
                <AnimatedCard key={index} className="h-full">
                  <Button variant="ghost" className="h-full p-6 flex flex-col items-center gap-4">
                    <div className={`p-3 rounded-full ${item.color}`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </Button>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>
        
        {/* Help Tabs Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <Tabs defaultValue="guides" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList>
                  <TabsTrigger value="guides">Quick Start Guides</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                  <TabsTrigger value="tutorials">Video Tutorials</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="guides" className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Setting Up Your First Campaign",
                      description: "Learn how to create and launch your first phishing simulation campaign.",
                      time: "5 min read",
                      level: "Beginner"
                    },
                    {
                      title: "Creating Custom Templates",
                      description: "Customize existing templates or create your own from scratch.",
                      time: "8 min read",
                      level: "Intermediate"
                    },
                    {
                      title: "User Group Management",
                      description: "Organize employees into groups for targeted campaigns and reporting.",
                      time: "6 min read",
                      level: "Beginner"
                    },
                    {
                      title: "Analyzing Campaign Results",
                      description: "Understand metrics and generate insights from your campaign data.",
                      time: "10 min read",
                      level: "Intermediate"
                    },
                    {
                      title: "Automated Scheduling",
                      description: "Set up recurring campaigns to maintain security awareness.",
                      time: "7 min read",
                      level: "Intermediate"
                    },
                    {
                      title: "Advanced Analytics",
                      description: "Dive deeper into your data with custom reports and visualizations.",
                      time: "12 min read",
                      level: "Advanced"
                    }
                  ].map((guide, index) => (
                    <AnimatedCard key={index} className="h-full overflow-hidden">
                      <div className="p-6 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold">{guide.title}</h3>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{guide.time}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                          {guide.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            guide.level === 'Beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                            guide.level === 'Intermediate' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                            'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                          }`}>
                            {guide.level}
                          </span>
                          <Button variant="ghost" size="sm">Read Guide</Button>
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="faq" className="animate-fade-in">
                <GlassPanel className="p-8 max-w-3xl mx-auto">
                  <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {[
                      {
                        question: "What is a phishing simulation?",
                        answer: "A phishing simulation is a controlled, educational exercise that mimics real-world phishing attacks. Organizations use these simulations to test employee awareness, measure susceptibility to phishing threats, and provide immediate training when employees fall for simulated attacks. Unlike real phishing, these simulations are safe and designed for educational purposes only."
                      },
                      {
                        question: "How often should we run phishing simulations?",
                        answer: "For optimal security awareness, we recommend running phishing simulations on a regular basis, typically monthly or quarterly. Consistent testing helps reinforce security awareness and measures improvement over time. However, the frequency can be adjusted based on your organization's size, industry risk factors, and compliance requirements."
                      },
                      {
                        question: "Will employees know they're being tested?",
                        answer: "You have full control over how transparent you want to be about your phishing simulation program. Some organizations prefer to notify employees that simulations will occur periodically without specifying dates, while others run completely blind tests. We can provide communication templates to help you introduce the program to employees in a way that emphasizes its educational value."
                      },
                      {
                        question: "How do I avoid creating a negative work environment with simulations?",
                        answer: "Focus on the educational aspect of simulations rather than punitive measures. Communicate clearly that the purpose is to strengthen security, not to trick or embarrass employees. Use immediate feedback and training when employees interact with simulations, and celebrate improvements in security awareness over time. Consider gamification elements that reward positive security behaviors."
                      },
                      {
                        question: "Is there a risk of employees confusing real phishing with your simulations?",
                        answer: "We implement clear mechanisms to help employees distinguish our simulations from real threats after they've interacted with them. This includes immediate educational notifications and a verification system that allows employees to check if a suspicious message is part of a simulation. Additionally, our platform can be customized to include organizational branding on post-click landing pages."
                      },
                      {
                        question: "What types of organizations benefit most from phishing simulations?",
                        answer: "Organizations of all sizes and industries benefit from phishing simulations, particularly those handling sensitive data, subject to compliance requirements, or in high-target industries like finance, healthcare, government, and technology. Any organization whose employees have email access can improve their security posture through regular phishing awareness training."
                      },
                      {
                        question: "How are the results of phishing simulations used?",
                        answer: "Simulation results provide valuable metrics including open rates, click rates, data entry rates, and reporting rates. These metrics help identify security awareness gaps, high-risk departments or individuals, and the effectiveness of your security training. Results can inform targeted training programs, demonstrate compliance efforts, and track improvements in your organization's security posture over time."
                      }
                    ].map((faq, index) => (
                      <div key={index} className="border-b border-gray-200 dark:border-gray-800 last:border-0 pb-4 last:pb-0">
                        <button
                          className="flex justify-between items-center w-full text-left font-medium py-2"
                          onClick={() => toggleFaq(index)}
                        >
                          <span>{faq.question}</span>
                          {openFaq === index ? (
                            <ChevronDown className="h-5 w-5 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-5 w-5 flex-shrink-0" />
                          )}
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${
                          openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          <p className="text-gray-600 dark:text-gray-400 py-2 text-sm">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassPanel>
              </TabsContent>
              
              <TabsContent value="tutorials" className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    {
                      title: "Creating Your First Campaign",
                      description: "A step-by-step walkthrough of setting up a phishing simulation campaign.",
                      duration: "8:24",
                      thumbnail: "bg-gray-200 dark:bg-gray-800"
                    },
                    {
                      title: "Customizing Email Templates",
                      description: "Learn how to modify existing templates or create your own custom phishing emails.",
                      duration: "12:37",
                      thumbnail: "bg-gray-200 dark:bg-gray-800"
                    },
                    {
                      title: "Analyzing Campaign Results",
                      description: "How to interpret metrics and generate insights from your campaign dashboard.",
                      duration: "10:15",
                      thumbnail: "bg-gray-200 dark:bg-gray-800"
                    },
                    {
                      title: "Advanced User Management",
                      description: "Techniques for organizing employees, creating groups, and targeting campaigns.",
                      duration: "15:42",
                      thumbnail: "bg-gray-200 dark:bg-gray-800"
                    }
                  ].map((video, index) => (
                    <GlassPanel key={index} className="overflow-hidden p-0">
                      <div className="aspect-video bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                        <Play className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold">{video.title}</h3>
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                            {video.duration}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {video.description}
                        </p>
                        <Button>Watch Tutorial</Button>
                      </div>
                    </GlassPanel>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="resources" className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Documentation</h3>
                    <ul className="space-y-3">
                      {[
                        "User Guide",
                        "API Documentation",
                        "Template Reference",
                        "Integration Guide",
                        "Security Whitepaper",
                        "Compliance Documentation"
                      ].map((item, index) => (
                        <li key={index}>
                          <Button variant="link" className="h-auto p-0 justify-start">
                            <FileText className="h-4 w-4 mr-2" />
                            {item}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Downloadable Resources</h3>
                    <ul className="space-y-3">
                      {[
                        "Campaign Planning Worksheet",
                        "Security Awareness Posters",
                        "Employee Communication Templates",
                        "Phishing Identification Checklist",
                        "ROI Calculator Spreadsheet",
                        "Monthly Security Newsletter Template"
                      ].map((item, index) => (
                        <li key={index}>
                          <Button variant="link" className="h-auto p-0 justify-start">
                            <Download className="h-4 w-4 mr-2" />
                            {item}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Educational Materials</h3>
                    <ul className="space-y-3">
                      {[
                        "Phishing Threat Landscape 2023",
                        "Security Awareness Best Practices",
                        "Creating a Security Culture",
                        "Industry Benchmarking Report",
                        "Compliance Training Guidelines",
                        "Measuring Training Effectiveness"
                      ].map((item, index) => (
                        <li key={index}>
                          <Button variant="link" className="h-auto p-0 justify-start">
                            <Book className="h-4 w-4 mr-2" />
                            {item}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
        
        {/* Contact Support */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-6">
                  Need More <span className="text-gradient">Help</span>?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  Our dedicated support team is ready to assist you with any questions or challenges you're facing with the platform.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Email Support</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Send us a detailed description of your issue and we'll respond within 24 hours.
                      </p>
                      <Button variant="link" className="h-auto p-0">support@phishingguardian.com</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-600 dark:text-green-400">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Live Chat</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Chat with our support representatives for immediate assistance during business hours.
                      </p>
                      <Button>Start Chat</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full text-purple-600 dark:text-purple-400">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Community Forum</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Connect with other users, share ideas, and find solutions in our community.
                      </p>
                      <Button variant="outline">Join Community</Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <GlassPanel className="p-8 rounded-xl">
                <h3 className="text-xl font-semibold mb-6">Contact Support</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input 
                      type="text" 
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input 
                      type="email" 
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Support Category</label>
                    <select className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background p-2 focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Select a category</option>
                      <option>Technical Support</option>
                      <option>Billing Question</option>
                      <option>Feature Request</option>
                      <option>Campaign Setup</option>
                      <option>Reporting Issue</option>
                      <option>Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Message</label>
                    <textarea 
                      rows={5}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    ></textarea>
                  </div>
                  
                  <Button className="w-full">Submit Request</Button>
                </form>
              </GlassPanel>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Help;
