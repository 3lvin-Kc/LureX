
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import CreateCampaign from "./pages/CreateCampaign";
import EditCampaign from "./pages/EditCampaign";
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

import Settings from "./pages/Settings";
import Documentation from "./pages/Documentation";
import DomainManagement from "./pages/DomainManagement";
import Auth from "./pages/Auth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TemplatePreview from "./pages/TemplatePreview";


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <Toaster />
          <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/features" element={<Features />} />
            
            <Route path="/docs" element={<Documentation />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
            <Route path="/campaigns/new" element={<ProtectedRoute><CreateCampaign /></ProtectedRoute>} />
            <Route path="/campaigns/:id/edit" element={<ProtectedRoute><EditCampaign /></ProtectedRoute>} />
            <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
            <Route path="/templates/new" element={<ProtectedRoute><CreateTemplate /></ProtectedRoute>} />
            <Route path="/templates/:id/edit" element={<ProtectedRoute><CreateTemplate /></ProtectedRoute>} />
            <Route path="/templates/:id/preview" element={<ProtectedRoute><TemplatePreview /></ProtectedRoute>} />
            <Route path="/target-lists" element={<ProtectedRoute><TargetLists /></ProtectedRoute>} />
            <Route path="/target-lists/new" element={<ProtectedRoute><CreateTargetList /></ProtectedRoute>} />
            <Route path="/phishing-pages" element={<ProtectedRoute><PhishingPages /></ProtectedRoute>} />
            <Route path="/phishing-pages/new" element={<ProtectedRoute><CreatePhishingPage /></ProtectedRoute>} />
            <Route path="/phishing-pages/create-from-url" element={<ProtectedRoute><CloneWebsitePage /></ProtectedRoute>} />
            <Route path="/phishing-pages/:id/preview" element={<ProtectedRoute><PhishingPagePreview /></ProtectedRoute>} />
            <Route path="/phishing-pages/:id/edit" element={<ProtectedRoute><EditPhishingPage /></ProtectedRoute>} />
            <Route path="/domain-management" element={<ProtectedRoute><DomainManagement /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            
          </Routes>
        </Router>
        </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
