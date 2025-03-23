
import React from 'react';
import { Button } from "@/components/ui/button";
import GlassPanel from '../ui/GlassPanel';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleViewGuide = () => {
    navigate('/guide');
  };

  return (
    <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent -z-10" />
      
      {/* Background circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/30 dark:bg-blue-900/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-down">
            <span className="text-gradient">Strengthen</span> Your Security 
            <span className="text-gradient"> Defense</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 animate-fade-up animate-delay-100">
            Train your team against phishing threats through realistic simulations that identify vulnerabilities and build resilience.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-up animate-delay-200">
            <Button size="lg" className="rounded-full px-8" onClick={handleGetStarted}>
              {loading ? "Loading..." : (user ? "Go to Dashboard" : "Get Started")}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full px-8 flex items-center gap-2" 
              onClick={handleViewGuide}
            >
              <BookOpen size={18} />
              View Guide
            </Button>
          </div>
        </div>
        
        <div className="mt-16 md:mt-20 relative animate-fade-up animate-delay-300">
          <GlassPanel className="p-2 rounded-2xl shadow-xl mx-auto max-w-5xl">
            <div className="aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              {/* Updated with actual platform dashboard image */}
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="text-center p-6 flex flex-col items-center">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Comprehensive Phishing Defense Platform</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                    Create realistic phishing simulations, track user responses, and improve security awareness with our advanced platform.
                  </p>
                  <img 
                    src="/lovable-uploads/593ea609-4f84-4649-804c-d9f554b77a57.png" 
                    alt="Platform Screenshot" 
                    className="max-w-full max-h-[240px] rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>
          </GlassPanel>
          
          {/* Floating elements */}
          <div className="absolute -top-6 -right-4 md:top-8 md:right-0 animate-float">
            <GlassPanel className="p-3 rounded-lg shadow-lg" intensity="light">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">94% Detection Rate</span>
              </div>
            </GlassPanel>
          </div>
          
          <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:left-10 animate-float animate-delay-300">
            <GlassPanel className="p-3 rounded-lg shadow-lg" intensity="light">
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
