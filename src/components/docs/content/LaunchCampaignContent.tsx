import React from "react";
import { Rocket, Play, Pause,Square, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const LaunchCampaignContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Rocket className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Launch Campaign</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Deploy your phishing simulation campaigns with confidence using our comprehensive 
          launch checklist and real-time monitoring tools.
        </p>
      </div>

      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/20">
        <CardHeader>
          <CardTitle className="text-amber-800 dark:text-amber-200 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Pre-Launch Checklist</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-amber-800 dark:text-amber-200">Campaign Setup</h4>
              <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
                <li>□ Campaign details verified</li>
                <li>□ Email templates tested</li>
                <li>□ Target recipients confirmed</li>
                <li>□ Landing pages functional</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-amber-800 dark:text-amber-200">Authorization</h4>
              <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
                <li>□ Management approval obtained</li>
                <li>□ Legal compliance verified</li>
                <li>□ IT team notified</li>
                <li>□ Emergency contacts ready</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Launch Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Immediate Launch</h4>
                  <Badge variant="secondary">Instant</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Start the campaign immediately</p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Scheduled Launch</h4>
                  <Badge variant="outline">Planned</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Set specific date and time</p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Phased Rollout</h4>
                  <Badge variant="outline">Gradual</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Deploy in stages over time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button size="sm" className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Launch
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button size="sm" variant="destructive" className="flex-1">
              <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Campaign controls allow real-time management of active simulations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Real-Time Monitoring</CardTitle>
          <CardDescription>Track campaign performance as it happens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary mb-1">247</div>
              <div className="text-sm text-muted-foreground">Emails Sent</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">89</div>
              <div className="text-sm text-muted-foreground">Opened</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-amber-600 mb-1">34</div>
              <div className="text-sm text-muted-foreground">Clicked</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-red-600 mb-1">12</div>
              <div className="text-sm text-muted-foreground">Submitted</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
