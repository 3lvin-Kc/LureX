
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, BarChart3, Mail, Target, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Templates",
      description: "Create realistic phishing emails with AI-powered content generation"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Target Management",
      description: "Organize and manage your test recipients with advanced targeting"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Phishing Pages",
      description: "Build convincing fake login pages or clone existing websites"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analytics & Reports",
      description: "Track campaign performance with detailed analytics and reporting"
    }
  ];

  const benefits = [
    "Reduce successful phishing attacks by up to 90%",
    "Improve security awareness across your organization",
    "Generate compliance reports for regulatory requirements",
    "Identify vulnerable users and departments",
    "Track improvement over time with detailed analytics"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Button variant="ghost" onClick={() => navigate("/features")}>
                Features
              </Button>
              <Button variant="ghost" onClick={() => navigate("/help")}>
                Help
              </Button>
              <Button variant="ghost" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button onClick={() => navigate("/dashboard")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 bg-white/50">
            🚀 Advanced Phishing Simulation Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            LureX Security
            <span className="text-blue-600 block">Security Posture</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Train your employees to recognize and respond to phishing attacks with realistic simulations, 
            comprehensive reporting, and AI-powered content generation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/dashboard")} className="text-lg px-8">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/features")} className="text-lg px-8">
              View Features
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Index;
