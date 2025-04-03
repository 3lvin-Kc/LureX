
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import CloneWebsiteWarning from "@/components/phishing/CloneWebsiteWarning";
import { AlertCircle, FileCode, Globe, CheckCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import DOMPurify from "dompurify";

type CloneOptions = {
  advancedCloning: boolean;
  customizations?: {
    companyName?: string;
    companyLogo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
};

const defaultCustomizations = {
  companyName: "",
  companyLogo: "",
  primaryColor: "#3b82f6",
  secondaryColor: "#6b7280",
};

const CloneWebsitePage = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [cloneOptions, setCloneOptions] = useState<CloneOptions>({
    advancedCloning: false,
    customizations: defaultCustomizations,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to use this feature",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
        if (!session) {
          navigate("/auth");
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  const isValidUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const startProgressSimulation = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 300);
    
    return () => clearInterval(interval);
  };

  const completeProgress = () => {
    setProgress(100);
    setTimeout(() => setProgress(null), 1000);
  };

  const handleClone = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL to clone",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid http:// or https:// URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError("");
    setShowPreview(false);
    
    // Start progress simulation
    const stopProgress = startProgressSimulation();

    try {
      // Prepare the request body
      const requestBody = {
        url,
        name: new URL(url).hostname,
        category: 'Cloned',
        advancedCloning: cloneOptions.advancedCloning,
      };
      
      // Add customizations if advanced cloning is enabled
      if (cloneOptions.advancedCloning && cloneOptions.customizations) {
        requestBody.customizations = cloneOptions.customizations;
      }
      
      console.log("Cloning website with options:", requestBody);
      
      // Use the Supabase Edge Function for cloning
      const { data, error } = await supabase.functions.invoke('clone-website', {
        body: requestBody
      });

      // Stop progress simulation
      stopProgress();

      if (error) {
        completeProgress();
        throw new Error(error.message);
      }
      
      if (data.error) {
        completeProgress();
        throw new Error(data.error);
      }
      
      console.log(`Website cloned: ${url} at ${new Date().toISOString()}`);
      completeProgress();
      
      if (data.data && data.data.html_content) {
        setHtml(data.data.html_content);
        setShowPreview(true);
        
        toast({
          title: "Success",
          description: "Website cloned successfully",
        });
      } else {
        // If we got success but no HTML content
        const pageId = data.data?.id;
        if (pageId) {
          // If we have a page ID, navigate to that page
          toast({
            title: "Success",
            description: "Website cloned successfully. Redirecting to preview...",
          });
          setTimeout(() => {
            navigate(`/phishing-pages/${pageId}/preview`);
          }, 1500);
        } else {
          throw new Error("No HTML content returned");
        }
      }
    } catch (error) {
      console.error("Error cloning website:", error);
      setError(error instanceof Error ? error.message : "Failed to clone website. Please try again or use a different URL.");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clone website. Please try a different URL.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPage = () => {
    navigate("/phishing-pages/new");
  };

  const handleUseHtml = () => {
    navigate("/phishing-pages/new", { state: { html } });
  };

  const handleAdvancedCloningToggle = (enabled: boolean) => {
    setCloneOptions({
      ...cloneOptions,
      advancedCloning: enabled,
    });
  };

  const updateCustomization = (key: keyof typeof defaultCustomizations, value: string) => {
    setCloneOptions({
      ...cloneOptions,
      customizations: {
        ...cloneOptions.customizations,
        [key]: value,
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 max-w-5xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You must be logged in to access this page.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <CloneWebsiteWarning 
        open={showWarning}
        onOpenChange={setShowWarning}
        onProceed={() => setShowWarning(false)}
        onCancel={handleNewPage}
      />

      <div className="container mx-auto p-4 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Clone Website</h1>
          <p className="text-muted-foreground">
            Enter a URL to clone its HTML content and create a phishing page.
          </p>
        </div>

        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Security Notice</AlertTitle>
          <AlertDescription>
            This feature is for security awareness and education purposes only. Always use responsibly and with proper authorization.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Website URL</CardTitle>
            <CardDescription>
              Enter the URL of the website you want to clone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="url" className="text-right">
                    URL
                  </Label>
                  <Input
                    id="url"
                    className="col-span-3"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="url" className="text-right">
                    URL
                  </Label>
                  <Input
                    id="url"
                    className="col-span-3"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="advancedCloning" className="text-right">
                    Advanced Cloning
                  </Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Switch
                      id="advancedCloning"
                      checked={cloneOptions.advancedCloning}
                      onCheckedChange={handleAdvancedCloningToggle}
                    />
                    <span className="text-sm text-muted-foreground">
                      Enable company-specific customizations
                    </span>
                  </div>
                </div>
                
                {cloneOptions.advancedCloning && (
                  <>
                    <Separator className="my-4" />
                    <h3 className="text-md font-medium mb-2">Customizations</h3>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="companyName" className="text-right">
                        Company Name
                      </Label>
                      <Input
                        id="companyName"
                        className="col-span-3"
                        value={cloneOptions.customizations?.companyName || ""}
                        onChange={(e) => updateCustomization("companyName", e.target.value)}
                        placeholder="Acme Inc."
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="companyLogo" className="text-right">
                        Logo URL
                      </Label>
                      <Input
                        id="companyLogo"
                        className="col-span-3"
                        value={cloneOptions.customizations?.companyLogo || ""}
                        onChange={(e) => updateCustomization("companyLogo", e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="primaryColor" className="text-right">
                        Primary Color
                      </Label>
                      <div className="col-span-3 flex items-center space-x-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          className="w-10 h-10 p-1"
                          value={cloneOptions.customizations?.primaryColor || "#3b82f6"}
                          onChange={(e) => updateCustomization("primaryColor", e.target.value)}
                        />
                        <Input
                          value={cloneOptions.customizations?.primaryColor || "#3b82f6"}
                          onChange={(e) => updateCustomization("primaryColor", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="secondaryColor" className="text-right">
                        Secondary Color
                      </Label>
                      <div className="col-span-3 flex items-center space-x-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          className="w-10 h-10 p-1"
                          value={cloneOptions.customizations?.secondaryColor || "#6b7280"}
                          onChange={(e) => updateCustomization("secondaryColor", e.target.value)}
                        />
                        <Input
                          value={cloneOptions.customizations?.secondaryColor || "#6b7280"}
                          onChange={(e) => updateCustomization("secondaryColor", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button variant="outline" onClick={handleNewPage}>
              <FileCode className="mr-2 h-4 w-4" /> New Page
            </Button>
            <Button onClick={handleClone} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Cloning...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" /> Clone Website
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {progress !== null && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {progress < 100 ? "Cloning website..." : "Clone complete!"}
            </p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showPreview && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Cloned HTML Content</CardTitle>
              <CardDescription>
                Review the cloned HTML content before saving.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Textarea
                value={html}
                className="min-h-[300px] font-mono text-sm"
                readOnly
              />
              <Button onClick={handleUseHtml} className="w-full">
                <CheckCircle className="mr-2 h-4 w-4" /> Use this HTML
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CloneWebsitePage;
