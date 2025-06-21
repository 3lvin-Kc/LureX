
import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { usePhishingPages } from "@/hooks/usePhishingPages";

const formSchema = z.object({
  name: z.string().min(1, { message: "Page name is required" }),
  category: z.string().optional(),
  html_content: z.string().min(1, { message: "HTML content is required" }),
  css_content: z.string().optional(),
  js_content: z.string().optional(),
});

const CreatePhishingPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const { createPage } = usePhishingPages();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      html_content: "",
      css_content: "",
      js_content: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsCreating(true);
    try {
      await createPage({
        name: values.name,
        category: values.category,
        html_content: values.html_content,
        css_content: values.css_content || "",
        js_content: values.js_content || "",
        is_custom: true,
      });
      
      navigate("/phishing-pages");
    } catch (error: any) {
      console.error("Error creating page:", error);
      // Error handling is done in the hook
    } finally {
      setIsCreating(false);
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
          <p className="text-muted-foreground">Create a custom phishing page for your campaigns</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Page Details</CardTitle>
            <CardDescription>
              Configure your custom phishing page content and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter page name" {...field} />
                      </FormControl>
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
                          <SelectItem value="Government">Government</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="html_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTML Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="font-mono h-64"
                          placeholder="<html><body>Your phishing page content here...</body></html>"
                        />
                      </FormControl>
                      <FormDescription>
                        HTML markup for the phishing page
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="css_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CSS Content (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="font-mono h-40"
                          placeholder="body { font-family: Arial; }"
                        />
                      </FormControl>
                      <FormDescription>
                        CSS styles for the phishing page
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="js_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>JavaScript Content (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="font-mono h-40"
                          placeholder="// Your JavaScript code here"
                        />
                      </FormControl>
                      <FormDescription>
                        JavaScript code for the phishing page
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/phishing-pages")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Create Page
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
