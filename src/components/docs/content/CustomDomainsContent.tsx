import React from "react";
import { Link, Globe, Shield, CheckCircle, AlertTriangle, Copy, ExternalLink, Server, Database, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const CustomDomainsContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Link className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Custom Domain Configuration</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Configure branded domains for realistic phishing simulations. Custom domains enhance campaign effectiveness by using legitimate-looking URLs that closely mimic real services.
        </p>
      </div>

      <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Complete Domain Setup Process
          </CardTitle>
          <CardDescription>
            Follow these technical steps to configure your custom domain for phishing simulations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Domain Registration</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Purchase a domain from registrars like GoDaddy, Namecheap, or Cloudflare. Choose domains that resemble legitimate services.
                  </p>
                  <div className="bg-muted p-3 rounded font-mono text-xs">
                    <div>Example: micros0ft-support.com</div>
                    <div>Avoid: obviously-malicious-phishing.com</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">DNS Configuration</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Access your domain registrar's DNS management panel and add the required records.
                  </p>
                  <div className="space-y-2">
                    <div className="bg-muted p-3 rounded font-mono text-xs">
                      <div><strong>Type:</strong> CNAME</div>
                      <div><strong>Name:</strong> @ (or your subdomain)</div>
                      <div><strong>Value:</strong> pjfbjfjvuwqjqyuvwriq.supabase.co</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Verification Record</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Add the TXT verification record to prove domain ownership.
                  </p>
                  <div className="bg-muted p-3 rounded font-mono text-xs">
                    <div><strong>Type:</strong> TXT</div>
                    <div><strong>Name:</strong> _LureX-verification.yourdomain.com</div>
                    <div><strong>Value:</strong> LureX-verify=abc123def456</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold text-primary">4</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">DNS Propagation</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Wait 5-30 minutes for DNS changes to propagate globally. Use tools like whatsmydns.net to verify.
                  </p>
                  <Button variant="outline" size="sm" className="text-xs">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Check DNS Propagation
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold text-primary">5</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">LureX Verification</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Click the Verify button in your LureX dashboard to confirm DNS configuration.
                  </p>
                  <Badge variant="outline">Auto-SSL Enabled</Badge>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold text-primary">6</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Campaign Integration</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use your verified domain in phishing campaigns for realistic URLs.
                  </p>
                  <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-xs text-green-700 dark:text-green-300">
                    ✅ phishing.micros0ft-support.com/login
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 rounded-lg">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  DNS Configuration Interface
                </h4>
                <div className="bg-white dark:bg-gray-800 p-4 rounded border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Type:</span>
                      <Badge variant="outline">CNAME</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Name:</span>
                      <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">@</code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Value:</span>
                      <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">pjfbjfjvuwqjqyuvwriq.supabase.co</code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">TTL:</span>
                      <Badge variant="secondary">3600</Badge>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Screenshot showing typical DNS configuration interface at domain registrars
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-6 rounded-lg">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Verification Success
                </h4>
                <div className="bg-white dark:bg-gray-800 p-4 rounded border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Domain Verified Successfully</span>
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                    SSL certificate automatically provisioned
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    Ready for use in campaigns
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="examples" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="examples">Domain Examples</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integration">Campaign Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-World Phishing Domain Examples</CardTitle>
              <CardDescription>
                These examples show effective domain naming strategies for different phishing scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400">Office 365 / Microsoft Clones</h4>
                  <div className="space-y-2">
                    {[
                      { domain: "micros0ft-online.com", type: "Typo-squatting", effectiveness: "High" },
                      { domain: "office365-secure.net", type: "Security branding", effectiveness: "High" },
                      { domain: "ms-teams-update.org", type: "Service-specific", effectiveness: "Medium" },
                      { domain: "outlook-verification.co", type: "Verification theme", effectiveness: "High" }
                    ].map((example, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-mono text-sm font-medium">{example.domain}</div>
                            <div className="text-xs text-muted-foreground">{example.type}</div>
                          </div>
                          <Badge variant={example.effectiveness === 'High' ? 'default' : 'secondary'}>
                            {example.effectiveness}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-green-600 dark:text-green-400">Banking & Financial Clones</h4>
                  <div className="space-y-2">
                    {[
                      { domain: "chase-secure-alert.com", type: "Bank + security", effectiveness: "Very High" },
                      { domain: "bankofamerica-update.net", type: "Direct clone", effectiveness: "Medium" },
                      { domain: "wellsfargo-online.org", type: "Service branding", effectiveness: "High" },
                      { domain: "paypal-security-alert.co", type: "Security focus", effectiveness: "Very High" }
                    ].map((example, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-mono text-sm font-medium">{example.domain}</div>
                            <div className="text-xs text-muted-foreground">{example.type}</div>
                          </div>
                          <Badge variant={example.effectiveness === 'Very High' ? 'default' : example.effectiveness === 'High' ? 'secondary' : 'outline'}>
                            {example.effectiveness}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Common DNS Issues & Solutions
              </CardTitle>
              <CardDescription>
                Troubleshooting guide for domain configuration problems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">❌ CNAME Record Not Working</h4>
                  <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
                    <p><strong>Symptom:</strong> Verification fails with DNS resolution error</p>
                    <p><strong>Solutions:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Wait 30-60 minutes for DNS propagation</li>
                      <li>Check if CNAME value is copied exactly (case-sensitive)</li>
                      <li>Verify your domain registrar supports CNAME flattening</li>
                      <li>Use whatsmydns.net to check global DNS resolution</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 border border-amber-200 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">⚠️ TXT Record Verification Fails</h4>
                  <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                    <p><strong>Symptom:</strong> CNAME works but TXT verification fails</p>
                    <p><strong>Solutions:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Ensure TXT record name includes full domain (not just subdomain)</li>
                      <li>Check for extra spaces or quotes in TXT value</li>
                      <li>Wait for DNS propagation (TXT records can take longer)</li>
                      <li>Verify with dig command: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">dig TXT _LureX-verification.yourdomain.com</code></li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">🔒 SSL Certificate Issues</h4>
                  <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                    <p><strong>Symptom:</strong> Domain verified but SSL certificate not issued</p>
                    <p><strong>Solutions:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>SSL is automatically provisioned during verification</li>
                      <li>Wait up to 24 hours for SSL certificate generation</li>
                      <li>Check if domain resolves to LureX servers first</li>
                      <li>Contact support if SSL doesn't appear after 24 hours</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 border border-purple-200 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">🚫 Domain Already Exists</h4>
                  <div className="text-sm text-purple-700 dark:text-purple-300 space-y-2">
                    <p><strong>Symptom:</strong> "Domain already configured" error when adding</p>
                    <p><strong>Solutions:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Check if domain is already in your LureX account</li>
                      <li>Remove existing domain if you want to reconfigure</li>
                      <li>Contact support if domain is registered to another account</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Best Practices for Phishing Domains
              </CardTitle>
              <CardDescription>
                Technical guidelines for maintaining secure and effective phishing simulation domains
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-600 dark:text-green-400">✅ Recommended Practices</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Typo-squatting</div>
                        <div className="text-sm text-muted-foreground">Use realistic misspellings of legitimate domains</div>
                        <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded mt-1 block">micros0ft.com → microsoft.com</code>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Security Branding</div>
                        <div className="text-sm text-muted-foreground">Add security-related keywords</div>
                        <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded mt-1 block">office365-security.com</code>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Alternative TLDs</div>
                        <div className="text-sm text-muted-foreground">Use .net, .org, .co for variety</div>
                        <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded mt-1 block">paypal-support.net</code>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-red-600 dark:text-red-400">❌ Avoid These Patterns</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Obvious Phishing</div>
                        <div className="text-sm text-muted-foreground">Avoid obviously malicious names</div>
                        <code className="text-xs bg-red-100 dark:bg-red-900/30 px-1 rounded mt-1 block">phish-victim.com</code>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Generic Names</div>
                        <div className="text-sm text-muted-foreground">Don't use generic or unrelated names</div>
                        <code className="text-xs bg-red-100 dark:bg-red-900/30 px-1 rounded mt-1 block">mywebsite.com</code>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Overly Complex</div>
                        <div className="text-sm text-muted-foreground">Keep domains simple and believable</div>
                        <code className="text-xs bg-red-100 dark:bg-red-900/30 px-1 rounded mt-1 block">ultra-secure-bank-verification-portal.com</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Domain Management:</strong> Monitor your domains for reputation issues and rotate them regularly. Use domain reputation monitoring tools to ensure your phishing simulations remain effective.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Campaign Integration & URL Generation
              </CardTitle>
              <CardDescription>
                How custom domains are used in phishing campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg">
                <h4 className="font-semibold mb-4">URL Generation Process</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <div className="font-medium">Domain Selection</div>
                      <div className="text-sm text-muted-foreground">Choose verified domain during campaign creation</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <div className="font-medium">Tracking Token Generation</div>
                      <div className="text-sm text-muted-foreground">Create unique tracking URL for each target</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <div className="font-medium">Phishing URL Created</div>
                      <div className="text-sm text-muted-foreground">Final URL combines domain with tracking path</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Example Phishing URLs</h5>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                      https://phishing.micros0ft-support.com/login
                    </div>
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                      https://office365-secure.net/update
                    </div>
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                      https://bankofamerica-update.org/security
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Tracking Architecture</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Email opens tracked via pixel</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Link clicks captured in real-time</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Form submissions logged to database</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Geolocation & device fingerprinting</span>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  <strong>Technical Note:</strong> All tracking data is stored in the <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">campaign_metrics</code> and <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">file_interactions</code> tables with full audit trails and security logging.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
