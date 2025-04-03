
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Server, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface CloneWebsiteWarningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProceed: () => void;
  onCancel: () => void;
  onAccept?: () => void;
}

const CloneWebsiteWarning = ({
  open,
  onOpenChange,
  onProceed,
  onCancel,
  onAccept,
}: CloneWebsiteWarningProps) => {
  // Call onAccept when proceeding if it's provided
  const handleProceed = () => {
    onProceed();
    if (onAccept) {
      onAccept();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <AlertDialogTitle className="text-xl">Advanced Cloning Feature</AlertDialogTitle>
          </div>
          
          <Tabs defaultValue="overview" className="w-full mt-4">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
              <TabsTrigger value="recommendations">Best Practices</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <AlertDialogDescription className="space-y-3">
                <p className="text-base">
                  The Advanced Website Cloner is designed to create high-fidelity replicas of websites for 
                  phishing simulations. This feature uses intelligent content extraction to capture the 
                  appearance and behavior of target sites.
                </p>
                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-md border border-amber-200 dark:border-amber-800 mt-2">
                  <div className="flex gap-2 items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-amber-800 dark:text-amber-300 font-medium">Important Notice</h3>
                      <p className="text-amber-700 dark:text-amber-400 text-sm mt-1">
                        This feature is designed exclusively for authorized security training. Attempting to clone 
                        websites without proper authorization may violate terms of service and applicable laws.
                      </p>
                    </div>
                  </div>
                </div>
              </AlertDialogDescription>
            </TabsContent>
            
            <TabsContent value="capabilities" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Server className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">Enhanced Capture Engine</h3>
                    <p className="text-muted-foreground text-sm">
                      Capable of capturing HTML structure, CSS styling, form elements, and basic JavaScript 
                      functionality.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">Form Detection & Simulation</h3>
                    <p className="text-muted-foreground text-sm">
                      Automatically identifies login forms and authentication fields, creating simulated 
                      submission handlers for realistic credential capture.
                    </p>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mt-2">
                  <span className="font-medium text-foreground">Limitations:</span> Dynamic content requiring 
                  backend APIs, complex JavaScript applications, and websites with advanced anti-scraping 
                  measures may not clone with full functionality.
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="recommendations" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium">For optimal results:</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Target websites with standard login forms rather than those using complex authentication.</li>
                  <li>Consider using the HTML editor to customize cloned pages for your specific organization.</li>
                  <li>Test cloned pages thoroughly before deploying them in campaigns.</li>
                  <li>Accompany simulations with immediate educational feedback when targets interact with phishing content.</li>
                </ul>
                
                <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md border border-blue-200 dark:border-blue-800 mt-2">
                  <p className="text-blue-800 dark:text-blue-300 text-sm">
                    For more controlled and customizable simulations, consider using the "New Page" option with our 
                    template builder and HTML editor.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel onClick={onCancel} className="mt-0">
            Use New Page Instead
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleProceed} 
            className={cn(
              "bg-amber-600 hover:bg-amber-700",
              "text-white"
            )}
          >
            Proceed with Advanced Cloner
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CloneWebsiteWarning;
