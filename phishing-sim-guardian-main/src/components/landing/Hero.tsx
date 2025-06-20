import React from 'react';
import { Button } from "@/components/ui/button";
import GlassPanel from '../ui/GlassPanel';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const handleViewGuide = () => {
    navigate('/guide');
  };

  return (
    <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent -z-10" />
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-200/40 to-purple-200/30 dark:from-blue-900/20 dark:to-purple-900/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-200/30 to-indigo-200/20 dark:from-cyan-900/10 dark:to-indigo-900/10 rounded-full blur-3xl -z-10" />
      
      {/* Floating elements */}
      <div className="absolute top-1/4 right-1/4 animate-float animate-delay-200">
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md shadow-lg rounded-full p-3 border border-white/20">
          <ShieldCheck className="w-6 h-6 text-cyan-500" />
        </div>
      </div>

      <div className="absolute bottom-1/4 left-1/3 animate-float animate-delay-500">
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-md shadow-lg rounded-full p-3 border border-white/20">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-6 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm font-medium">
            <span className="mr-1">🚀</span> Next-Generation Security Training
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-down flex flex-col items-center mt-8">
            <span className="relative inline-block min-h-[2.5em]">
              {/* Handwritten 'phish' above 'fuck' */}
              <span
                className="absolute left-1/2 -top-7 -translate-x-1/2 text-blue-500 select-none drop-shadow-md"
                style={{ fontFamily: 'Caveat, cursive', fontSize: '2.5rem', lineHeight: 1, pointerEvents: 'none', fontWeight: 700 }}
              >
                phish
              </span>
              {/* Struck-through 'fuck' with pill background */}
              <span
                className="line-through text-gray-800 dark:text-gray-200 text-4xl md:text-5xl font-bold bg-white/90 dark:bg-gray-900/70 rounded-full px-6 py-1 shadow relative z-10 transition-all duration-200 hover:bg-blue-100 hover:dark:bg-blue-900/60 hover:scale-105 cursor-pointer"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                fuck
              </span>
              {/* 'you' next to it, bold and blue */}
              <span className="ml-4 text-4xl md:text-5xl font-bold text-blue-500 drop-shadow-sm align-middle" style={{ fontFamily: 'Montserrat, sans-serif' }}>you</span>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 animate-fade-up animate-delay-100 leading-relaxed">
            Train your organization against sophisticated phishing attacks through 
            <span className="text-blue-600 dark:text-blue-400 font-medium"> realistic simulations</span> that identify vulnerabilities and build resilience.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-up animate-delay-200">
            <Button size="lg" className="rounded-full px-8 py-6 text-lg shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all" onClick={handleGetStarted}>
              {loading ? (
                <span className="inline-flex items-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Loading...
                </span>
              ) : (
                <span className="inline-flex items-center">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              )}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full px-8 py-6 text-lg border-2 flex items-center gap-2 backdrop-blur-sm bg-white/50 dark:bg-black/20" 
              onClick={handleViewGuide}
            >
              <BookOpen size={20} />
              View Security Guide
            </Button>
          </div>

          <div className="mt-8 flex justify-center gap-8 text-sm text-gray-500 dark:text-gray-400 animate-fade-up animate-delay-300">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>99.8% Detection Rate</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>Enterprise Grade</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              <span>SOC 2 Compliant</span>
            </div>
          </div>
        </div>
        
        <div className="mt-20 md:mt-28 relative animate-fade-up animate-delay-300">
          <GlassPanel className="p-3 md:p-4 rounded-2xl shadow-xl shadow-blue-500/5 dark:shadow-blue-500/10 mx-auto max-w-5xl overflow-hidden border border-white/20 dark:border-white/10">
            <div className="rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 aspect-[16/9] relative">
              <div className="absolute inset-0 w-full h-full">
                <img 
                  src="/lovable-uploads/593ea609-4f84-4649-804c-d9f554b77a57.png" 
                  alt="Platform Dashboard" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent dark:from-black/60"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Advanced Phishing Simulation Platform</h3>
                  <p className="text-white/90 max-w-2xl mb-4">
                    Create realistic multi-vector phishing campaigns, track responses in real-time, and deliver targeted training.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/40"
                    onClick={handleGetStarted}
                  >
                    Explore Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </GlassPanel>
          
          {/* Floating stats */}
          <div className="absolute -top-6 -right-4 md:top-10 md:right-0 animate-float">
            <GlassPanel className="p-3 rounded-lg shadow-lg border border-white/20" intensity="light">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">94% Detection Rate</span>
              </div>
            </GlassPanel>
          </div>
          
          <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:left-10 animate-float animate-delay-300">
            <GlassPanel className="p-3 rounded-lg shadow-lg border border-white/20" intensity="light">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium">320+ Phishing Templates</span>
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
