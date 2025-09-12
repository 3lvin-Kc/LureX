import React from "react";
import { Repeat, Clock, Calendar, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const AutomationContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Repeat className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Automation</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Automate your phishing simulation campaigns with scheduled deployments, 
          recurring tests, and intelligent follow-up actions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automation Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <Calendar className="h-6 w-6 text-primary mb-3" />
              <h4 className="font-medium mb-2">Scheduled Campaigns</h4>
              <p className="text-sm text-muted-foreground mb-3">Set up campaigns to run at specific times</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• One-time scheduled deployment</li>
                <li>• Recurring campaign schedules</li>
                <li>• Time zone aware scheduling</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <Zap className="h-6 w-6 text-primary mb-3" />
              <h4 className="font-medium mb-2">Smart Follow-ups</h4>
              <p className="text-sm text-muted-foreground mb-3">Automated responses based on user actions</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Training assignment triggers</li>
                <li>• Manager notifications</li>
                <li>• Remedial action workflows</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recurring Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Monthly Security Test</h4>
                  <Badge variant="default">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">First Monday of each month at 9:00 AM</p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Quarterly Assessment</h4>
                  <Badge variant="secondary">Scheduled</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Every 3 months, random day/time</p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">New Hire Training</h4>
                  <Badge variant="outline">Triggered</Badge>
                </div>
                <p className="text-sm text-muted-foreground">30 days after employee start date</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">User Clicked Link</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>→ Send immediate training module</div>
                  <div>→ Notify security team</div>
                  <div>→ Schedule follow-up test in 2 weeks</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Credentials Submitted</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>→ Mandatory security training</div>
                  <div>→ Manager notification</div>
                  <div>→ Password reset requirement</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automation Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Schedule Options</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Daily, weekly, monthly</li>
                <li>• Custom intervals</li>
                <li>• Business hours only</li>
                <li>• Holiday exclusions</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Target Rotation</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Random user selection</li>
                <li>• Department rotation</li>
                <li>• Risk-based targeting</li>
                <li>• Exclusion rules</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Notifications</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Campaign start alerts</li>
                <li>• Progress updates</li>
                <li>• Completion reports</li>
                <li>• Exception handling</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
