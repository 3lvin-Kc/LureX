
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Users, Globe, BarChart3, Shield, Target, Clock, CheckCircle } from "lucide-react";

export const CampaignSimulationHelper: React.FC = () => {
  const steps = [
    {
      icon: Mail,
      title: "Email Template",
      description: "Create or select a phishing email template that mimics legitimate communications",
      details: ["Realistic subject lines", "Professional formatting", "Social engineering tactics", "Call-to-action links"]
    },
    {
      icon: Users,
      title: "Target List",
      description: "Define your target audience with email addresses and personal information",
      details: ["Employee email addresses", "Names and departments", "Job titles and roles", "Custom personalization fields"]
    },
    {
      icon: Globe,
      title: "Landing Page",
      description: "Set up a phishing page that targets will see when they click the email link",
      details: ["Cloned legitimate websites", "Credential harvesting forms", "Fake login pages", "Tracking capabilities"]
    },
    {
      icon: Target,
      title: "Campaign Launch",
      description: "Execute the phishing simulation and monitor target interactions",
      details: ["Scheduled or immediate sending", "Email delivery tracking", "Click-through monitoring", "Data collection"]
    },
    {
      icon: BarChart3,
      title: "Results & Analytics",
      description: "Analyze the results to identify security awareness gaps",
      details: ["Email open rates", "Link click rates", "Credential submission", "Training recommendations"]
    }
  ];

  const metrics = [
    { label: "Email Delivered", description: "Percentage of emails successfully delivered", icon: CheckCircle },
    { label: "Emails Opened", description: "Users who opened the phishing email", icon: Mail },
    { label: "Links Clicked", description: "Users who clicked on malicious links", icon: Target },
    { label: "Data Submitted", description: "Users who entered credentials or data", icon: Shield },
    { label: "Reported as Phishing", description: "Users who correctly identified the threat", icon: CheckCircle }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            How Phishing Simulations Work
          </CardTitle>
          <CardDescription>
            Understanding the process of creating and executing effective phishing simulations for security awareness training
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-3">{step.description}</p>
                    <ul className="grid grid-cols-2 gap-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="text-sm text-gray-600 flex items-center gap-1">
                          <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Key Metrics & Analytics
          </CardTitle>
          <CardDescription>
            Important metrics to track during your phishing simulation campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">{metric.label}</h4>
                    <p className="text-sm text-muted-foreground">{metric.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Do's</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Get proper authorization before conducting simulations</li>
                <li>• Use realistic but identifiable phishing scenarios</li>
                <li>• Provide immediate feedback and training to participants</li>
                <li>• Track progress over time with multiple campaigns</li>
                <li>• Focus on education rather than punishment</li>
              </ul>
            </div>
            
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Don'ts</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Don't conduct simulations without proper approval</li>
                <li>• Avoid overly sophisticated attacks that could cause panic</li>
                <li>• Don't shame or penalize employees for falling for simulations</li>
                <li>• Avoid running campaigns during high-stress periods</li>
                <li>• Don't forget to provide follow-up training resources</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
