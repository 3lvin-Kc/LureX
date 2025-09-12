import React from "react";
import { HelpCircle, AlertTriangle, CheckCircle, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const TroubleshootingContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Troubleshooting</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Find solutions to common issues and get your phishing simulations running smoothly.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Common Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                issue: "Emails not being delivered",
                solution: "Check SMTP settings and domain reputation",
                severity: "high"
              },
              {
                issue: "Landing pages not loading",
                solution: "Verify DNS configuration and SSL certificates",
                severity: "high"
              },
              {
                issue: "Tracking not working",
                solution: "Ensure tracking pixels are properly embedded",
                severity: "medium"
              },
              {
                issue: "Users not receiving training",
                solution: "Check automation workflows and user permissions",
                severity: "medium"
              }
            ].map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{item.issue}</h4>
                  <Badge variant={item.severity === 'high' ? 'destructive' : 'secondary'}>
                    {item.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.solution}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Fixes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-2 bg-green-50/50 dark:bg-green-900/20 rounded">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Clear browser cache and cookies</span>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-green-50/50 dark:bg-green-900/20 rounded">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Verify email whitelist settings</span>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-green-50/50 dark:bg-green-900/20 rounded">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Check firewall and proxy settings</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Service</span>
                <Badge variant="default">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Landing Pages</span>
                <Badge variant="default">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Analytics</span>
                <Badge variant="secondary">Maintenance</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API Services</span>
                <Badge variant="default">Operational</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
