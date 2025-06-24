
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
import CloneWebsitePage from "./pages/CloneWebsitePage";
import PhishingPagePreview from "./pages/PhishingPagePreview";
import EditPhishingPage from "./pages/EditPhishingPage";
import Reports from "./pages/Reports";
import Features from "./pages/Features";
import Help from "./pages/Help";
import Settings from "./pages/Settings";

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
              <Route path="/phishing-pages/create-from-url" element={<CloneWebsitePage />} />
              <Route path="/phishing-pages/:id/preview" element={<PhishingPagePreview />} />
              <Route path="/phishing-pages/:id/edit" element={<EditPhishingPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </AuthProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
