
import React, { useState } from "react";
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
import { ArrowLeft, Info, LoaderCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL" }),
  name: z.string().optional(),
  category: z.string().optional(),
});

const CloneWebsitePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCloning, setIsCloning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      name: "",
      category: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsCloning(true);
    setError(null);
    try {
      console.log("Starting website clone for:", values.url);
      
      const { data, error } = await supabase.functions.invoke("clone-website", {
        body: values
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
          <h1 className="text-3xl font-bold">Clone Website</h1>
          <p className="text-muted-foreground">Create a phishing page by cloning an existing website</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Clone from URL</CardTitle>
            <CardDescription>
              Enter the URL of the website you want to clone for your phishing campaign
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

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/login" 
                          {...field} 
                        />
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
                        <FormLabel>Page Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Company Login" {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave blank to use domain name
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
                        <FormLabel>Category (Optional)</FormLabel>
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
