
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedCard from '../ui/AnimatedCard';
import GlassPanel from '../ui/GlassPanel';
import shieldIcon from '../../assets/images/shield-icon.svg';
import graphIcon from '../../assets/images/graph-icon.svg';
import templateIcon from '../../assets/images/template-icon.svg';
import trainingIcon from '../../assets/images/training-icon.svg';

const Features = () => {
  const features = [
    {
      icon: templateIcon,
      title: "Customizable Campaigns",
      description: "Design tailored phishing simulations across email, SMS, and voice with realistic scenarios that match your industry's threats."
    },
    {
      icon: shieldIcon,
      title: "Pre-Built Templates",
      description: "Access hundreds of ready-to-use templates mimicking common attack vectors like credential theft, malware delivery, and fake invoices."
    },
    {
      icon: graphIcon,
      title: "Real-Time Analytics",
      description: "Monitor employee interactions with comprehensive dashboards tracking click rates, credential submissions, and reporting behavior."
    },
    {
      icon: trainingIcon,
      title: "Targeted Training",
      description: "Deliver personalized security awareness modules based on individual risk profiles and interaction patterns."
    }
  ];

  return (
    <section className="py-20 md:py-32 relative">
      {/* Background elements */}
      <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-gray-50 to-transparent dark:from-gray-900/50 dark:to-transparent -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Sophisticated <span className="text-gradient">Features</span> for Complete Protection
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Our platform combines advanced simulation technology with comprehensive analytics and training to create a complete security awareness ecosystem.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <AnimatedCard
              key={index}
              className="overflow-hidden h-full"
              glowColor="rgba(59, 130, 246, 0.4)"
            >
              <CardHeader className="pb-2">
                <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <img src={feature.icon} alt={feature.title} className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </AnimatedCard>
          ))}
        </div>
        
        <div className="mt-20 md:mt-32">
          <GlassPanel className="p-8 md:p-12 rounded-2xl max-w-6xl mx-auto" intensity="light">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-6">Advanced Risk Assessment</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Identify high-risk employees and departments through behavioral analysis and phishing simulation responses. Customize training paths based on specific vulnerabilities.
                </p>
                <ul className="space-y-3">
                  {[
                    "Role-based susceptibility analysis",
                    "Department vulnerability mapping",
                    "Behavioral pattern recognition",
                    "Custom risk scoring algorithms",
                    "Targeted intervention recommendations"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">✓</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 h-full">
                <div className="flex flex-col h-full justify-center items-center text-center">
                  <h4 className="text-lg font-medium mb-4">Risk Assessment Dashboard</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Comprehensive visualization of your organization's security awareness landscape.
                  </p>
                  <div className="w-full aspect-[4/3] bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Dashboard Visualization</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </section>
  );
};

export default Features;
