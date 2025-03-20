
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Templates from "./pages/Templates";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Campaigns from "./pages/Campaigns";
import TargetLists from "./pages/TargetLists";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/features" element={<Features />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/help" element={<Help />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/target-lists" element={<TargetLists />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
