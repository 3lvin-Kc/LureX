
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import CloneWebsiteWarning from '@/components/phishing/CloneWebsiteWarning';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Globe, Info, AlertCircle, Loader2, Layers, ChevronsUp, Award,
  Zap, Eye, Database, Code, FileCode, BarChart3, Lock, Radar
} from 'lucide-react';
import { securityLogger, SecurityEventType } from '@/utils/securityLogger';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiRateLimiter } from '@/utils/rateLimiter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

const CloneWebsitePage = () => {
  const [url, setUrl] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [warningAccepted, setWarningAccepted] = useState<boolean>(false);
  const [advancedCloning, setAdvancedCloning] = useState<boolean>(false);
  const [extractDynamicContent, setExtractDynamicContent] = useState<boolean>(false);
  const [preserveInteractivity, setPreserveInteractivity] = useState<boolean>(false);
  const [includeAssets, setIncludeAssets] = useState<boolean>(true);
  const [crawlDepth, setCrawlDepth] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [showWarningDialog, setShowWarningDialog] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("basic");
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const validateInput = () => {
    if (!url) {
      setError('Please enter a URL to clone');
      return false;
    }
    
    if (!name) {
      setError('Please enter a name for the phishing page');
      return false;
    }
    
    if (!category) {
      setError('Please enter a category for the phishing page');
      return false;
    }
    
    if (!agreeToTerms) {
      setError('You must agree to the terms before proceeding');
      return false;
    }
    
    if (!warningAccepted) {
      setError('You must acknowledge the warning before proceeding');
      return false;
    }
    
    try {
      new URL(url);
    } catch (e) {
      setError('Please enter a valid URL including http:// or https://');
      return false;
    }
    
    setError(null);
    return true;
  };
  
  const handleClone = async () => {
    if (!validateInput()) return;
    
    if (!apiRateLimiter.tryRequest()) {
      toast({
        title: "Rate limit exceeded",
        description: "Please wait a moment before trying again",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      setProgress(10);
      setProgressMessage('Initializing cloning process');
      
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Website cloning initiated",
        { url, name, category, advancedCloning }
      );
      
      setProgress(20);
      setProgressMessage('Requesting website content');
      
      // Simulate progress updates for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) {
            const newProgress = prev + Math.floor(Math.random() * 5) + 1;
            switch (true) {
              case newProgress > 80:
                setProgressMessage('Processing styles and scripts');
                break;
              case newProgress > 60:
                setProgressMessage('Analyzing page structure');
                break;
              case newProgress > 40:
                setProgressMessage('Extracting visual components');
                break;
              case newProgress > 20:
                setProgressMessage('Downloading page resources');
                break;
            }
            return newProgress;
          }
          return prev;
        });
      }, 800);
      
      const { data, error } = await supabase.functions.invoke('clone-website', {
        body: { 
          url, 
          name, 
          category,
          advancedCloning,
          extractDynamicContent,
          preserveInteractivity,
          includeAssets,
          crawlDepth
        }
      });
      
      clearInterval(progressInterval);
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to clone website');
      }
      
      setProgress(100);
      setProgressMessage('Cloning complete!');
      
      toast({
        title: "Website Cloned Successfully",
        description: `Cloned ${name} with ${data.metadata?.assets || 0} assets and ${data.metadata?.forms || 0} form fields.`,
      });
      
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        "Website successfully cloned",
        { url, pageId: data.pageId }
      );
      
      navigate('/phishing-pages');
    } catch (error: any) {
      setProgress(0);
      
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        "Website cloning failed",
        { url, error: error.message }
      );
      
      toast({
        title: "Error",
        description: "Failed to clone website. Please try again or use a different URL.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const ProgressBar = () => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">{progressMessage}</span>
        <span className="text-gray-500">{progress}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
        <motion.div 
          className="bg-gradient-to-r from-violet-500 to-indigo-600 h-3 rounded-full transition-all" 
          style={{ width: `${progress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
              Advanced Website Cloner
            </h1>
            <p className="text-muted-foreground mt-2">Create high-fidelity phishing simulations from existing websites</p>
          </div>
        </div>
        
        <div className="grid gap-8">
          <CloneWebsiteWarning 
            open={showWarningDialog} 
            onOpenChange={setShowWarningDialog}
            onProceed={() => {
              setShowWarningDialog(false);
              setWarningAccepted(true);
            }}
            onCancel={() => {
              setShowWarningDialog(false);
              navigate('/phishing-pages');
            }}
          />
          
          {!warningAccepted && (
            <Alert variant="destructive" className="shadow-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Please review and accept the warning above before proceeding.
              </AlertDescription>
            </Alert>
          )}
          
          {warningAccepted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-md border-gray-100 dark:border-gray-800 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-gray-900 dark:to-gray-900/70">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg shadow-md">
                      <Layers className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>Clone a Website</CardTitle>
                      <CardDescription className="mt-1">
                        Create a pixel-perfect replica of any website for security training
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid grid-cols-3 mb-2 bg-gray-100/80 dark:bg-gray-900/50 p-1 rounded-lg">
                      <TabsTrigger 
                        value="basic" 
                        className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800"
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>Basic Info</span>
                        </div>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="advanced" 
                        className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800"
                      >
                        <div className="flex items-center gap-2">
                          <ChevronsUp className="h-4 w-4" />
                          <span>Advanced</span>
                        </div>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="options" 
                        className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800"
                      >
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          <span>Options</span>
                        </div>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-6 animate-fadeIn pt-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="url" className="text-base">Website URL</Label>
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-l-md border-y border-l border-gray-200 dark:border-gray-800">
                              <Globe className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <Input
                              id="url"
                              placeholder="https://example.com"
                              value={url}
                              onChange={(e) => setUrl(e.target.value)}
                              disabled={isLoading}
                              className="flex-1 rounded-l-none focus-visible:ring-violet-500"
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Enter the full URL including http:// or https://
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-base">Phishing Page Name</Label>
                            <Input
                              id="name"
                              placeholder="Corporate Login Portal"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              disabled={isLoading}
                              className="focus-visible:ring-violet-500"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="category" className="text-base">Category</Label>
                            <Input
                              id="category"
                              placeholder="Finance, Healthcare, Technology, etc."
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              disabled={isLoading}
                              className="focus-visible:ring-violet-500"
                            />
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="agreeToTerms"
                              checked={agreeToTerms}
                              onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                              disabled={isLoading}
                            />
                            <Label htmlFor="agreeToTerms" className="font-medium">
                              I agree to use this feature ethically and in compliance with applicable laws
                            </Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          onClick={() => setActiveTab("advanced")}
                          variant="outline"
                          className="gap-2"
                        >
                          Next
                          <ChevronsUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="advanced" className="space-y-6 animate-fadeIn pt-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900/50">
                          <div className="flex gap-3 items-start mb-4">
                            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                              <Database className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                              <h3 className="font-medium text-base">Neural Clone Engine</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Enhanced website reconstruction with superior visual fidelity
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="advancedCloning"
                                  checked={advancedCloning}
                                  onCheckedChange={(checked) => setAdvancedCloning(checked as boolean)}
                                  disabled={isLoading}
                                />
                                <Label htmlFor="advancedCloning" className="font-medium">
                                  Advanced Neural Cloning
                                </Label>
                              </div>
                              <Badge variant="outline" className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800">
                                Enterprise
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground ml-6">
                              Comprehensive DOM analysis, CSS extraction, and asset processing for pixel-perfect replicas
                            </p>
                          </div>
                        </div>
                        
                        <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900/50">
                          <div className="flex gap-3 items-start mb-4">
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="font-medium text-base">Interactive Behavior</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Simulate interactive elements and form validation
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="preserveInteractivity"
                                  checked={preserveInteractivity}
                                  onCheckedChange={(checked) => setPreserveInteractivity(checked as boolean)}
                                  disabled={isLoading}
                                />
                                <Label htmlFor="preserveInteractivity" className="font-medium">
                                  Preserve Interactivity
                                </Label>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground ml-6">
                              Maintain form validation, button behaviors, and UI component interactions
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900/50">
                          <div className="flex gap-3 items-start mb-4">
                            <div className="p-2.5 bg-green-50 dark:bg-green-900/30 rounded-lg">
                              <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h3 className="font-medium text-base">Dynamic Content</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Extract JavaScript-rendered page content
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="extractDynamicContent"
                                checked={extractDynamicContent}
                                onCheckedChange={(checked) => setExtractDynamicContent(checked as boolean)}
                                disabled={isLoading}
                              />
                              <Label htmlFor="extractDynamicContent" className="font-medium">
                                Extract Dynamic Content
                              </Label>
                            </div>
                            <p className="text-sm text-muted-foreground ml-6">
                              Capture content rendered by JavaScript after page load
                            </p>
                          </div>
                        </div>
                        
                        <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900/50">
                          <div className="flex gap-3 items-start mb-4">
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                              <FileCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <h3 className="font-medium text-base">Resource Management</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Handle website assets and linked resources
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="includeAssets"
                                checked={includeAssets}
                                onCheckedChange={(checked) => setIncludeAssets(checked as boolean)}
                                disabled={isLoading}
                              />
                              <Label htmlFor="includeAssets" className="font-medium">
                                Process External Assets
                              </Label>
                            </div>
                            <p className="text-sm text-muted-foreground ml-6">
                              Download and process images, stylesheets, and other linked resources
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <Button
                          onClick={() => setActiveTab("basic")}
                          variant="outline"
                          className="gap-2"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={() => setActiveTab("options")}
                          variant="outline"
                          className="gap-2"
                        >
                          Next
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="options" className="space-y-6 animate-fadeIn pt-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900/50">
                          <div className="flex gap-3 items-start mb-4">
                            <div className="p-2.5 bg-violet-50 dark:bg-violet-900/30 rounded-lg">
                              <Radar className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                              <h3 className="font-medium text-base">Crawl Depth</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                How deeply to analyze the website structure
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-6 mt-4">
                            <div>
                              <div className="flex justify-between mb-2">
                                <Label htmlFor="crawlDepth" className="font-medium">
                                  Depth Level: {crawlDepth}
                                </Label>
                                <span className="text-sm text-muted-foreground">
                                  {crawlDepth === 1 ? "Base page only" : 
                                   crawlDepth === 2 ? "One level deep" : 
                                   "Comprehensive analysis"}
                                </span>
                              </div>
                              <Slider 
                                id="crawlDepth"
                                value={[crawlDepth]} 
                                min={1} 
                                max={3} 
                                step={1} 
                                disabled={isLoading}
                                onValueChange={(values) => setCrawlDepth(values[0])}
                                className="my-4"
                              />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Single Page</span>
                                <span>Linked Pages</span>
                                <span>Deep Crawl</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900/50">
                          <div className="flex gap-3 items-start mb-4">
                            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                              <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                              <h3 className="font-medium text-base">Security Features</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Built-in security and compliance safeguards
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mt-2">
                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                              <Award className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium">Comprehensive audit logging</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                              <Shield className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">Compliance metadata injection</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                              <Code className="h-4 w-4 text-violet-500" />
                              <span className="text-sm font-medium">Search engine blocking</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {error && (
                        <Alert variant="destructive" className="mt-4 shadow-sm">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      
                      {isLoading && progress > 0 && <ProgressBar />}
                      
                      <div className="flex justify-between">
                        <Button
                          onClick={() => setActiveTab("advanced")}
                          variant="outline"
                          className="gap-2"
                        >
                          Back
                        </Button>
                        <Button 
                          onClick={handleClone} 
                          disabled={isLoading}
                          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Cloning...
                            </>
                          ) : (
                            'Clone Website'
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          <Card className="shadow-sm">
            <CardHeader className="bg-white dark:bg-gray-900/60 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>About Neural Clone Engine</CardTitle>
                  <CardDescription className="mt-1">
                    Important information about using the advanced website cloning feature
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900/50">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-300 font-medium">Capabilities</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                  <p className="mt-1 leading-relaxed">
                    The Neural Clone Engine creates high-fidelity replicas of websites using advanced DOM parsing, 
                    CSS extraction, and visual component analysis. It captures HTML structure, styling, forms, and 
                    interactive elements to create convincing simulations for security awareness training.
                  </p>
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Best Practices</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm">
                    <li>Select websites relevant to your organization's security training objectives</li>
                    <li>Customize cloned pages to align with specific training scenarios</li>
                    <li>Provide educational resources after simulations to reinforce learning</li>
                    <li>Implement progressive training campaigns that gradually increase in complexity</li>
                    <li>Test cloned pages across different browsers and devices before deployment</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertTitle className="text-red-800 dark:text-red-400">Limitations</AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-400">
                  <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm">
                    <li>Single-page applications with complex state management may have limited functionality</li>
                    <li>Websites with advanced anti-bot protection may not clone completely</li>
                    <li>Multi-factor authentication flows can be simulated but not fully replicated</li>
                    <li>JavaScript-dependent functionality may be partially limited</li>
                    <li>Some external resources might be blocked by cross-origin restrictions</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CloneWebsitePage;
