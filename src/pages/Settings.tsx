
import React, { useState } from "react";
import { Save, Mail, Shield, Webhook, Database, Key, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const Settings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("email-settings");
  
  // Mock SMTP settings form
  const [smtpForm, setSmtpForm] = useState({
    host: "smtp.example.com",
    port: "587",
    username: "phishing@example.com",
    password: "••••••••••••",
    from_name: "IT Department",
    from_email: "it-support@example.com",
    use_ssl: true,
    is_default: true
  });

  const handleSmtpChange = (field: string, value: string | boolean) => {
    setSmtpForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSmtpSave = () => {
    // Would normally save to database here
    toast({
      title: "SMTP Settings Saved",
      description: "Your email settings have been updated successfully."
    });
  };

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">SMTP Server Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input 
                id="smtp-host" 
                value={smtpForm.host}
                onChange={(e) => handleSmtpChange("host", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input 
                id="smtp-port" 
                value={smtpForm.port}
                onChange={(e) => handleSmtpChange("port", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-username">Username</Label>
              <Input 
                id="smtp-username" 
                value={smtpForm.username}
                onChange={(e) => handleSmtpChange("username", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-password">Password</Label>
              <Input 
                id="smtp-password" 
                type="password"
                value={smtpForm.password}
                onChange={(e) => handleSmtpChange("password", e.target.value)}
              />
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
                value={smtpForm.from_name}
                onChange={(e) => handleSmtpChange("from_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from-email">From Email</Label>
              <Input 
                id="from-email" 
                value={smtpForm.from_email}
                onChange={(e) => handleSmtpChange("from_email", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Connection Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="use-ssl" 
                checked={smtpForm.use_ssl}
                onCheckedChange={(checked) => handleSmtpChange("use_ssl", checked)}
              />
              <Label htmlFor="use-ssl">Use SSL/TLS</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="is-default" 
                checked={smtpForm.is_default}
                onCheckedChange={(checked) => handleSmtpChange("is_default", checked)}
              />
              <Label htmlFor="is-default">Set as default SMTP server</Label>
            </div>
          </div>
        </div>

        <Button onClick={handleSmtpSave} className="w-fit">
          <Save className="mr-2 h-4 w-4" />
          Save Email Settings
        </Button>
      </div>
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
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">Security settings coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="integrations">
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">Integration settings coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="database">
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">Database settings coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="api-keys">
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">API key management coming soon</p>
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
