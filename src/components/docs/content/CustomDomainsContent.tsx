import React from "react";
import { Link, Globe, Shield, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const CustomDomainsContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Link className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Custom Domains</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Set up branded domains for more realistic phishing simulations that closely 
          mimic legitimate services and increase campaign effectiveness.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Domain Setup Process</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">1. Register Domain</h4>
              <p className="text-sm text-muted-foreground">Purchase or use existing domain</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Link className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">2. DNS Configuration</h4>
              <p className="text-sm text-muted-foreground">Point domain to LureX servers</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">3. SSL Certificate</h4>
              <p className="text-sm text-muted-foreground">Automatic HTTPS setup</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">4. Verification</h4>
              <p className="text-sm text-muted-foreground">Test and activate domain</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Domain Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { domain: "secure-office365.com", type: "Office 365 Clone", status: "Active" },
                { domain: "gmail-security.net", type: "Gmail Clone", status: "Active" },
                { domain: "company-portal.org", type: "Corporate Portal", status: "Pending" },
                { domain: "bank-update.co", type: "Banking Clone", status: "Setup" }
              ].map((domain, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{domain.domain}</h4>
                    <p className="text-sm text-muted-foreground">{domain.type}</p>
                  </div>
                  <Badge variant={domain.status === 'Active' ? 'default' : domain.status === 'Pending' ? 'secondary' : 'outline'}>
                    {domain.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>DNS Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                <div>Type: CNAME</div>
                <div>Name: @</div>
                <div>Value: proxy.lurex.com</div>
              </div>
              <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                <div>Type: TXT</div>
                <div>Name: _lurex-verify</div>
                <div>Value: abc123def456</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20">
        <CardHeader>
          <CardTitle className="text-amber-800 dark:text-amber-200">Domain Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-amber-800 dark:text-amber-200">Naming Strategies</h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>• Use slight misspellings of real domains</li>
                <li>• Add security-related prefixes/suffixes</li>
                <li>• Use different TLDs (.net, .org, .co)</li>
                <li>• Avoid obvious phishing indicators</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-amber-800 dark:text-amber-200">Security Considerations</h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>• Always use HTTPS certificates</li>
                <li>• Monitor domain reputation</li>
                <li>• Rotate domains regularly</li>
                <li>• Document domain usage</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
