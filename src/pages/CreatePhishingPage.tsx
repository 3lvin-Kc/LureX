
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
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  category: z.string().optional(),
  htmlContent: z.string().min(1, { message: "HTML content is required" }),
  cssContent: z.string().optional(),
  jsContent: z.string().optional(),
});

const CreatePhishingPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "Custom",
      htmlContent: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Login Page</title>\n</head>\n<body>\n  <h1>Login Form</h1>\n  <form>\n    <label for=\"username\">Username:</label>\n    <input type=\"text\" id=\"username\" name=\"username\"><br><br>\n    <label for=\"password\">Password:</label>\n    <input type=\"password\" id=\"password\" name=\"password\"><br><br>\n    <button type=\"submit\">Login</button>\n  </form>\n</body>\n</html>",
      cssContent: "",
      jsContent: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from("phishing_pages").insert([
        {
          name: values.name,
          category: values.category,
          html_content: values.htmlContent,
          css_content: values.cssContent,
          js_content: values.jsContent,
          is_custom: true,
        },
      ]).select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Phishing page created successfully",
      });
      navigate("/phishing-pages");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create phishing page",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-3xl font-bold">Create Phishing Page</h1>
          <p className="text-muted-foreground">Create a custom phishing page from scratch</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Page Details</CardTitle>
            <CardDescription>
              Enter the details and content for your custom phishing page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Page Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Company Login Page" {...field} />
                        </FormControl>
                        <FormDescription>
                          A descriptive name for your phishing page
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
                            <SelectItem value="Custom">Custom</SelectItem>
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

                <FormField
                  control={form.control}
                  name="htmlContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTML Content</FormLabel>
                      <FormControl>
                        <textarea
                          className="min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                          placeholder="<!DOCTYPE html>..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The HTML structure of your phishing page
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cssContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CSS Content (Optional)</FormLabel>
                      <FormControl>
                        <textarea
                          className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                          placeholder="body { ... }"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        CSS styles to enhance the appearance of your page
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jsContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>JavaScript Content (Optional)</FormLabel>
                      <FormControl>
                        <textarea
                          className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                          placeholder="function handleSubmit() { ... }"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        JavaScript to add interactivity to your phishing page
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Create Phishing Page
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

export default CreatePhishingPage;
