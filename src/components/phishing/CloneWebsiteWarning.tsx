
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
import { AlertTriangle, Code, Database, FileCode, Globe, Lock, Server, Shield, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
      <AlertDialogContent className="max-w-4xl p-0 overflow-hidden rounded-xl border-0 shadow-2xl">
        <div className="flex flex-col md:flex-row">
          {/* Left sidebar with visual accent */}
          <div className="hidden md:flex md:w-1/4 bg-gradient-to-br from-amber-500 to-amber-600 p-6 flex-col justify-between">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-xl">Advanced Website Cloner</h3>
              <p className="text-white/80 text-sm">
                High-fidelity replication for authorized security simulation
              </p>
            </div>
            
            <div className="space-y-3 mt-auto">
              <Badge variant="outline" className="bg-white/10 text-white border-none hover:bg-white/20">
                Enterprise Feature
              </Badge>
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <Lock className="h-3 w-3" />
                <span>SOC 2 Compliant</span>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 max-h-[80vh] overflow-y-auto">
            <AlertDialogHeader className="p-6 pb-0">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <AlertDialogTitle className="text-xl">Advanced Cloning Engine</AlertDialogTitle>
              </div>
              
              <Tabs defaultValue="overview" className="w-full mt-4">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
                  <TabsTrigger value="recommendations">Best Practices</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 animate-fade-in">
                  <AlertDialogDescription className="space-y-3">
                    <p className="text-base">
                      The Advanced Website Cloner leverages neural network-based content extraction to create 
                      pixel-perfect replicas of targeted websites. Our proprietary engine processes visual 
                      elements, interactive components, and form fields to deliver exceptionally convincing 
                      simulations.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                      <div className="bg-muted/40 p-4 rounded-lg border border-border">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                            <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <h4 className="font-medium">Intelligent Analysis</h4>
                            <p className="text-sm text-muted-foreground">
                              Auto-detects authentication forms and critical UI elements
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted/40 p-4 rounded-lg border border-border">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <FileCode className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium">Adaptive Rendering</h4>
                            <p className="text-sm text-muted-foreground">
                              Maintains responsive behavior across all device types
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-md border border-amber-200 dark:border-amber-800 mt-2">
                      <div className="flex gap-2 items-start">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-amber-800 dark:text-amber-300 font-medium">Important Notice</h3>
                          <p className="text-amber-700 dark:text-amber-400 text-sm mt-1">
                            This feature is designed exclusively for authorized security training. Unauthorized use may 
                            violate terms of service and applicable laws. All simulations are logged for compliance purposes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </AlertDialogDescription>
                </TabsContent>
                
                <TabsContent value="capabilities" className="space-y-4 animate-fade-in">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <Server className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-base">Enhanced Capture Engine</h3>
                        <p className="text-muted-foreground text-sm">
                          Our multilayer DOM traversal technology captures HTML structure, CSS styling, form elements, 
                          and JavaScript functionality with exceptional fidelity.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-base">Advanced Form Detection</h3>
                        <p className="text-muted-foreground text-sm">
                          Machine learning algorithms identify authentication fields, password inputs, and 
                          submission handlers, creating realistic credential capture simulations with configurable 
                          behavior patterns.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                        <Database className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-base">Behavioral Simulation</h3>
                        <p className="text-muted-foreground text-sm">
                          Replicates interactive elements like dropdown menus, toggles, and multi-step forms
                          with convincing visual feedback and validation behaviors.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                        <Code className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-base">Post-Processing Options</h3>
                        <p className="text-muted-foreground text-sm">
                          Fine-tune cloned pages with our visual editor, customize branding elements, and 
                          implement organization-specific training messages.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-md border border-border mt-2">
                      <h4 className="font-medium mb-2">Technical Limitations</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        <li>Single-page applications with complex state management</li>
                        <li>Websites with advanced anti-bot protection</li>
                        <li>Multi-factor authentication implementations</li>
                        <li>WebSocket-dependent real-time features</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="recommendations" className="space-y-4 animate-fade-in">
                  <div className="space-y-3">
                    <h3 className="font-medium">Implementation Best Practices</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>
                        <span className="font-medium">Target Selection:</span> Choose websites that align with 
                        your organization's specific threat profile and industry-relevant phishing scenarios.
                      </li>
                      <li>
                        <span className="font-medium">Educational Integration:</span> Pair simulations with immediate 
                        educational feedback when targets interact with phishing content.
                      </li>
                      <li>
                        <span className="font-medium">Progressive Difficulty:</span> Implement a graduated 
                        campaign strategy that increases in sophistication as user awareness improves.
                      </li>
                      <li>
                        <span className="font-medium">Testing Protocol:</span> Validate cloned pages across 
                        multiple browsers and devices before campaign deployment.
                      </li>
                    </ul>
                    
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-md border border-blue-200 dark:border-blue-800 mt-2">
                      <div className="flex items-start gap-2">
                        <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-blue-800 dark:text-blue-300 font-medium">Compliance Guidance</h3>
                          <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
                            Implement clear indicators in training materials that identify simulated pages 
                            as security exercises. Our platform automatically injects secure metadata tags that 
                            prevent indexing by search engines.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Alternative Approaches</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        For highly controlled and customizable simulations, consider using:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-muted/40 p-3 rounded-md border border-border">
                          <h5 className="font-medium text-sm">Template Builder</h5>
                          <p className="text-xs text-muted-foreground">
                            Pre-designed, compliance-vetted templates with customization options
                          </p>
                        </div>
                        <div className="bg-muted/40 p-3 rounded-md border border-border">
                          <h5 className="font-medium text-sm">Visual Editor</h5>
                          <p className="text-xs text-muted-foreground">
                            Drag-and-drop interface for creating custom landing pages
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </AlertDialogHeader>
            
            <AlertDialogFooter className="gap-2 sm:gap-0 p-6 pt-4 border-t">
              <AlertDialogCancel onClick={onCancel} className="mt-0">
                Use New Page Instead
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleProceed} 
                className={cn(
                  "bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700",
                  "text-white"
                )}
              >
                Proceed with Advanced Cloner
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CloneWebsiteWarning;
