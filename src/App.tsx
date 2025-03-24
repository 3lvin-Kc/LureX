
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Templates from "./pages/Templates";
import Dashboard from "./pages/Dashboard";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Campaigns from "./pages/Campaigns";
import CreateCampaign from "./pages/CreateCampaign";
import TargetLists from "./pages/TargetLists";
import PhishingPages from "./pages/PhishingPages";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Pricing from "./pages/Pricing";
import Compliance from "./pages/Compliance";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import GDPRCompliance from "./pages/GDPRCompliance";
import CreatePhishingPage from "./pages/CreatePhishingPage";
import CloneWebsitePage from "./pages/CloneWebsitePage";
import PhishingPagePreview from "./pages/PhishingPagePreview";
import EditPhishingPage from "./pages/EditPhishingPage";
import CreateTemplate from "./pages/CreateTemplate";
import Guide from "./pages/Guide";

// Apply security headers
const applySecurityHeaders = () => {
  // Content Security Policy - Add dynamically to make it easier to apply in non-production environments
  const cspHeader = document.createElement('meta');
  cspHeader.httpEquiv = 'Content-Security-Policy';
  cspHeader.content = 
    "default-src 'self';" +
    "script-src 'self' 'unsafe-inline' https://apis.google.com;" + // Unlock as needed
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;" +
    "img-src 'self' data: https: blob:;" +
    "font-src 'self' https://fonts.gstatic.com;" +
    "connect-src 'self' https://*.supabase.co https://api.openai.com;" + // Add other APIs as needed
    "frame-src 'self';" +
    "object-src 'none';";
  
  // X-Content-Type-Options
  const xctoHeader = document.createElement('meta');
  xctoHeader.httpEquiv = 'X-Content-Type-Options';
  xctoHeader.content = 'nosniff';
  
  // X-Frame-Options
  const xfoHeader = document.createElement('meta');
  xfoHeader.httpEquiv = 'X-Frame-Options';
  xfoHeader.content = 'DENY';
  
  // Referrer-Policy
  const rpHeader = document.createElement('meta');
  rpHeader.httpEquiv = 'Referrer-Policy';
  rpHeader.content = 'strict-origin-when-cross-origin';
  
  // Add headers to document
  document.head.appendChild(cspHeader);
  document.head.appendChild(xctoHeader);
  document.head.appendChild(xfoHeader);
  document.head.appendChild(rpHeader);
  
  // Log that security headers were applied
  securityLogger.info(
    SecurityEventType.AUTHORIZATION,
    "Security headers applied to application"
  );
};

// Create a persistent query client that won't reset on page changes
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1, // Limit retries to prevent excessive requests on failure
    },
  },
});

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Apply security headers on app load
  useEffect(() => {
    applySecurityHeaders();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        
        // Log auth status
        if (session?.user) {
          securityLogger.info(
            SecurityEventType.AUTHENTICATION,
            "User session restored",
            { userId: session.user.id, email: session.user.email }
          );
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
        securityLogger.error(
          SecurityEventType.AUTHENTICATION,
          "Error checking user session",
          { error }
        );
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setUser(session?.user || null);
        
        // Log auth events with security logger
        if (event === 'SIGNED_IN') {
          securityLogger.info(
            SecurityEventType.AUTHENTICATION,
            "User signed in",
            { userId: session?.user.id, email: session?.user.email }
          );
        } else if (event === 'SIGNED_OUT') {
          securityLogger.info(
            SecurityEventType.AUTHENTICATION,
            "User signed out"
          );
        } else if (event === 'PASSWORD_RECOVERY') {
          securityLogger.info(
            SecurityEventType.AUTHENTICATION,
            "Password recovery initiated",
            { email: session?.user.email }
          );
        }
        
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setLoading(false);
        }
      }
    );

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  // Create an improved loading component that preserves UI context
  const LoadingScreen = () => (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-800 text-white">
      <div className="flex flex-col items-center">
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="text-lg font-medium mb-1">Loading</p>
        <p className="text-sm text-blue-200">Preparing your secure environment...</p>
      </div>
    </div>
  );

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!authChecked) return <LoadingScreen />;
    if (loading) return <LoadingScreen />;
    
    if (!user) {
      // Log unauthorized access attempt
      securityLogger.warn(
        SecurityEventType.AUTHORIZATION,
        "Unauthorized access attempt to protected route",
        { path: window.location.pathname }
      );
      
      return <Navigate to="/auth" replace />;
    }
    
    return <>{children}</>;
  };

  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    if (!authChecked) return <LoadingScreen />;
    if (loading) return <LoadingScreen />;
    if (user) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
            <Route path="/" element={<Index />} />
            <Route path="/features" element={<Features />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/help" element={<Help />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/gdpr" element={<GDPRCompliance />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
            <Route path="/campaign/new" element={<ProtectedRoute><CreateCampaign /></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
            <Route path="/template/new" element={<ProtectedRoute><CreateTemplate /></ProtectedRoute>} />
            <Route path="/template/:id/edit" element={<ProtectedRoute><CreateTemplate /></ProtectedRoute>} />
            <Route path="/template/:id/preview" element={<ProtectedRoute><CreateTemplate /></ProtectedRoute>} />
            <Route path="/template/:id/duplicate" element={<ProtectedRoute><CreateTemplate /></ProtectedRoute>} />
            <Route path="/template/:id/versions" element={<ProtectedRoute><CreateTemplate /></ProtectedRoute>} />
            <Route path="/phishing-pages" element={<ProtectedRoute><PhishingPages /></ProtectedRoute>} />
            <Route path="/target-lists" element={<ProtectedRoute><TargetLists /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/phishing-pages/new" element={<ProtectedRoute><CreatePhishingPage /></ProtectedRoute>} />
            <Route path="/phishing-pages/create-from-url" element={<ProtectedRoute><CloneWebsitePage /></ProtectedRoute>} />
            <Route path="/phishing-pages/:id/preview" element={<ProtectedRoute><PhishingPagePreview /></ProtectedRoute>} />
            <Route path="/phishing-pages/:id/edit" element={<ProtectedRoute><EditPhishingPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
