
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import GlassPanel from '@/components/ui/GlassPanel';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { Shield, Bell, PieChart, Users, Calendar, Settings } from 'lucide-react';

const Features = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Comprehensive <span className="text-gradient">Security Features</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">
                Our platform offers a wide range of features designed to help you protect your organization against phishing attacks.
              </p>
            </div>
          </div>
        </section>
        
        {/* Main Features */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">
              Core Platform Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: "Customizable Campaigns",
                  description: "Create and deploy tailored phishing simulations across multiple channels with varying levels of sophistication."
                },
                {
                  icon: Bell,
                  title: "Real-time Alerts",
                  description: "Get instant notifications when employees interact with simulated phishing attempts."
                },
                {
                  icon: PieChart,
                  title: "Comprehensive Analytics",
                  description: "Track performance metrics and generate detailed reports on susceptibility rates and behavioral patterns."
                },
                {
                  icon: Users,
                  title: "Role-based Assessment",
                  description: "Identify high-risk employees or departments and provide targeted training based on risk levels."
                },
                {
                  icon: Calendar,
                  title: "Scheduled Campaigns",
                  description: "Automate campaign delivery with advanced scheduling options to test employees at different times."
                },
                {
                  icon: Settings,
                  title: "Compliance Controls",
                  description: "Ensure all simulations adhere to legal and ethical standards including GDPR and ISO 27001."
                }
              ].map((feature, index) => (
                <AnimatedCard key={index} className="h-full">
                  <div className="p-6 flex flex-col h-full">
                    <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                      {feature.description}
                    </p>
                    <Button variant="ghost" size="sm" className="w-fit">Learn more</Button>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>
        
        {/* Advanced Features */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-6">
                  Advanced <span className="text-gradient">Protection</span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  Our platform goes beyond basic phishing simulations to provide comprehensive security awareness training.
                </p>
                
                <div className="space-y-6">
                  {[
                    {
                      title: "Multi-Channel Testing",
                      description: "Test employee awareness across email, SMS, voice calls, and social media platforms."
                    },
                    {
                      title: "Targeted Simulations",
                      description: "Create phishing campaigns tailored to specific departments, roles, or individuals."
                    },
                    {
                      title: "Automated Remediation",
                      description: "Automatically assign training to employees who fail phishing tests, improving their awareness."
                    },
                    {
                      title: "Continuous Assessment",
                      description: "Regularly test employees to ensure lasting awareness and measure improvement over time."
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
              </div>
              
              <div>
                <GlassPanel className="p-6 rounded-xl overflow-hidden">
                  <div className="aspect-video overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="text-center p-8">
                      <h3 className="text-xl font-semibold mb-3">Feature Overview</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Interactive demonstration of our platform's advanced security features.
                      </p>
                      <Button>Watch Demo</Button>
                    </div>
                  </div>
                </GlassPanel>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <GlassPanel className="p-8 md:p-12 rounded-2xl text-center max-w-4xl mx-auto" intensity="medium">
              <h2 className="text-3xl font-bold tracking-tight mb-6">
                Ready to <span className="text-gradient">Strengthen</span> Your Security?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Start building resilience against phishing attacks with our comprehensive simulation platform.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" className="rounded-full px-8">
                  <Link to="/dashboard">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                  <Link to="/help">Learn More</Link>
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

export default Features;
