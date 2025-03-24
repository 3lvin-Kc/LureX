
import React from 'react';
import { Button } from "@/components/ui/button";
import GlassPanel from '../ui/GlassPanel';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import AnimatedBackground from '../3d/AnimatedBackground';
import Button3D from '../3d/Button3D';
import { motion } from 'framer-motion';

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

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <section className="relative min-h-screen pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden flex items-center">
      {/* 3D Animated Background */}
      <AnimatedBackground />
      
      {/* Content overlay */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10 w-full">
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-3d text-white"
            variants={item}
          >
            <span className="text-glow bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Strengthen</span> Your Security 
            <span className="text-glow bg-gradient-to-r from-purple-600 to-cyan-400 bg-clip-text text-transparent"> Defense</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-300 mb-8"
            variants={item}
          >
            Train your team against phishing threats through realistic simulations that identify vulnerabilities and build resilience.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4"
            variants={item}
          >
            <Button3D size="lg" onClick={handleGetStarted}>
              {loading ? "Loading..." : (user ? "Go to Dashboard" : "Get Started")}
            </Button3D>
            <Button3D 
              variant="outline" 
              size="lg"
              onClick={handleViewGuide}
              className="backdrop-blur-sm"
            >
              <BookOpen size={18} />
              View Guide
            </Button3D>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="mt-16 md:mt-20 relative"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8,
            delay: 0.5,
            type: "spring",
            stiffness: 50
          }}
        >
          <GlassPanel className="p-2 rounded-2xl shadow-xl mx-auto max-w-5xl backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10">
            <div className="aspect-[16/9] rounded-xl overflow-hidden">
              {/* Updated with actual platform dashboard image */}
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-900/40 to-indigo-900/40">
                <div className="text-center p-6 flex flex-col items-center">
                  <h3 className="text-xl font-semibold mb-4 text-white">Comprehensive Phishing Defense Platform</h3>
                  <p className="text-gray-200 max-w-md mb-8">
                    Create realistic phishing simulations, track user responses, and improve security awareness with our advanced platform.
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <img 
                      src="/lovable-uploads/593ea609-4f84-4649-804c-d9f554b77a57.png" 
                      alt="Platform Screenshot" 
                      className="max-w-full max-h-[240px] rounded-lg shadow-xl"
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </GlassPanel>
          
          {/* Floating elements with motion */}
          <motion.div 
            className="absolute -top-6 -right-4 md:top-8 md:right-0"
            animate={{ 
              y: [0, -10, 0],
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <GlassPanel className="p-3 rounded-lg shadow-lg backdrop-blur-md bg-white/20 dark:bg-black/30 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-white">94% Detection Rate</span>
              </div>
            </GlassPanel>
          </motion.div>
          
          <motion.div 
            className="absolute -bottom-4 -left-4 md:-bottom-6 md:left-10"
            animate={{ 
              y: [0, 10, 0],
            }}
            transition={{ 
              duration: 4,
              delay: 1,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <GlassPanel className="p-3 rounded-lg shadow-lg backdrop-blur-md bg-white/20 dark:bg-black/30 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium text-white">320+ Phishing Templates</span>
              </div>
            </GlassPanel>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
