
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Mail, 
  Users, 
  BarChart3, 
  Shield, 
  Target, 
  Globe, 
  Bot, 
  Eye,
  MousePointer,
  FileText,
  Clock,
  CheckCircle
} from "lucide-react";

const Features = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Mail className="h-8 w-8" />,
      title: "Email Template Designer",
      description: "Create realistic phishing emails with our intuitive template editor and AI-powered generation.",
      highlights: ["AI Content Generation", "HTML/Text Support", "Template Library", "Version Control"]
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Target Management",
      description: "Organize and manage your test recipients with advanced targeting capabilities.",
      highlights: ["CSV Import/Export", "Department Filtering", "Custom Fields", "Bulk Operations"]
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Phishing Page Builder",
      description: "Create convincing fake login pages or clone existing websites for realistic simulations.",
      highlights: ["Website Cloning", "Custom Pages", "Mobile Responsive", "Form Capture"]
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Advanced Analytics",
      description: "Track campaign performance with detailed reporting and real-time analytics.",
      highlights: ["Real-time Tracking", "Department Reports", "Export Options", "Trend Analysis"]
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: "Email Tracking",
      description: "Monitor email opens, clicks, and user interactions with invisible tracking pixels.",
      highlights: ["Open Tracking", "Click Tracking", "Device Detection", "Geographic Data"]
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Security & Compliance",
      description: "Enterprise-grade security with compliance reporting for regulatory requirements.",
      highlights: ["Data Encryption", "GDPR Compliant", "Audit Trails", "Role-based Access"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate("/")}>
                <span className="text-xl font-bold text-primary">Phishing</span>
                <span className="text-xl font-bold ml-1">Guardian</span>
              </Button>
            </div>
            <Button onClick={() => navigate("/dashboard")}>
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="py-16 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="outline" className="mb-4">
            Enterprise Security Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Comprehensive Phishing
            <span className="text-primary block">Simulation Features</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Everything you need to test, educate, and strengthen your organization's security posture against phishing attacks.
          </p>
          <Button size="lg" onClick={() => navigate("/dashboard")}>
            Start Free Trial
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools needed for effective phishing simulations and security awareness training.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <div className="text-primary mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Workflow Section */}
      <div className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple 4-Step Process</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Launch comprehensive phishing simulations in minutes, not hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Import Targets</h3>
              <p className="text-gray-600">Upload your target list via CSV or add recipients manually.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Generate Content</h3>
              <p className="text-gray-600">Create email templates and phishing pages with AI assistance.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Launch Campaign</h3>
              <p className="text-gray-600">Schedule and deploy your phishing simulation campaign.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">4. Analyze Results</h3>
              <p className="text-gray-600">Review detailed analytics and generate compliance reports.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 bg-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Strengthen Your Security?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of organizations using PhishGuard to improve their security awareness.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/dashboard")}>
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Features;
