/**
 * LandingNavbar.tsx — Navigation bar for the landing page.
 * Single responsibility: landing page navigation with links and Get Started button.
 */
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface LandingNavbarProps {
  onGetStarted: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onGetStarted }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm border-gray-200 py-2'
          : 'bg-transparent border-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer group hover:opacity-70 transition-opacity"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="bg-black text-white p-1 rounded-sm">
            <span className="font-bold text-lg px-1">R</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-black">Resumify.ai</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="text-sm text-black hover:bg-gray-100 px-2 py-1 rounded-sm transition-colors">How it Works</a>
          <a href="#features" className="text-sm text-black hover:bg-gray-100 px-2 py-1 rounded-sm transition-colors">Features</a>
          <a href="#templates" className="text-sm text-black hover:bg-gray-100 px-2 py-1 rounded-sm transition-colors">Templates</a>
          <div className="h-4 w-px bg-gray-300"></div>
          <button
            onClick={onGetStarted}
            className="bg-black hover:bg-gray-800 text-white text-sm font-bold py-2 px-4 rounded-md transition-all shadow-sm"
          >
            Get Started
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-black"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-md md:hidden flex flex-col p-4">
          <a href="#how-it-works" className="py-3 px-4 text-black hover:bg-gray-100 rounded-sm" onClick={() => setIsMobileMenuOpen(false)}>How it Works</a>
          <a href="#features" className="py-3 px-4 text-black hover:bg-gray-100 rounded-sm" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
          <a href="#templates" className="py-3 px-4 text-black hover:bg-gray-100 rounded-sm" onClick={() => setIsMobileMenuOpen(false)}>Templates</a>
          <div className="h-px bg-gray-300 my-2"></div>
          <button className="py-3 px-4 text-left text-gray-600 hover:bg-gray-100 rounded-sm">Log in</button>
          <button
            onClick={() => {
              onGetStarted();
              setIsMobileMenuOpen(false);
            }}
            className="mt-2 w-full bg-black text-white py-3 rounded-md font-bold"
          >
            Get Started
          </button>
        </div>
      )}
    </header>
  );
};
