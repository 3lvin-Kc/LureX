import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error("Error checking auth session:", error);
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setUser(session?.user || null);
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setLoading(false);
        }
      }
    );

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!authChecked) return <LoadingScreen />;
    if (loading) return <LoadingScreen />;
    if (!user) return <Navigate to="/auth" replace />;
    return <>{children}</>;
  };

  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    if (!authChecked) return <LoadingScreen />;
    if (loading) return <LoadingScreen />;
    if (user) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
  };

  const LoadingScreen = () => (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading application...</p>
      </div>
    </div>
  );

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
            <Route path="/phishing-pages/new" element={<CreatePhishingPage />} />
            <Route path="/phishing-pages/create-from-url" element={<CloneWebsitePage />} />
            <Route path="/phishing-pages/:id/preview" element={<PhishingPagePreview />} />
            <Route path="/phishing-pages/:id/edit" element={<ProtectedRoute><EditPhishingPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
