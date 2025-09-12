import React from "react";
import { Puzzle, Zap, Database, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const IntegrationsContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Puzzle className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Integrations</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Connect LureX with your existing security tools and workflows to create 
          a seamless security awareness ecosystem.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <Database className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium mb-2">Active Directory</h4>
              <p className="text-sm text-muted-foreground mb-3">Sync user data and groups</p>
              <Button size="sm" variant="outline">Configure</Button>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <Mail className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium mb-2">SMTP Servers</h4>
              <p className="text-sm text-muted-foreground mb-3">Custom email delivery</p>
              <Button size="sm" variant="outline">Setup</Button>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <Zap className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium mb-2">SIEM Tools</h4>
              <p className="text-sm text-muted-foreground mb-3">Security event correlation</p>
              <Button size="sm" variant="outline">Connect</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <h4 className="font-medium mb-2">REST API Endpoints</h4>
                <div className="font-mono text-sm space-y-1">
                  <div>POST /api/campaigns</div>
                  <div>GET /api/reports</div>
                  <div>PUT /api/users</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Authentication</h4>
                <p className="text-sm text-muted-foreground">API key-based authentication with rate limiting</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Webhook Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">Campaign Events</h4>
                <p className="text-sm text-muted-foreground">Real-time notifications for campaign activities</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium">User Actions</h4>
                <p className="text-sm text-muted-foreground">Immediate alerts for security incidents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
