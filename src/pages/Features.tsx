import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Mail, Users, BarChart3, Shield, Target, Globe, Bot, Eye, MousePointer, FileText, Clock, CheckCircle } from "lucide-react";
const Features = () => {
  const navigate = useNavigate();
  const features = [{
    icon: <Mail className="h-8 w-8" />,
    title: "Email Template Designer",
    description: "Create realistic phishing emails with our intuitive template editor and AI-powered generation.",
    highlights: ["AI Content Generation", "HTML/Text Support", "Template Library", "Version Control"]
  }, {
    icon: <Users className="h-8 w-8" />,
    title: "Target Management",
    description: "Organize and manage your test recipients with advanced targeting capabilities.",
    highlights: ["CSV Import/Export", "Department Filtering", "Custom Fields", "Bulk Operations"]
  }, {
    icon: <Globe className="h-8 w-8" />,
    title: "Phishing Page Builder",
    description: "Create convincing fake login pages or clone existing websites for realistic simulations.",
    highlights: ["Website Cloning", "Custom Pages", "Mobile Responsive", "Form Capture"]
  }, {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "Advanced Analytics",
    description: "Track campaign performance with detailed reporting and real-time analytics.",
    highlights: ["Real-time Tracking", "Department Reports", "Export Options", "Trend Analysis"]
  }, {
    icon: <Eye className="h-8 w-8" />,
    title: "Email Tracking",
    description: "Monitor email opens, clicks, and user interactions with invisible tracking pixels.",
    highlights: ["Open Tracking", "Click Tracking"]
  }, {
    icon: <Shield className="h-8 w-8" />,
    title: "Security & Compliance",
    description: "Enterprise-grade security with compliance reporting for regulatory requirements.",
    highlights: ["Data Encryption", "GDPR Compliant", "Audit Trails", "Role-based Access"]
  }];
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate("/")}>
                <Shield className="h-6 w-6 text-primary mr-2" />
                <span className="text-xl font-bold text-primary">LureX</span>
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate("/dashboard")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Comprehensive Phishing
            <span className="text-primary block">Simulation Features</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Everything you need to test, educate, and strengthen your organization's security posture against phishing attacks.
          </p>
          <Button size="lg" onClick={() => navigate("/dashboard")}>
            Start Free 
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools needed for effective phishing simulations and security awareness training.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => <Card key={index} className="h-full">
                <CardHeader>
                  <div className="text-primary mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight, i) => <li key={i} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {highlight}
                      </li>)}
                  </ul>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>

      {/* Workflow Section */}
      <div className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple 4-Step Process</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Launch comprehensive phishing simulations in minutes, not hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Import Targets</h3>
              <p className="text-muted-foreground">Upload your target list via CSV or add recipients manually.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Generate Content</h3>
              <p className="text-muted-foreground">Create email templates and phishing pages with AI assistance.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Launch Campaign</h3>
              <p className="text-muted-foreground">Schedule and deploy your phishing simulation campaign.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">4. Analyze Results</h3>
              <p className="text-muted-foreground">Review detailed analytics and generate compliance reports.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      
    </div>;
};
export default Features;