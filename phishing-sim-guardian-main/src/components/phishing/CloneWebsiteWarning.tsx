
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
import { 
  AlertTriangle, Code, Database, FileCode, Globe, Lock, 
  Server, Shield, Zap, Layers, Cpu, Eye, Network, BoxSelect,
  PanelLeft, ChevronRight, Fingerprint, CheckSquare
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

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
      <AlertDialogContent className="max-w-5xl p-0 overflow-hidden rounded-xl border-0 shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] bg-white/95 backdrop-blur-sm dark:bg-gray-950/95">
        <div className="flex flex-col md:flex-row">
          {/* Left sidebar with visual accent */}
          <div className="hidden md:flex md:w-1/3 lg:w-1/4 bg-gradient-to-br from-violet-600 via-indigo-700 to-blue-800 p-8 flex-col justify-between">
            <div className="space-y-6">
              <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg">
                <Layers className="h-7 w-7 text-white" />
              </div>
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-white font-semibold text-2xl"
              >
                Neural Clone Engine
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-white/80 text-base font-light leading-relaxed"
              >
                State-of-the-art website reconstruction with pixel-perfect accuracy and adaptive behavior simulation
              </motion.p>
              
              <div className="pt-6">
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex items-center gap-3 text-white/90 mb-3"
                >
                  <CheckSquare className="h-4 w-4 text-emerald-300" />
                  <span className="text-sm">Advanced DOM parsing</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex items-center gap-3 text-white/90 mb-3"
                >
                  <CheckSquare className="h-4 w-4 text-emerald-300" />
                  <span className="text-sm">Deep CSS extraction</span>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="flex items-center gap-3 text-white/90"
                >
                  <CheckSquare className="h-4 w-4 text-emerald-300" />
                  <span className="text-sm">Form behavior simulation</span>
                </motion.div>
              </div>
            </div>
            
            <div className="space-y-3 mt-auto pt-10">
              <Badge variant="outline" className="bg-white/10 text-white border-none hover:bg-white/20 px-3 py-1.5">
                Enterprise Exclusive
              </Badge>
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <Lock className="h-3 w-3" />
                <span>SOC 2 & ISO 27001 Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <Shield className="h-3 w-3" />
                <span>End-to-end audit logging</span>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 max-h-[85vh] overflow-y-auto">
            <AlertDialogHeader className="p-6 pb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-violet-100 dark:bg-violet-900/30">
                  <Network className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <AlertDialogTitle className="text-2xl font-semibold">Advanced Website Cloner</AlertDialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">Deep inspection and reconstruction engine</p>
                </div>
              </div>
              
              <Tabs defaultValue="overview" className="w-full mt-8">
                <TabsList className="grid grid-cols-3 mb-6 p-1 bg-gray-100/80 dark:bg-gray-900/50 rounded-lg">
                  <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>Overview</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="capabilities" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      <span>Capabilities</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="recommendations" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <PanelLeft className="h-4 w-4" />
                      <span>Best Practices</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 animate-fade-in">
                  <AlertDialogDescription className="space-y-5">
                    <p className="text-base leading-relaxed">
                      The Neural Clone Engine leverages advanced machine learning algorithms to analyze, extract, and
                      reconstruct website structures with exceptional precision. Our proprietary DOM traversal technology
                      processes visual elements, interactive components, and form fields to deliver pixel-perfect simulations
                      that maintain both appearance and behavior.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/70 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                      >
                        <div className="flex items-start gap-4 mb-3">
                          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <BoxSelect className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-base">Neural Component Analysis</h4>
                            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                              Automatically identifies visual and interactive elements using computer vision algorithms
                            </p>
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/70 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                      >
                        <div className="flex items-start gap-4 mb-3">
                          <div className="p-2.5 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                            <Fingerprint className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-base">Behavioral Fingerprinting</h4>
                            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                              Replicates interaction patterns and form validation behavior for authentic user experiences
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                    
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-lg border border-amber-100 dark:border-amber-900/50 mt-4">
                      <div className="flex gap-3 items-start">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-amber-800 dark:text-amber-400 font-medium">Training & Education Use Only</h3>
                          <p className="text-amber-700 dark:text-amber-500 text-sm mt-2 leading-relaxed">
                            This powerful cloning capability is designed exclusively for authorized security awareness
                            training. All simulation activities are logged for compliance and auditing purposes, with
                            safeguards in place to prevent misuse.
                          </p>
                        </div>
                      </div>
                    </div>
                  </AlertDialogDescription>
                </TabsContent>
                
                <TabsContent value="capabilities" className="space-y-6 animate-fade-in-left">
                  <div className="space-y-5">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                      className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50"
                    >
                      <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                        <Server className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Complete DOM Extraction</h3>
                        <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
                          Our multilayer traversal technology captures the entire document structure, CSS styling, 
                          interactive elements, and visual components with exceptional fidelity, preserving the exact 
                          layout and design hierarchy.
                        </p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                      className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50"
                    >
                      <div className="p-2.5 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Form Detection & Simulation</h3>
                        <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
                          Advanced machine learning algorithms identify authentication fields, input validation patterns, 
                          and form submission handlers, creating realistic credential capture simulations with 
                          configurable behavior that mimics the original website.
                        </p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50"
                    >
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Asset Integration</h3>
                        <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
                          Automatically processes and integrates stylesheets, images, fonts, and other resources 
                          while maintaining proper references and fixing relative paths. Handles complex 
                          styling with support for CSS frameworks like Bootstrap and Tailwind.
                        </p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                      className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50"
                    >
                      <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                        <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Interaction Processing</h3>
                        <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
                          Replicates interactive elements like dropdown menus, toggles, and multi-step forms
                          with convincing visual feedback and validation behaviors, creating a seamless and
                          authentic user experience.
                        </p>
                      </div>
                    </motion.div>
                    
                    <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 mt-2">
                      <h4 className="font-medium mb-3">Technical Considerations</h4>
                      <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        <li>Single-page applications with complex state management may have limited interactivity</li>
                        <li>Websites with advanced anti-bot protection or browser fingerprinting may require additional configuration</li>
                        <li>Multi-factor authentication flows can be simulated but not fully replicated</li>
                        <li>WebSocket-dependent real-time features will have simplified behavior</li>
                        <li>Cross-origin resource restrictions may affect some external assets</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="recommendations" className="space-y-6 animate-fade-in-right">
                  <div className="space-y-5">
                    <h3 className="font-medium text-lg mb-4">Implementation Best Practices</h3>
                    
                    <div className="space-y-4">
                      {[
                        {
                          title: "Strategic Target Selection",
                          content: "Choose websites that align with your organization's threat landscape and industry-relevant phishing scenarios. Focus on services your employees regularly use.",
                          icon: <Eye className="h-5 w-5 text-violet-500 dark:text-violet-400" />
                        },
                        {
                          title: "Educational Integration",
                          content: "Pair simulations with immediate educational feedback when targets interact with phishing content. Use the teachable moment to reinforce security awareness.",
                          icon: <Zap className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                        },
                        {
                          title: "Progressive Difficulty",
                          content: "Implement a graduated campaign strategy that increases in sophistication as user awareness improves. Start simple and escalate complexity over time.",
                          icon: <ChevronRight className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                        },
                        {
                          title: "Comprehensive Testing",
                          content: "Validate cloned pages across multiple browsers, device types, and screen sizes before deployment to ensure consistent appearance and behavior.",
                          icon: <Globe className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                        }
                      ].map((item, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.4 }}
                          className="flex gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50"
                        >
                          <div className="p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                            {item.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-base">{item.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{item.content}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg border border-blue-100 dark:border-blue-900/50 mt-4">
                      <div className="flex gap-3 items-start">
                        <Shield className="h-5 w-5 text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-blue-800 dark:text-blue-400 font-medium">Compliance & Ethical Guidelines</h3>
                          <p className="text-blue-700 dark:text-blue-500 text-sm mt-2 leading-relaxed">
                            Implement clear indicators in training materials that identify simulated pages 
                            as security exercises. The platform automatically injects secure metadata tags that 
                            prevent search engine indexing and adds appropriate logging for compliance purposes.
                          </p>
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-500 text-sm">
                              <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span>Training purpose disclosure in simulation materials</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-500 text-sm">
                              <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span>Complete audit trails of all simulation activities</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-500 text-sm">
                              <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span>Secure handling of all captured simulation data</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Alternative Approaches</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/70 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                          <h5 className="font-medium text-base">Template Library</h5>
                          <p className="text-sm text-muted-foreground mt-1.5">
                            Pre-designed, compliance-vetted templates with customization options
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/70 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                          <h5 className="font-medium text-base">Visual Editor</h5>
                          <p className="text-sm text-muted-foreground mt-1.5">
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
              <AlertDialogCancel 
                onClick={onCancel}
                className="mt-0 bg-transparent border-gray-200 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-50"
              >
                Use Standard Editor Instead
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleProceed} 
                className={cn(
                  "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700",
                  "dark:from-violet-600 dark:to-indigo-600 dark:hover:from-violet-700 dark:hover:to-indigo-700",
                  "text-white shadow-md hover:shadow-lg transition-all duration-200"
                )}
              >
                Proceed with Neural Clone Engine
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CloneWebsiteWarning;
