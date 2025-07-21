
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedCard from '../ui/AnimatedCard';
import GlassPanel from '../ui/GlassPanel';
import { Badge } from "@/components/ui/badge";
import { Shield, BarChart, FileText, BookOpen, CheckCircle } from 'lucide-react';
import shieldIcon from '../../assets/images/shield-icon.svg';
import graphIcon from '../../assets/images/graph-icon.svg';
import templateIcon from '../../assets/images/template-icon.svg';
import trainingIcon from '../../assets/images/training-icon.svg';

const Features = () => {
  const features = [
    {
      icon: templateIcon,
      lucideIcon: FileText,
      title: "Customizable Campaigns",
      description: "Design tailored phishing simulations across email, SMS, and voice with realistic scenarios that match your industry's threats.",
      color: "from-blue-500/20 to-cyan-500/20 dark:from-blue-500/10 dark:to-cyan-500/10"
    },
    {
      icon: shieldIcon,
      lucideIcon: Shield,
      title: "Pre-Built Templates",
      description: "Access hundreds of ready-to-use templates mimicking common attack vectors like credential theft, malware delivery, and fake invoices.",
      color: "from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10"
    },
    {
      icon: graphIcon,
      lucideIcon: BarChart,
      title: "Real-Time Analytics",
      description: "Monitor employee interactions with comprehensive dashboards tracking click rates, credential submissions, and reporting behavior.",
      color: "from-purple-500/20 to-indigo-500/20 dark:from-purple-500/10 dark:to-indigo-500/10"
    },
    {
      icon: trainingIcon,
      lucideIcon: BookOpen,
      title: "Targeted Training",
      description: "Deliver personalized security awareness modules based on individual risk profiles and interaction patterns.",
      color: "from-amber-500/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10"
    }
  ];

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-gray-50 to-transparent dark:from-gray-900/50 dark:to-transparent -z-10" />
      <div className="absolute -left-64 top-1/4 w-96 h-96 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl -z-10" />
      <div className="absolute -right-64 bottom-1/4 w-96 h-96 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <Badge variant="outline" className="mb-4 px-3 py-1 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            Enterprise Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Sophisticated <span className="text-gradient">Features</span> for Complete Protection
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
            Our platform combines advanced simulation technology with comprehensive analytics and training to create a complete security awareness ecosystem.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <AnimatedCard
              key={index}
              className="overflow-hidden h-full border-0 shadow-lg"
              glowColor="rgba(59, 130, 246, 0.4)"
            >
              <div className="h-full rounded-xl p-6 bg-white dark:bg-gray-800 relative overflow-hidden">
                {/* Background gradient */}
                <div className={`absolute top-0 right-0 w-full h-32 bg-gradient-to-br ${feature.color} -z-10 opacity-50 rotate-12 translate-x-8 -translate-y-8 rounded-full blur-2xl`}></div>
                
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 flex items-center justify-center">
                    <feature.lucideIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </AnimatedCard>
          ))}
        </div>
        
        <div className="mt-24 md:mt-32">
          <GlassPanel className="p-8 md:p-12 rounded-2xl max-w-6xl mx-auto border border-white/20 dark:border-white/10 shadow-xl shadow-blue-500/5 dark:shadow-blue-500/10" intensity="light">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div>
                <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-none">Advanced Feature</Badge>
                <h3 className="text-3xl md:text-4xl font-bold mb-6">Advanced Risk Assessment</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                  Identify high-risk employees and departments through behavioral analysis and phishing simulation responses. Customize training paths based on specific vulnerabilities.
                </p>
                <ul className="space-y-4">
                  {[
                    "Role-based susceptibility analysis",
                    "Department vulnerability mapping",
                    "Behavioral pattern recognition",
                    "Custom risk scoring algorithms",
                    "Targeted intervention recommendations"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-3 mt-1 flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <span className="text-gray-600 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl overflow-hidden shadow-lg">
                <div className="p-1">
                  <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-lg font-medium mb-4">Risk Assessment Dashboard</h4>
                    <div className="aspect-video w-full overflow-hidden rounded-lg shadow-inner bg-white dark:bg-gray-900">
                      <img 
                        src="/lovable-uploads/f5d91462-4a22-42de-9ee6-1406b1391d82.png"
                        alt="Analytics Dashboard" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Risk Score</div>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">76%</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Awareness</div>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">82%</div>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Alerts</div>
                        <div className="text-lg font-bold text-amber-600 dark:text-amber-400">12</div>
                      </div>
                    </div>
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
