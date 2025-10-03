import React from "react";
import { TrendingUp, Target, Users, Clock, CheckCircle, AlertTriangle, Award, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const MetricsContent: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Metrics</h1>
        </div>
        <p className="text-xl text-muted-foreground">
          Understand key performance indicators and metrics to measure the effectiveness
          of your phishing simulation campaigns and security awareness programs.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Core Metrics Overview
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">23.4%</div>
              <div className="text-sm font-medium">Click Rate</div>
              <div className="text-xs text-muted-foreground">+2.1% from last month</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">8.7%</div>
              <div className="text-sm font-medium">Submission Rate</div>
              <div className="text-xs text-muted-foreground">-1.3% from last month</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">15.2%</div>
              <div className="text-sm font-medium">Report Rate</div>
              <div className="text-xs text-muted-foreground">+4.8% from last month</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">87.3%</div>
              <div className="text-sm font-medium">Training Completion</div>
              <div className="text-xs text-muted-foreground">+12.5% from last month</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Metric Definitions & Interpretations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 border-l-4 border-blue-500 bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <h3 className="font-medium">Click Rate</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Percentage of recipients who clicked on phishing links</p>
                <div className="flex items-center gap-2 text-xs">
                  <AlertTriangle className="h-3 w-3 text-orange-500" />
                  <span>Higher = More Vulnerable</span>
                </div>
              </div>

              <div className="p-4 border-l-4 border-red-500 bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-red-500" />
                  <h3 className="font-medium">Submission Rate</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Percentage who entered credentials or sensitive data</p>
                <div className="flex items-center gap-2 text-xs">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <span>Critical Security Risk</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border-l-4 border-green-500 bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <h3 className="font-medium">Report Rate</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Percentage who reported suspicious emails</p>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Higher = Better Awareness</span>
                </div>
              </div>

              <div className="p-4 border-l-4 border-purple-500 bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <h3 className="font-medium">Training Completion</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Percentage who completed follow-up training</p>
                <div className="flex items-center gap-2 text-xs">
                  <Award className="h-3 w-3 text-purple-500" />
                  <span>Learning Engagement</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Industry Benchmarks
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium">Industry Average Click Rate</div>
                <div className="text-sm text-muted-foreground">Across all industries</div>
              </div>
              <span className="text-lg font-bold">32%</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium">Target Click Rate</div>
                <div className="text-sm text-muted-foreground">Recommended security goal</div>
              </div>
              <span className="text-lg font-bold text-green-600">&lt; 10%</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium">Excellent Report Rate</div>
                <div className="text-sm text-muted-foreground">High security awareness</div>
              </div>
              <span className="text-lg font-bold text-green-600">&gt; 60%</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Metric Calculations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-lg">Performance Metrics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Open Rate:</span>
                  <span className="font-mono">(Opened ÷ Sent) × 100</span>
                </div>
                <div className="flex justify-between">
                  <span>Click Rate:</span>
                  <span className="font-mono">(Clicked ÷ Sent) × 100</span>
                </div>
                <div className="flex justify-between">
                  <span>Submit Rate:</span>
                  <span className="font-mono">(Submitted ÷ Sent) × 100</span>
                </div>
                <div className="flex justify-between">
                  <span>Report Rate:</span>
                  <span className="font-mono">(Reported ÷ Sent) × 100</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-lg">Risk Assessment</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Low Risk:</span>
                  <span className="text-green-600">&lt; 15% click rate</span>
                </div>
                <div className="flex justify-between">
                  <span>Medium Risk:</span>
                  <span className="text-yellow-600">15-30% click rate</span>
                </div>
                <div className="flex justify-between">
                  <span>High Risk:</span>
                  <span className="text-red-600">&gt; 30% click rate</span>
                </div>
                <div className="flex justify-between">
                  <span>Critical:</span>
                  <span className="text-red-600">&gt; 10% submit rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
