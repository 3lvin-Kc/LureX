
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ConsentPromptProps {
  onAccept: () => void;
  onDecline: () => void;
}

const ConsentPrompt: React.FC<ConsentPromptProps> = ({ onAccept, onDecline }) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [complianceAgreed, setComplianceAgreed] = useState(false);
  const [ethicalAgreed, setEthicalAgreed] = useState(false);

  const handleAccept = () => {
    if (acknowledged && complianceAgreed && ethicalAgreed) {
      localStorage.setItem("phishing_consent_accepted", "true");
      onAccept();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b">
        <CardTitle className="flex items-center text-2xl">
          <ShieldCheck className="mr-2 h-6 w-6 text-amber-500" />
          Ethical Use Agreement
        </CardTitle>
        <CardDescription>
          This tool is intended for security awareness training and phishing simulations only
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 pb-2 space-y-6">
        <Alert variant="warning" className="bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important Notice</AlertTitle>
          <AlertDescription>
            The website cloning feature you are about to use is designed exclusively for security awareness training and authorized phishing simulations.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Compliance and Legal Information</h3>
          <p className="text-muted-foreground">
            By proceeding, you acknowledge that you understand and agree to the following:
          </p>
          
          <div className="space-y-3 mt-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="ethical-use" 
                checked={ethicalAgreed}
                onCheckedChange={(checked) => setEthicalAgreed(checked === true)}
              />
              <div className="grid gap-1.5">
                <label htmlFor="ethical-use" className="text-sm font-medium leading-none cursor-pointer">
                  Ethical Use Policy
                </label>
                <p className="text-sm text-muted-foreground">
                  I will only use this tool for legitimate security awareness training, authorized phishing simulations, or security testing with proper authorization.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="compliance-agreement" 
                checked={complianceAgreed}
                onCheckedChange={(checked) => setComplianceAgreed(checked === true)}
              />
              <div className="grid gap-1.5">
                <label htmlFor="compliance-agreement" className="text-sm font-medium leading-none cursor-pointer">
                  Compliance Agreement
                </label>
                <p className="text-sm text-muted-foreground">
                  I understand that unauthorized access to systems, misrepresentation, or credential harvesting without explicit consent may violate laws including but not limited to the CFAA and GDPR.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 pt-2">
              <Checkbox 
                id="acknowledgment" 
                checked={acknowledged}
                onCheckedChange={(checked) => setAcknowledged(checked === true)}
              />
              <div className="grid gap-1.5">
                <label htmlFor="acknowledgment" className="text-sm font-medium leading-none cursor-pointer">
                  Acknowledgment of Responsibility
                </label>
                <p className="text-sm text-muted-foreground">
                  I acknowledge that I am solely responsible for how this tool is used and will ensure all simulations are conducted with proper notification, consent, and debriefing processes in place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4 mt-4">
        <Button variant="outline" onClick={onDecline}>
          Decline & Exit
        </Button>
        <Button 
          onClick={handleAccept} 
          disabled={!acknowledged || !complianceAgreed || !ethicalAgreed}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          Accept & Continue
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConsentPrompt;
