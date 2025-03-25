
import React, { useState, useEffect } from "react";
import { Save, Mail, Shield, Webhook, Database, Key, Server, FileText, Users, GanttChart, MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("email-settings");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Email provider settings form
  const [emailProviderForm, setEmailProviderForm] = useState({
    id: "",
    provider_type: "sendgrid", // Default to SendGrid
    from_email: "",
    from_name: "",
    sendgrid_template_id: "",
    is_default: true,
  });

  // Load existing Email provider settings
  useEffect(() => {
    const fetchEmailProviderSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("email_providers")
          .select("*")
          .eq("provider_type", "sendgrid")
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setEmailProviderForm({
            id: data.id,
            provider_type: data.provider_type || "sendgrid",
            from_email: data.from_email || "",
            from_name: data.from_name || "",
            sendgrid_template_id: data.sendgrid_template_id || "",
            is_default: data.is_default || true,
          });
        }
      } catch (error) {
        console.error("Error loading SendGrid settings:", error);
        toast({
          title: "Error",
          description: "Failed to load email settings",
          variant: "destructive",
        });
      }
    };

    fetchEmailProviderSettings();
  }, []);

  const handleEmailProviderChange = (field: string, value: string | boolean) => {
    setEmailProviderForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmailProviderSave = async () => {
    try {
      setIsLoading(true);

      if (!emailProviderForm.from_email) {
        toast({
          title: "Validation Error",
          description: "From Email is required",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check if we're updating or creating
      if (emailProviderForm.id) {
        // Update existing record
        const { error } = await supabase
          .from("email_providers")
          .update({
            from_email: emailProviderForm.from_email,
            from_name: emailProviderForm.from_name,
            sendgrid_template_id: emailProviderForm.sendgrid_template_id,
            is_default: emailProviderForm.is_default,
            provider_type: "sendgrid",
          })
          .eq("id", emailProviderForm.id);

        if (error) throw error;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from("email_providers")
          .insert({
            from_email: emailProviderForm.from_email,
            from_name: emailProviderForm.from_name,
            sendgrid_template_id: emailProviderForm.sendgrid_template_id,
            is_default: emailProviderForm.is_default,
            provider_type: "sendgrid",
            // Required fields for the table even though we don't use them with SendGrid
            host: "sendgrid",
            port: 587,
            username: "sendgrid",
            password: "not-used-with-api",
            name: "SendGrid",
          })
          .select();

        if (error) throw error;
        
        if (data && data.length > 0) {
          setEmailProviderForm(prev => ({
            ...prev,
            id: data[0].id,
          }));
        }
      }

      toast({
        title: "SendGrid Settings Saved",
        description: "Your email settings have been updated successfully."
      });
    } catch (error: any) {
      console.error("Error saving SendGrid settings:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save email settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">SendGrid Configuration</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sendgrid-api-key">SendGrid API Key</Label>
              <div className="flex flex-col gap-2">
                <div className="p-3 border rounded bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm">
                  The SendGrid API key is now securely stored in the backend environment variables.
                  Contact your administrator to update it if needed.
                </div>
                <p className="text-xs text-muted-foreground">
                  For security reasons, API keys are managed by your admin through the secure backend.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Sender Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-name">From Name</Label>
              <Input 
                id="from-name" 
                value={emailProviderForm.from_name}
                onChange={(e) => handleEmailProviderChange("from_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from-email">From Email</Label>
              <Input 
                id="from-email" 
                value={emailProviderForm.from_email}
                onChange={(e) => handleEmailProviderChange("from_email", e.target.value)}
                placeholder="sender@yourdomain.com"
              />
              <p className="text-xs text-muted-foreground">This email must be verified in your SendGrid account.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">SendGrid Template (Optional)</h3>
          <div className="space-y-2">
            <Label htmlFor="template-id">Template ID</Label>
            <Input 
              id="template-id" 
              value={emailProviderForm.sendgrid_template_id}
              onChange={(e) => handleEmailProviderChange("sendgrid_template_id", e.target.value)}
              placeholder="d-xxxxxxxxxxxxxxxxxxxxxxxx"
            />
            <p className="text-xs text-muted-foreground">
              Optional: Use a SendGrid Dynamic Template ID for consistent email designs. 
              Leave blank to use custom HTML in your email templates.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Default Settings</h3>
          <div className="flex items-center space-x-2">
            <Switch 
              id="is-default" 
              checked={emailProviderForm.is_default}
              onCheckedChange={(checked) => handleEmailProviderChange("is_default", checked)}
            />
            <Label htmlFor="is-default">Set as default email provider</Label>
          </div>
        </div>

        <Button 
          onClick={handleEmailProviderSave} 
          className="w-fit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">⏳</span> Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Email Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // New function to render quick access cards for main features
  const renderQuickAccessCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/templates')}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <FileText className="mr-2 h-5 w-5 text-primary" />
            Email Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Manage email templates for your phishing campaigns
          </CardDescription>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/phishing-pages')}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <MonitorPlay className="mr-2 h-5 w-5 text-primary" />
            Phishing Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Create and manage phishing landing pages
          </CardDescription>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/target-lists')}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Target Lists
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Manage target lists for your campaigns
          </CardDescription>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/campaigns')}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <GanttChart className="mr-2 h-5 w-5 text-primary" />
            Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Create and monitor phishing campaigns
          </CardDescription>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/reports')}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <FileText className="mr-2 h-5 w-5 text-primary" />
            Reports & Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            View detailed reports and activity logs
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Configure your phishing platform</p>
          </div>
        </div>

        {/* Quick access to main features */}
        {renderQuickAccessCards()}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>
              Configure and customize your phishing simulation platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="email-settings" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-6">
                <TabsTrigger value="email-settings" className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Settings
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="integrations" className="flex items-center">
                  <Webhook className="mr-2 h-4 w-4" />
                  Integrations
                </TabsTrigger>
                <TabsTrigger value="database" className="flex items-center">
                  <Database className="mr-2 h-4 w-4" />
                  Database
                </TabsTrigger>
                <TabsTrigger value="api-keys" className="flex items-center">
                  <Key className="mr-2 h-4 w-4" />
                  API Keys
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="email-settings">
                {renderEmailSettings()}
              </TabsContent>
              
              <TabsContent value="security">
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <h3 className="text-lg font-medium">Security Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch id="mfa" />
                        <Label htmlFor="mfa">Enable Multi-Factor Authentication</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="ip-restriction" />
                        <Label htmlFor="ip-restriction">IP Address Restrictions</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="session-timeout" defaultChecked />
                        <Label htmlFor="session-timeout">Auto Session Timeout (30 minutes)</Label>
                      </div>
                    </div>
                  </div>
                  <Button className="w-fit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Security Settings
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="integrations">
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <h3 className="text-lg font-medium">Integration Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch id="slack-integration" />
                        <Label htmlFor="slack-integration">Slack Integration</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="teams-integration" />
                        <Label htmlFor="teams-integration">Microsoft Teams Integration</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="siem-integration" />
                        <Label htmlFor="siem-integration">SIEM Integration</Label>
                      </div>
                    </div>
                  </div>
                  <Button className="w-fit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Integration Settings
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="database">
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <h3 className="text-lg font-medium">Database Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch id="auto-backup" defaultChecked />
                        <Label htmlFor="auto-backup">Automatic Backups</Label>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="backup-frequency">Backup Frequency</Label>
                        <select id="backup-frequency" className="w-full p-2 border rounded">
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="retention-period">Data Retention Period</Label>
                        <select id="retention-period" className="w-full p-2 border rounded">
                          <option value="30">30 Days</option>
                          <option value="90">90 Days</option>
                          <option value="365">1 Year</option>
                          <option value="unlimited">Unlimited</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <Button className="w-fit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Database Settings
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="api-keys">
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <h3 className="text-lg font-medium">API Key Management</h3>
                    <div className="space-y-4">
                      <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800">
                        <p className="text-sm font-medium">Active API Key</p>
                        <p className="font-mono text-sm mt-1">••••••••••••••••••••••••••1234</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline">Regenerate</Button>
                          <Button size="sm" variant="outline">Copy</Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="api-permissions">API Permissions</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Switch id="read-permission" defaultChecked />
                            <Label htmlFor="read-permission">Read</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="write-permission" defaultChecked />
                            <Label htmlFor="write-permission">Write</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="delete-permission" />
                            <Label htmlFor="delete-permission">Delete</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button className="w-fit">
                    <Save className="mr-2 h-4 w-4" />
                    Save API Settings
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
