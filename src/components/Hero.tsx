import React from 'react';
import { ArrowRight, Terminal } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden bg-[#FFFFFF]">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.4]" style={{ 
        backgroundImage: 'radial-gradient(#E3E2E0 1px, transparent 1px)', 
        backgroundSize: '24px 24px' 
      }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Content */}
          <div className="text-left">
            {/* Badge */}
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-8 leading-[1.1]">
              <span className="text-black">CONVERT CHAOS INTO</span> <br />
              <span className="bg-black text-white px-2 decoration-clone box-decoration-clone">STRUCTURED LEGACY</span>
            </h1>
            
            
            <p className="text-base md:text-lg text-black mb-6 max-w-lg font-mono leading-relaxed">
               The AI-powered resume architect.<br/>
              Transform your career story into a stunning, professional resume in minutes.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
                <button 
                    onClick={onGetStarted}
                    className="group relative inline-flex items-center gap-3 bg-black text-white px-8 py-4 text-lg font-bold uppercase tracking-wider shadow-[8px_8px_0px_0px_#9B9A97] hover:shadow-[4px_4px_0px_0px_#9B9A97] hover:translate-x-[4px] hover:translate-y-[4px] transition-all border-2 border-black"
                >
                    Let's build
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
             <p className="mt-4 text-[10px] text-gray-600 uppercase tracking-widest font-mono">No sign up required • Free to try</p>

            {/* Footer info */}
            <div className="mt-12">
                <div className="inline-flex gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                    <span className="hover:text-black cursor-crosshair flex items-center gap-1"><Terminal size={12}/> v2.0.4 Stable</span>
                    <span className="hover:text-black cursor-crosshair">Secure TLS</span>
                </div>
            </div>
          </div>

          {/* Right Column: Prompt Screen */}
          <div className="relative mt-8 lg:mt-0 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Decorative background card */}
              <div className="absolute -top-2 -right-2 w-full h-full bg-gray-100 border-2 border-black transform rotate-1"></div>
              
              {/* Main prompt card */}
              <div className="relative bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_#000000]">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-black mb-2">Start Building</h3>
                  <p className="text-sm text-gray-600">Describe your perfect resume</p>
                </div>
                
                <div className="space-y-4">
                  <textarea
                    placeholder="e.g., 'I want a modern software engineer resume with clean layout...'"
                    className="w-full h-24 p-3 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:border-black text-sm font-mono placeholder-gray-400"
                  />
                  
                  <button 
                    onClick={onGetStarted}
                    className="w-full bg-black text-white px-4 py-3 font-bold text-sm uppercase tracking-wider border-2 border-black hover:bg-gray-800 transition-colors"
                  >
                    Generate Resume →
                  </button>
                </div>
                
                {/* Quick examples */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Quick starts:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-xs font-mono border border-gray-300 rounded">Software Engineer</span>
                    <span className="px-2 py-1 bg-gray-100 text-xs font-mono border border-gray-300 rounded">Designer</span>
                    <span className="px-2 py-1 bg-gray-100 text-xs font-mono border border-gray-300 rounded">Marketing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
