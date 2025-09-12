import React from "react";
import { Settings, User, Bell, Shield, Key, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const SetupGuideContent: React.FC = () => {
  const setupSections = [
    {
      icon: <User className="h-5 w-5" />,
      title: "Profile Configuration",
      description: "Set up your personal and organization details",
      items: [
        "Complete your profile information",
        "Add organization name and logo",
        "Set your timezone and locale preferences",
        "Configure display name and contact details"
      ]
    },
    {
      icon: <Bell className="h-5 w-5" />,
      title: "Notification Settings",
      description: "Configure how and when you receive alerts",
      items: [
        "Email notification preferences",
        "Real-time dashboard alerts",
        "Campaign completion notifications",
        "Security incident alerts"
      ]
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Security Configuration",
      description: "Set up security policies and access controls",
      items: [
        "Two-factor authentication setup",
        "Session timeout configuration",
        "IP whitelist management",
        "API access permissions"
      ]
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: "Data & Privacy",
      description: "Configure data retention and privacy settings",
      items: [
        "Data retention policies",
        "Export and backup preferences",
        "Privacy compliance settings",
        "Data sharing permissions"
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Setup Guide</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Configure your LureX platform to match your organization's requirements and security policies. 
          This comprehensive setup ensures optimal performance and compliance.
        </p>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            Configuration
          </Badge>
          <Badge variant="outline" className="bg-secondary/10">
            Security Setup
          </Badge>
        </div>
      </div>

      {/* Initial Setup Checklist */}
      <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20">
        <CardHeader>
          <CardTitle className="text-green-800 dark:text-green-200 flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Initial Setup Checklist</span>
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            Complete these essential steps before launching your first campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-800 dark:text-green-200">Account Essentials</h4>
              <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                <li>□ Verify email address</li>
                <li>□ Complete profile information</li>
                <li>□ Set up organization details</li>
                <li>□ Configure timezone</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-800 dark:text-green-200">Security Setup</h4>
              <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                <li>□ Enable two-factor authentication</li>
                <li>□ Set strong password</li>
                <li>□ Configure session settings</li>
                <li>□ Review API permissions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Sections */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Configuration Areas</h2>
        
        <div className="grid grid-cols-1 gap-6">
          {setupSections.map((section, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                    <CardDescription className="mt-1">
                      {section.description}
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Advanced Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Configuration Options</CardTitle>
          <CardDescription>
            Optional settings for power users and enterprise deployments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Custom Domains</h4>
              <p className="text-sm text-muted-foreground">
                Set up branded domains for more realistic phishing simulations
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• DNS configuration</li>
                <li>• SSL certificate setup</li>
                <li>• Domain verification</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">API Integration</h4>
              <p className="text-sm text-muted-foreground">
                Connect LureX with your existing security tools and workflows
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Generate API keys</li>
                <li>• Webhook configuration</li>
                <li>• Rate limiting settings</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">SMTP Configuration</h4>
              <p className="text-sm text-muted-foreground">
                Use your own email server for sending phishing emails
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• SMTP server settings</li>
                <li>• Authentication setup</li>
                <li>• Delivery optimization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200">Setup Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Security Recommendations</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Always enable 2FA for admin accounts</li>
                <li>• Use strong, unique passwords</li>
                <li>• Regularly review access permissions</li>
                <li>• Monitor login activity</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Operational Tips</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Start with small test campaigns</li>
                <li>• Document your configuration</li>
                <li>• Set up monitoring alerts</li>
                <li>• Plan for data retention</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
