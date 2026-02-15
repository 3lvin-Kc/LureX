 import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowRight, 
  Github, 
  Sun,
  Moon
} from "lucide-react";

import { Hero } from "@/components/Hero";
import { LandingNavbar } from "@/components/LandingNavbar";

const EXAMPLE_PROMPTS = [
  "A login form with email/password validation and social sign-in buttons",
  "A product card with image, title, price, and add-to-cart button",
  "A settings toggle with smooth animation and theme integration",
  "A dashboard chart component with customizable data visualization"
];

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    // Simulate a delay then navigate to the editor page
    setTimeout(() => {
      navigate(`/editor`);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen relative bg-white">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.08)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Navigation */}
      <LandingNavbar onGetStarted={() => navigate('/editor')} />

      {/* Hero Section */}
      <Hero onGetStarted={() => navigate('/editor')} />

     
    </div>
  );
};

export default Index;