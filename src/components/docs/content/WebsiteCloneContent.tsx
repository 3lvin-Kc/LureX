import React from "react";
import { Globe, Copy, Download, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const WebsiteCloneContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Globe className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Website Clone</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Create pixel-perfect replicas of legitimate websites for realistic phishing simulations 
          using our advanced cloning technology.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How Website Cloning Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">1. Enter URL</h4>
              <p className="text-sm text-muted-foreground">Provide the target website URL to clone</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">2. Auto-Extract</h4>
              <p className="text-sm text-muted-foreground">AI extracts HTML, CSS, and assets</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Copy className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">3. Deploy Clone</h4>
              <p className="text-sm text-muted-foreground">Host the replica on secure servers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Popular Clone Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Office 365 Login", category: "Productivity", difficulty: "Easy" },
                { name: "Gmail Sign-in", category: "Email", difficulty: "Easy" },
                { name: "Bank of America", category: "Banking", difficulty: "Hard" },
                { name: "LinkedIn Login", category: "Social", difficulty: "Medium" },
                { name: "Dropbox Sign-in", category: "Cloud", difficulty: "Medium" }
              ].map((target, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{target.name}</h4>
                    <p className="text-sm text-muted-foreground">{target.category}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={target.difficulty === 'Easy' ? 'secondary' : target.difficulty === 'Medium' ? 'default' : 'destructive'} className="text-xs">
                      {target.difficulty}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clone Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Automatic Enhancements</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Tracking pixel integration</li>
                  <li>• Form submission capture</li>
                  <li>• Mobile responsiveness</li>
                  <li>• SSL certificate matching</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Customization Options</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Custom domain hosting</li>
                  <li>• Branding modifications</li>
                  <li>• Content personalization</li>
                  <li>• Redirect configuration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200">Legal & Ethical Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Authorization Required</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Only clone sites for authorized testing</li>
                <li>• Obtain proper permissions</li>
                <li>• Document approval process</li>
                <li>• Respect intellectual property</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Best Practices</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Use for security training only</li>
                <li>• Implement proper disclaimers</li>
                <li>• Secure cloned content</li>
                <li>• Regular cleanup of old clones</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

