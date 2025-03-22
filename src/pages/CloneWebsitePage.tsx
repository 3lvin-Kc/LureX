
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Info, LoaderCircle, Globe, Lock, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConsentPrompt from "@/components/compliance/ConsentPrompt";

const popularServices = [
  { name: "Custom URL", value: "custom", description: "Enter any website URL to clone" },
  { name: "Google Login", value: "google", description: "Google account login page", url: "https://accounts.google.com/signin" },
  { name: "Microsoft 365", value: "microsoft", description: "Microsoft 365 login portal", url: "https://login.microsoftonline.com" },
  { name: "Facebook", value: "facebook", description: "Facebook login page", url: "https://www.facebook.com/login" },
  { name: "LinkedIn", value: "linkedin", description: "LinkedIn sign in page", url: "https://www.linkedin.com/login" },
  { name: "Instagram", value: "instagram", description: "Instagram login page", url: "https://www.instagram.com/accounts/login" },
  { name: "Amazon", value: "amazon", description: "Amazon sign in page", url: "https://www.amazon.com/ap/signin" },
  { name: "PayPal", value: "paypal", description: "PayPal login portal", url: "https://www.paypal.com/signin" },
  { name: "Dropbox", value: "dropbox", description: "Dropbox login page", url: "https://www.dropbox.com/login" },
  { name: "Twitter", value: "twitter", description: "Twitter login page", url: "https://twitter.com/login" },
];

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL" }),
  name: z.string().optional(),
  category: z.string().optional(),
  template: z.string().optional(),
  customizations: z.object({
    companyLogo: z.string().optional(),
    companyName: z.string().optional(),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
  }).optional(),
});

const CloneWebsitePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCloning, setIsCloning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("manual");
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const [showConsentPrompt, setShowConsentPrompt] = useState(false);
  
  useEffect(() => {
    // Check if the user has already accepted the consent
    const hasConsented = localStorage.getItem("phishing_consent_accepted");
    setShowConsentPrompt(!hasConsented);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      name: "",
      category: "",
      template: "custom",
      customizations: {
        companyLogo: "",
        companyName: "",
        primaryColor: "",
        secondaryColor: "",
      },
    },
  });

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    
    if (template !== "custom") {
      const selectedService = popularServices.find(service => service.value === template);
      if (selectedService && selectedService.url) {
        form.setValue("url", selectedService.url);
        form.setValue("name", selectedService.name);
        form.setValue("category", "Corporate");
      }
    } else {
      form.setValue("url", "");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsCloning(true);
    setError(null);
    try {
      console.log("Starting website clone for:", values.url);
      
      const requestData = {
        ...values,
        advancedCloning: true, // Enable advanced cloning features
      };
      
      const { data, error } = await supabase.functions.invoke("clone-website", {
        body: requestData
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(`Failed to clone website: ${error.message}`);
      }

      if (!data || !data.success) {
        console.error("Unsuccessful clone:", data);
        throw new Error(data?.error || "Failed to clone website");
      }

      toast({
        title: "Success",
        description: "Website cloned successfully",
      });
      navigate("/phishing-pages");
    } catch (error) {
      console.error("Clone error:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to clone website. Please try a different URL.";
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCloning(false);
    }
  };

  const handleConsentAccept = () => {
    setShowConsentPrompt(false);
  };

  const handleConsentDecline = () => {
    navigate("/phishing-pages");
  };

  if (showConsentPrompt) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 py-12 max-w-4xl">
          <ConsentPrompt 
            onAccept={handleConsentAccept} 
            onDecline={handleConsentDecline} 
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/phishing-pages")}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Pages
          </Button>
          <h1 className="text-3xl font-bold">Advanced Website Cloner</h1>
          <p className="text-muted-foreground">Create realistic phishing simulation pages by cloning existing login portals</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Clone Website</CardTitle>
            <CardDescription>
              Select a popular service or enter a custom URL to create a phishing simulation page
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="templates">Popular Templates</TabsTrigger>
                <TabsTrigger value="manual">Manual URL Entry</TabsTrigger>
              </TabsList>
              
              <TabsContent value="templates" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularServices.map((service) => (
                    <Card 
                      key={service.value}
                      className={`cursor-pointer transition-colors ${
                        selectedTemplate === service.value 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleTemplateChange(service.value)}
                    >
                      <CardContent className="p-4 flex items-start gap-3">
                        {selectedTemplate === service.value && (
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        )}
                        <div className={!selectedTemplate ? "ml-8" : ""}>
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="manual">
                <Alert variant="default" className="mb-6 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Tips for successful cloning</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Use direct login page URLs rather than home pages</li>
                      <li>Some websites with advanced security features may be harder to clone</li>
                      <li>Corporate login portals and simple form-based logins work best</li>
                      <li>After cloning, use the preview feature to verify functionality</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                            <Globe className="h-4 w-4" />
                          </span>
                          <Input 
                            placeholder="https://example.com/login" 
                            {...field} 
                            className="rounded-l-none"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Enter the full URL of the login page you want to clone
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Page Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Company Login" {...field} />
                        </FormControl>
                        <FormDescription>
                          A name to identify this phishing page
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Social">Social Media</SelectItem>
                            <SelectItem value="Banking">Banking</SelectItem>
                            <SelectItem value="Corporate">Corporate</SelectItem>
                            <SelectItem value="Cloud">Cloud Services</SelectItem>
                            <SelectItem value="E-commerce">E-commerce</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Category helps organize your phishing pages
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Enterprise customization section */}
                <Card className="border-dashed bg-muted/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <Lock className="mr-2 h-4 w-4" />
                      <CardTitle className="text-base font-medium">Enterprise Customizations</CardTitle>
                    </div>
                    <CardDescription>
                      Customize the cloned page for more realistic enterprise phishing simulations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customizations.companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Acme Corporation" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="customizations.companyLogo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Logo URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://company.com/logo.png" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="customizations.primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Brand Color</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="color"
                                  {...field}
                                  className="w-10 h-10 p-1 rounded cursor-pointer"
                                />
                                <Input 
                                  placeholder="#0000FF"
                                  value={field.value}
                                  onChange={field.onChange}
                                  className="flex-grow"
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="customizations.secondaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary Brand Color</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="color"
                                  {...field}
                                  className="w-10 h-10 p-1 rounded cursor-pointer"
                                />
                                <Input 
                                  placeholder="#00FF00" 
                                  value={field.value}
                                  onChange={field.onChange}
                                  className="flex-grow"
                                />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isCloning}>
                    {isCloning && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Clone Website
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CloneWebsitePage;
