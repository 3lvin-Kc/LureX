import React from "react";
import { Palette, Code, Smartphone, Monitor } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const CustomPagesContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Palette className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Custom Pages</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Build custom phishing pages from scratch using our drag-and-drop editor 
          or code editor for maximum flexibility and realism.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page Builder Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <Palette className="h-6 w-6 text-primary mb-3" />
              <h4 className="font-medium mb-2">Visual Editor</h4>
              <p className="text-sm text-muted-foreground mb-3">Drag-and-drop interface for quick page creation</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Pre-built components</li>
                <li>• Real-time preview</li>
                <li>• No coding required</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <Code className="h-6 w-6 text-primary mb-3" />
              <h4 className="font-medium mb-2">Code Editor</h4>
              <p className="text-sm text-muted-foreground mb-3">Full HTML/CSS/JS control for advanced users</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Syntax highlighting</li>
                <li>• Live preview</li>
                <li>• Custom scripting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Page Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Login Form", type: "Credential Harvest", components: "Form, Logo, Footer" },
                { name: "Security Alert", type: "Urgency", components: "Alert, Timer, Action Button" },
                { name: "Software Update", type: "Download", components: "Progress Bar, Download Link" },
                { name: "Survey Page", type: "Information Gathering", components: "Multi-step Form" }
              ].map((template, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <Badge variant="secondary" className="text-xs">{template.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.components}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsive Design</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <Monitor className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium">Desktop</div>
                  <div className="text-xs text-muted-foreground">1920×1080</div>
                </div>
                <div className="text-center">
                  <Smartphone className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium">Mobile</div>
                  <div className="text-xs text-muted-foreground">375×667</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>All custom pages automatically adapt to different screen sizes for optimal user experience.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Advanced Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Interactive Elements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Form validation</li>
                <li>• Progress indicators</li>
                <li>• Modal dialogs</li>
                <li>• Countdown timers</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Tracking & Analytics</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Click tracking</li>
                <li>• Form submissions</li>
                <li>• Time on page</li>
                <li>• User behavior</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Security Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• SSL certificates</li>
                <li>• Domain masking</li>
                <li>• Access controls</li>
                <li>• Data encryption</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
