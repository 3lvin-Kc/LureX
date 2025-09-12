import React from "react";
import { Shield, Target, Mail, BarChart3, Users, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const OverviewContent: React.FC = () => {
  const features = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "AI-Powered Email Templates",
      description: "Generate realistic phishing emails with advanced AI that mimics real-world threats"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Website Cloning & Custom Pages",
      description: "Clone existing websites or create custom phishing pages with pixel-perfect accuracy"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Advanced Target Management",
      description: "Organize recipients into groups, track individual responses, and manage campaigns"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Real-Time Analytics",
      description: "Monitor campaign performance with live tracking and comprehensive reporting"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">LureX Platform Overview</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          LureX is a comprehensive phishing simulation platform designed to help organizations 
          strengthen their security posture through realistic, controlled phishing campaigns.
        </p>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            Security Training
          </Badge>
          <Badge variant="outline" className="bg-secondary/10">
            Real-World Simulation
          </Badge>
          <Badge variant="outline" className="bg-accent/10">
            Advanced Analytics
          </Badge>
        </div>
      </div>

      {/* What is LureX */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>What is LureX?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            LureX empowers security teams to conduct sophisticated phishing simulations that mirror 
            real-world attack scenarios. Our platform combines AI-powered content generation with 
            advanced tracking capabilities to deliver comprehensive security awareness training.
          </p>
          <div className="bg-accent/20 p-4 rounded-lg border-l-4 border-primary">
            <p className="text-sm font-medium text-foreground">
              <strong>Mission:</strong> F*ck awareness posters — Run Real Phishing Ops
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Move beyond static training materials to dynamic, interactive security education.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {feature.icon}
                  </div>
                  <span className="text-lg">{feature.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle>Ready to Get Started?</CardTitle>
          <CardDescription>
            Follow our quick start guide to launch your first phishing simulation in minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-2">Next Steps:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complete platform setup</li>
                <li>• Create your first campaign</li>
                <li>• Configure email templates</li>
                <li>• Launch and monitor results</li>
              </ul>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-2">Need Help?</h4>
              <p className="text-sm text-muted-foreground">
                Check out our comprehensive guides in the sidebar or contact our support team 
                for personalized assistance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
