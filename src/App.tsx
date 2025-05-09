
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Templates from "./pages/Templates";
import Dashboard from "./pages/Dashboard";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
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
  // Apply security headers on app load
  useEffect(() => {
    applySecurityHeaders();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaign/new" element={<CreateCampaign />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/template/new" element={<CreateTemplate />} />
            <Route path="/template/:id/edit" element={<CreateTemplate />} />
            <Route path="/template/:id/preview" element={<CreateTemplate />} />
            <Route path="/template/:id/duplicate" element={<CreateTemplate />} />
            <Route path="/template/:id/versions" element={<CreateTemplate />} />
            <Route path="/phishing-pages" element={<PhishingPages />} />
            <Route path="/target-lists" element={<TargetLists />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/phishing-pages/new" element={<CreatePhishingPage />} />
            <Route path="/phishing-pages/create-from-url" element={<CloneWebsitePage />} />
            <Route path="/phishing-pages/:id/preview" element={<PhishingPagePreview />} />
            <Route path="/phishing-pages/:id/edit" element={<EditPhishingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
