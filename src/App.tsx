
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
import Analytics from "./pages/Analytics";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Campaigns from "./pages/Campaigns";
import CreateCampaign from "./pages/CreateCampaign";
import TargetLists from "./pages/TargetLists";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
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

  // Define protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/auth" replace />;
    return <>{children}</>;
  };

  // Define public route component (accessible only when NOT logged in)
  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
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
            {/* Public routes (redirect to dashboard if logged in) */}
            <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
            
            {/* Landing pages (accessible to all, but with login prompt for features) */}
            <Route path="/" element={<Index />} />
            <Route path="/features" element={<Features />} />
            <Route path="/help" element={<Help />} />
            
            {/* Protected routes (require authentication) */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
            <Route path="/campaign/new" element={<ProtectedRoute><CreateCampaign /></ProtectedRoute>} />
            <Route path="/target-lists" element={<ProtectedRoute><TargetLists /></ProtectedRoute>} />
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
