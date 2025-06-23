
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import CreateCampaign from "./pages/CreateCampaign";
import Templates from "./pages/Templates";
import CreateTemplate from "./pages/CreateTemplate";
import TargetLists from "./pages/TargetLists";
import CreateTargetList from "./pages/CreateTargetList";
import PhishingPages from "./pages/PhishingPages";
import CreatePhishingPage from "./pages/CreatePhishingPage";
import Reports from "./pages/Reports";
import Features from "./pages/Features";
import Help from "./pages/Help";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/features" element={<Features />} />
              <Route path="/help" element={<Help />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaigns/new" element={<CreateCampaign />} />
              <Route path="/campaign/new" element={<CreateCampaign />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/templates/new" element={<CreateTemplate />} />
              <Route path="/templates/:id/edit" element={<CreateTemplate />} />
              <Route path="/templates/:id/preview" element={<CreateTemplate />} />
              <Route path="/target-lists" element={<TargetLists />} />
              <Route path="/target-lists/new" element={<CreateTargetList />} />
              <Route path="/phishing-pages" element={<PhishingPages />} />
              <Route path="/phishing-pages/new" element={<CreatePhishingPage />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </AuthProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
