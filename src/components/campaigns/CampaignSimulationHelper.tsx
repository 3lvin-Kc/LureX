
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, HelpCircle, Mail, MousePointer, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface CampaignSimulationHelperProps {
  campaignId?: string;
}

export const CampaignSimulationHelper: React.FC<CampaignSimulationHelperProps> = ({ 
  campaignId 
}) => {
  const { toast } = useToast();
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">How Phishing Simulations Work</CardTitle>
        <CardDescription>
          Understanding the mechanics behind your phishing campaigns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium">1. Email Delivery</h4>
            <p className="text-muted-foreground">
              Each email has unique tracking codes to monitor opens and clicks
              from individual recipients.
            </p>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex items-start gap-3">
          <div className="bg-amber-100 p-2 rounded-full">
            <MousePointer className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-medium">2. Link Redirection</h4>
            <p className="text-muted-foreground">
              When links are clicked, recipients are first sent through our secure
              tracking server before being redirected to the simulation page.
            </p>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex items-start gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <User className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-medium">3. Safe Simulation</h4>
            <p className="text-muted-foreground">
              Phishing pages look authentic but are completely isolated from real systems.
              No actual credentials or sensitive data are stored.
            </p>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex items-start gap-3">
          <div className="bg-purple-100 p-2 rounded-full">
            <CheckCircle className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-medium">4. Educational Opportunity</h4>
            <p className="text-muted-foreground">
              After interaction, employees receive immediate training based on their response,
              helping build awareness and improve security behaviors.
            </p>
          </div>
        </div>
        
        <div className="pt-3">
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs"
            onClick={() => {
              toast({
                title: "Documentation Available",
                description: "Phishing simulation documentation has been added to your dashboard.",
              });
            }}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Learn More About Phishing Simulations
          </Button>
        </div>
        
        <div className="mt-4 bg-amber-50 p-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2 shrink-0 mt-0.5" />
          <p className="text-amber-800 text-xs">
            Remember that phishing simulations are educational tools designed to improve
            security awareness. Always ensure employees understand the purpose and benefit
            of these exercises.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignSimulationHelper;
