import React from "react";
import { Rocket, Target, Mail, Calendar, Users, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const CreateCampaignContent: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Rocket className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Create Campaign</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Learn how to create effective phishing simulation campaigns that test your organization's 
          security awareness and provide valuable insights.
        </p>
      </div>

      {/* Campaign Types */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Types</CardTitle>
          <CardDescription>Choose the right campaign type for your security testing goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <Mail className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium mb-2">Email Phishing</h4>
              <p className="text-sm text-muted-foreground">Traditional email-based phishing attacks targeting credentials or information</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <Target className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium mb-2">Spear Phishing</h4>
              <p className="text-sm text-muted-foreground">Targeted attacks using personalized information and social engineering</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <Settings className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium mb-2">Custom Campaign</h4>
              <p className="text-sm text-muted-foreground">Build your own campaign with specific templates and targeting rules</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Process */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Campaign Creation Process</h2>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <span>Campaign Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Campaign name and description</li>
                    <li>• Campaign type selection</li>
                    <li>• Testing objectives</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Scheduling</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Start date and time</li>
                    <li>• Campaign duration</li>
                    <li>• Time zone configuration</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <span>Template Selection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">Choose from pre-built templates or create custom content</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-1">AI-Generated Templates</h4>
                    <p className="text-sm text-muted-foreground">Let AI create realistic phishing emails based on current threats</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-1">Template Library</h4>
                    <p className="text-sm text-muted-foreground">Choose from our collection of proven phishing templates</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <span>Target Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Recipient Selection</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Import from CSV/Excel</li>
                    <li>• Select from existing groups</li>
                    <li>• Manual entry</li>
                    <li>• Active Directory integration</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Targeting Options</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Department-based targeting</li>
                    <li>• Role-based selection</li>
                    <li>• Random sampling</li>
                    <li>• Custom filters</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interactive Demo */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle>Try Campaign Builder</CardTitle>
          <CardDescription>
            Experience the campaign creation process with our interactive demo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Walk through creating a sample campaign with guided assistance
              </p>
              <Badge variant="secondary">No emails sent • Safe environment</Badge>
            </div>
            <Button>Launch Demo</Button>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Planning Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Start with a small test group</li>
                <li>• Choose realistic scenarios</li>
                <li>• Set clear objectives</li>
                <li>• Plan follow-up training</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Execution Guidelines</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Monitor campaign progress</li>
                <li>• Be ready to stop if needed</li>
                <li>• Document lessons learned</li>
                <li>• Provide immediate feedback</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
