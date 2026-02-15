import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  ArrowLeft,
  Search,
  AlertCircle
} from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={`min-h-screen relative ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      {/* Background pattern */}
      <div className={`absolute inset-0 ${isDarkMode ? 
        'bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)]' : 
        'bg-[linear-gradient(rgba(0,0,0,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.08)_1px,transparent_1px)]'} bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_110%)]`} />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className={`max-w-2xl w-full text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          
          {/* 404 Display */}
          <div className="mb-8">
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-2xl ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'} mb-6 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-pulse" />
              <span className={`text-6xl font-bold ${isDarkMode ? 'text-white' : 'text-black'} relative z-10`}>404</span>
            </div>
            
            {/* Error Icon */}
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${isDarkMode ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-100 border border-red-200'} mb-6`}>
              <AlertCircle className={`w-6 h-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
            </div>
          </div>

          {/* Main Content */}
          <h1 className={`text-4xl md:text-5xl font-bold tracking-tighter mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Page Not Found
          </h1>
          
          <p className={`text-lg md:text-xl mb-8 max-w-md mx-auto leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>

          {/* Path Information */}
          <div className={`inline-flex items-center gap-2 ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'} px-4 py-2 rounded-lg text-sm font-mono mb-8`}>
            <Search className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              {location.pathname}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleGoHome}
              className={`${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2`}
            >
              <Home className="w-4 h-4" />
              Go to Homepage
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleGoBack}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                isDarkMode 
                  ? 'border border-white/20 bg-white/5 hover:bg-white/10 text-white hover:text-white' 
                  : 'border border-gray-300 bg-white hover:bg-gray-50 text-black hover:text-black'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>

          {/* Help Text */}
          <div className={`mt-12 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <p>If you believe this is an error, please contact our support team.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
