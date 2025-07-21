import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { usePhishingPages } from "@/hooks/usePhishingPages";

const formSchema = z.object({
  name: z.string().min(1, { message: "Page name is required" }),
  category: z.string().optional(),
  html_content: z.string().optional(),
  css_content: z.string().optional(),
  js_content: z.string().optional(),
});

const EditPhishingPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { phishingPages, updatePhishingPage, loading } = usePhishingPages();

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

  useEffect(() => {
    if (!loading && phishingPages.length > 0 && id) {
      const page = phishingPages.find(p => p.id === id);
      if (page) {
        form.reset({
          name: page.name,
          category: page.category || "",
          html_content: page.html_content || "",
          css_content: page.css_content || "",
          js_content: page.js_content || "",
        });
        setIsLoading(false);
      } else {
        toast({
          title: "Error",
          description: "Phishing page not found",
          variant: "destructive",
        });
        navigate("/phishing-pages");
      }
    } else if (!loading) {
      setIsLoading(false);
    }
  }, [id, phishingPages, loading, form, toast, navigate]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      await updatePhishingPage(id, {
        name: values.name,
        category: values.category,
        html_content: values.html_content,
        css_content: values.css_content,
        js_content: values.js_content,
      });
      
      navigate("/phishing-pages");
    } catch (error: any) {
      console.error("Error updating page:", error);
      // Error handling is done in the hook
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="flex justify-center items-center h-64">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
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
          <h1 className="text-3xl font-bold">Edit Phishing Page</h1>
          <p className="text-muted-foreground">Modify your phishing page content and settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Page Details</CardTitle>
            <CardDescription>
              Edit the content and settings of your phishing page
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
                        <Input {...field} />
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
                          <SelectItem value="Cloned">Cloned</SelectItem>
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
                          placeholder="<html>...</html>"
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
                      <FormLabel>CSS Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="font-mono h-40"
                          placeholder="body { ... }"
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
                      <FormLabel>JavaScript Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="font-mono h-40"
                          placeholder="function() { ... }"
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
                    onClick={() => navigate(`/phishing-pages/${id}/preview`)}
                  >
                    Preview
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
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

export default EditPhishingPage;
