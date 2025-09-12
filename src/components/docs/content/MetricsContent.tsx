import React from "react";
import { TrendingUp, Target, Users, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const MetricsContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Metrics</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Understand key performance indicators and metrics to measure the effectiveness 
          of your phishing simulation campaigns and security awareness programs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23.4%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Submission Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.7%</div>
            <p className="text-xs text-muted-foreground">-1.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Report Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15.2%</div>
            <p className="text-xs text-muted-foreground">+4.8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Training Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.3%</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metric Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-primary" />
                  Click Rate
                </h4>
                <p className="text-sm text-muted-foreground">Percentage of recipients who clicked on phishing links</p>
                <Badge variant="outline" className="mt-1">Higher = More Vulnerable</Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  Submission Rate
                </h4>
                <p className="text-sm text-muted-foreground">Percentage who entered credentials or sensitive data</p>
                <Badge variant="destructive" className="mt-1">Critical Security Risk</Badge>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  Report Rate
                </h4>
                <p className="text-sm text-muted-foreground">Percentage who reported suspicious emails</p>
                <Badge variant="default" className="mt-1">Higher = Better Awareness</Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                  Training Completion
                </h4>
                <p className="text-sm text-muted-foreground">Percentage who completed follow-up training</p>
                <Badge variant="default" className="mt-1">Learning Engagement</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Benchmarking</CardTitle>
          <CardDescription>Industry standards and best practices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <div className="font-medium">Industry Average Click Rate</div>
                <div className="text-sm text-muted-foreground">Across all industries</div>
              </div>
              <Badge variant="secondary">32%</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <div className="font-medium">Target Click Rate</div>
                <div className="text-sm text-muted-foreground">Recommended goal</div>
              </div>
              <Badge variant="default">&lt; 10%</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <div className="font-medium">Excellent Report Rate</div>
                <div className="text-sm text-muted-foreground">High security awareness</div>
              </div>
              <Badge variant="default">&gt; 60%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
