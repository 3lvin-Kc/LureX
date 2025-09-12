import React from "react";
import { Users, Upload, Filter, UserCheck, UserX, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const TargetManagementContent: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Target Management</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Organize and manage your phishing simulation recipients with advanced targeting, 
          grouping, and tracking capabilities.
        </p>
      </div>

      {/* Import Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Import Target Recipients</CardTitle>
          <CardDescription>Multiple ways to add recipients to your campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <Upload className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium mb-2">CSV/Excel Import</h4>
              <p className="text-sm text-muted-foreground mb-3">Bulk import from spreadsheet files</p>
              <Button size="sm" variant="outline">Upload File</Button>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <Database className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium mb-2">Active Directory</h4>
              <p className="text-sm text-muted-foreground mb-3">Sync directly from your AD</p>
              <Button size="sm" variant="outline">Connect AD</Button>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <UserCheck className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium mb-2">Manual Entry</h4>
              <p className="text-sm text-muted-foreground mb-3">Add recipients individually</p>
              <Button size="sm" variant="outline">Add User</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Groups */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Target Groups & Segmentation</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Group Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Organizational Groups</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Department-based grouping</li>
                  <li>• Role and seniority levels</li>
                  <li>• Geographic locations</li>
                  <li>• Custom group creation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Smart Filtering</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">IT Department</Badge>
                  <Badge variant="outline">Executives</Badge>
                  <Badge variant="outline">Remote Workers</Badge>
                  <Badge variant="outline">New Hires</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Targeting Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Advanced Targeting</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Risk-based selection</li>
                  <li>• Previous campaign performance</li>
                  <li>• Training completion status</li>
                  <li>• Custom attribute filtering</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Exclusion Rules</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Opt-out management</li>
                  <li>• Recent campaign participants</li>
                  <li>• Vacation/leave schedules</li>
                  <li>• VIP/executive exclusions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Fields & Personalization</CardTitle>
          <CardDescription>Manage recipient data for effective personalization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Required Fields</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">Email Address</span>
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">First Name</span>
                    <Badge variant="secondary" className="text-xs">Recommended</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">Last Name</span>
                    <Badge variant="secondary" className="text-xs">Recommended</Badge>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Optional Fields</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">Department</span>
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">Job Title</span>
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">Phone Number</span>
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Target Analytics & Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">1,247</div>
              <div className="text-sm text-muted-foreground">Total Recipients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">89%</div>
              <div className="text-sm text-muted-foreground">Active Targets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600 mb-1">23</div>
              <div className="text-sm text-muted-foreground">Target Groups</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Target Management Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Data Quality</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Verify email addresses before campaigns</li>
                <li>• Keep recipient data up to date</li>
                <li>• Remove inactive/bounced emails</li>
                <li>• Validate data imports regularly</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Targeting Strategy</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Start with high-risk departments</li>
                <li>• Consider user training history</li>
                <li>• Respect opt-out preferences</li>
                <li>• Plan progressive difficulty levels</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
