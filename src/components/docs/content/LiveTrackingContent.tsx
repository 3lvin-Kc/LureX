import React from "react";
import { Activity, Eye, Clock, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const LiveTrackingContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Activity className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Live Tracking</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Monitor your phishing campaigns in real-time with comprehensive tracking 
          and instant notifications for immediate response capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-1">247</div>
            <div className="text-sm text-muted-foreground">Emails Sent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">89</div>
            <div className="text-sm text-muted-foreground">Opened</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-amber-600 mb-1">34</div>
            <div className="text-sm text-muted-foreground">Clicked</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">12</div>
            <div className="text-sm text-muted-foreground">Submitted</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Real-Time Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: "2 min ago", action: "Email opened", user: "john.doe@company.com", status: "warning" },
              { time: "5 min ago", action: "Link clicked", user: "jane.smith@company.com", status: "danger" },
              { time: "8 min ago", action: "Form submitted", user: "mike.wilson@company.com", status: "danger" },
              { time: "12 min ago", action: "Email opened", user: "sarah.jones@company.com", status: "warning" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'danger' ? 'bg-red-500' : 
                    activity.status === 'warning' ? 'bg-amber-500' : 'bg-green-500'
                  }`}></div>
                  <div>
                    <div className="font-medium">{activity.action}</div>
                    <div className="text-sm text-muted-foreground">{activity.user}</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">{activity.time}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
