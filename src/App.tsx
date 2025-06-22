
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import PrivateRoute from "@/components/auth/PrivateRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Campaigns from "./pages/Campaigns";
import CreateCampaign from "./pages/CreateCampaign";
import EmailTemplates from "./pages/EmailTemplates";
import TargetLists from "./pages/TargetLists";
import PhishingPages from "./pages/PhishingPages";
import CreatePhishingPage from "./pages/CreatePhishingPage";
import Reports from "./pages/Reports";
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
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              <Route path="/campaigns" element={
                <PrivateRoute>
                  <Campaigns />
                </PrivateRoute>
              } />
              
              <Route path="/campaigns/new" element={
                <PrivateRoute>
                  <CreateCampaign />
                </PrivateRoute>
              } />
              
              <Route path="/email-templates" element={
                <PrivateRoute>
                  <EmailTemplates />
                </PrivateRoute>
              } />
              
              <Route path="/target-lists" element={
                <PrivateRoute>
                  <TargetLists />
                </PrivateRoute>
              } />
              
              <Route path="/phishing-pages" element={
                <PrivateRoute>
                  <PhishingPages />
                </PrivateRoute>
              } />
              
              <Route path="/phishing-pages/new" element={
                <PrivateRoute>
                  <CreatePhishingPage />
                </PrivateRoute>
              } />
              
              <Route path="/reports" element={
                <PrivateRoute>
                  <Reports />
                </PrivateRoute>
              } />
              
              <Route path="/settings" element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              } />
            </Routes>
          </AuthProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
