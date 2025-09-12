import React from "react";
import { Rocket, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const QuickStartContent: React.FC = () => {
  const steps = [
    {
      step: 1,
      title: "Account Setup",
      description: "Configure your LureX account and basic settings",
      time: "2 minutes",
      tasks: [
        "Complete profile information",
        "Set up organization details",
        "Configure notification preferences"
      ]
    },
    {
      step: 2,
      title: "Create Your First Campaign",
      description: "Set up a basic phishing simulation campaign",
      time: "3 minutes",
      tasks: [
        "Choose campaign type and template",
        "Configure basic settings",
        "Set campaign duration and schedule"
      ]
    },
    {
      step: 3,
      title: "Add Target Recipients",
      description: "Import or manually add your test recipients",
      time: "2 minutes",
      tasks: [
        "Upload CSV file or add manually",
        "Create target groups",
        "Verify email addresses"
      ]
    },
    {
      step: 4,
      title: "Launch & Monitor",
      description: "Deploy your campaign and track real-time results",
      time: "1 minute",
      tasks: [
        "Review campaign settings",
        "Launch the simulation",
        "Monitor live dashboard"
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Rocket className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Quick Start Guide</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Get your first phishing simulation up and running in under 10 minutes. 
          This guide will walk you through the essential steps to launch your first campaign.
        </p>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            <Clock className="h-3 w-3 mr-1" />
            8 minutes
          </Badge>
          <Badge variant="outline" className="bg-secondary/10">
            Beginner Friendly
          </Badge>
        </div>
      </div>

      {/* Prerequisites */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/20">
        <CardHeader>
          <CardTitle className="text-amber-800 dark:text-amber-200">Before You Start</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-amber-700 dark:text-amber-300">
            <li className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Have your target email list ready (CSV format recommended)</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Ensure you have proper authorization for testing</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Review your organization's security testing policies</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Step-by-Step Guide */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Step-by-Step Walkthrough</h2>
        
        {steps.map((step, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                    {step.step}
                  </div>
                  <span>{step.title}</span>
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {step.time}
                </Badge>
              </div>
              <CardDescription className="ml-11">
                {step.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="ml-11">
              <ul className="space-y-2">
                {step.tasks.map((task, taskIndex) => (
                  <li key={taskIndex} className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Demo */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Rocket className="h-5 w-5 text-primary" />
            <span>Try Interactive Demo</span>
          </CardTitle>
          <CardDescription>
            Experience the campaign creation process with our guided interactive demo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Walk through creating a sample campaign with dummy data to familiarize yourself with the interface.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• No real emails will be sent</li>
                <li>• Safe environment for learning</li>
                <li>• Takes about 5 minutes</li>
              </ul>
            </div>
            <Button className="whitespace-nowrap">
              Start Demo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
          <CardDescription>
            Once you've completed your first campaign, explore these advanced features:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Advanced Campaign Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Custom email templates with AI</li>
                <li>• Website cloning and custom pages</li>
                <li>• Automated campaign scheduling</li>
                <li>• Advanced targeting options</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Analytics & Reporting</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time campaign monitoring</li>
                <li>• Detailed user interaction reports</li>
                <li>• Custom dashboard creation</li>
                <li>• Export and compliance reports</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
