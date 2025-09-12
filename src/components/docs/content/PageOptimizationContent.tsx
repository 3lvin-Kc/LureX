import React from "react";
import { TrendingUp, Target, Zap, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const PageOptimizationContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Page Optimization</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Optimize your phishing pages for maximum effectiveness and realism using 
          data-driven insights and proven psychological techniques.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Optimization Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Visual Authenticity</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Exact brand color matching</li>
                <li>• High-resolution logos and images</li>
                <li>• Consistent typography and spacing</li>
                <li>• Mobile-responsive design</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Psychological Triggers</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Urgency and scarcity messaging</li>
                <li>• Authority and trust indicators</li>
                <li>• Social proof elements</li>
                <li>• Fear-based motivators</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>A/B Testing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Version A</h4>
                <p className="text-sm text-muted-foreground mb-2">Standard login form</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Conversion: 23%</Badge>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="p-3 border rounded-lg bg-green-50/50 dark:bg-green-900/20">
                <h4 className="font-medium mb-2">Version B</h4>
                <p className="text-sm text-muted-foreground mb-2">With urgency banner</p>
                <div className="flex items-center justify-between">
                  <Badge variant="default">Conversion: 34%</Badge>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Page Load Time</span>
                <Badge variant="secondary">1.2s</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Mobile Compatibility</span>
                <Badge variant="default">98%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SSL Certificate</span>
                <Badge variant="default">Valid</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Spam Filter Score</span>
                <Badge variant="secondary">Low Risk</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
