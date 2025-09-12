import React from "react";
import { LifeBuoy, Mail, MessageCircle, Book, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const SupportContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <LifeBuoy className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Support</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Get help when you need it with our comprehensive support resources and expert assistance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center hover:bg-accent/50 transition-colors">
              <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
              <h4 className="font-medium mb-2">Email Support</h4>
              <p className="text-sm text-muted-foreground mb-3">Get detailed help via email</p>
              <Badge variant="secondary" className="mb-3">24-48 hours</Badge>
              <Button size="sm" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </div>
            <div className="p-4 border rounded-lg text-center hover:bg-accent/50 transition-colors">
              <MessageCircle className="h-8 w-8 text-primary mx-auto mb-3" />
              <h4 className="font-medium mb-2">Live Chat</h4>
              <p className="text-sm text-muted-foreground mb-3">Instant help from our team</p>
              <Badge variant="default" className="mb-3">Available now</Badge>
              <Button size="sm" className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
            </div>
            <div className="p-4 border rounded-lg text-center hover:bg-accent/50 transition-colors">
              <Book className="h-8 w-8 text-primary mx-auto mb-3" />
              <h4 className="font-medium mb-2">Knowledge Base</h4>
              <p className="text-sm text-muted-foreground mb-3">Self-service articles</p>
              <Badge variant="outline" className="mb-3">24/7 Access</Badge>
              <Button size="sm" variant="outline" className="w-full">
                <Book className="h-4 w-4 mr-2" />
                Browse Articles
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Support Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm font-medium">Live Chat</span>
                <span className="text-sm text-muted-foreground">Mon-Fri 9AM-6PM EST</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm font-medium">Email Support</span>
                <span className="text-sm text-muted-foreground">24/7</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm font-medium">Emergency Support</span>
                <span className="text-sm text-muted-foreground">24/7 (Enterprise)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Helpful Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">Video Tutorials</span>
                <Button size="sm" variant="ghost">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">Community Forum</span>
                <Button size="sm" variant="ghost">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">API Documentation</span>
                <Button size="sm" variant="ghost">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Before Contacting Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Information to Include</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Detailed description of the issue</li>
                <li>• Steps to reproduce the problem</li>
                <li>• Screenshots or error messages</li>
                <li>• Browser and operating system details</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Quick Checks</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Check system status page</li>
                <li>• Review troubleshooting guide</li>
                <li>• Clear browser cache</li>
                <li>• Try different browser/device</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
