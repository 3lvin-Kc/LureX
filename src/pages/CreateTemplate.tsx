import React, { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Save, Eye, Sparkles } from "lucide-react";
import { useTemplates } from "@/hooks/useTemplates";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().min(1, { message: "Template name is required" }),
  subject: z.string().min(1, { message: "Email subject is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  description: z.string().optional(),
  html_content: z.string().min(1, { message: "HTML content is required" }),
  text_content: z.string().optional(),
});

const CreateTemplate = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const { templates, createTemplate, updateTemplate, loading } = useTemplates();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject: "",
      category: "",
      description: "",
      html_content: "",
      text_content: "",
    },
  });

  useEffect(() => {
    if (id && templates.length > 0) {
      const template = templates.find(t => t.id === id);
      if (template) {
        setCurrentTemplate(template);
        form.reset({
          name: template.name,
          subject: template.subject,
          category: template.category,
          description: template.description || "",
          html_content: template.html_content,
          text_content: template.text_content || "",
        });
      }
    }
  }, [id, templates, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      if (id && currentTemplate) {
        await updateTemplate(id, {
          name: values.name,
          subject: values.subject,
          category: values.category,
          description: values.description,
          html_content: values.html_content,
          text_content: values.text_content,
          version: currentTemplate.version + 1,
        });
        toast({
          title: "Template updated",
          description: "Email template has been updated successfully"
        });
      } else {
        await createTemplate({
          name: values.name,
          subject: values.subject,
          category: values.category,
          description: values.description,
          html_content: values.html_content,
          text_content: values.text_content,
          version: 1,
        });
        toast({
          title: "Template created",
          description: "Email template has been created successfully"
        });
      }
      navigate("/templates");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save template",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateWithAI = async () => {
    const category = form.getValues("category");
    if (!category) {
      toast({
        title: "Category Required",
        description: "Please select a category first to generate content with AI",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await supabase.functions.invoke('generate-template-ai', {
        body: { category }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate template');
      }

      const { template } = response.data;
      
      // Update form with generated content
      form.setValue("name", template.name);
      form.setValue("subject", template.subject);
      form.setValue("html_content", template.html_content);
      form.setValue("description", template.description);

      toast({
        title: "Content Generated Successfully",
        description: "AI has generated professional template content using Gemini 1.5 Flash"
      });
    } catch (error: any) {
      console.error('AI Generation Error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content with AI. Please check the configuration and try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const watchedHtmlContent = form.watch("html_content");

  if (loading && id) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate("/templates")}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Templates
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {id ? "Edit Template" : "Create Template"}
            </h1>
            <p className="text-muted-foreground">
              {id ? "Modify your email template" : "Create a new email template for phishing campaigns"}
            </p>
          </div>
        </div>

        <Tabs defaultValue="editor" className="space-y-6">
          <TabsList>
            <TabsTrigger value="editor">Template Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="editor">
            <Card>
              <CardHeader>
                <CardTitle>Template Configuration</CardTitle>
                <CardDescription>
                  Configure your email template settings and content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Template Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter template name" {...field} />
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="phishing">Phishing</SelectItem>
                                <SelectItem value="spear-phishing">Spear Phishing</SelectItem>
                                <SelectItem value="credential-harvest">Credential Harvesting</SelectItem>
                                <SelectItem value="attachment">Malicious Attachment</SelectItem>
                                <SelectItem value="business-email">Business Email Compromise</SelectItem>
                                <SelectItem value="social-engineering">Social Engineering</SelectItem>
                                <SelectItem value="general">General</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email subject line" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief description of this template..."
                              className="h-20"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center gap-4 mb-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateWithAI}
                        disabled={isGenerating}
                        className="flex items-center gap-2"
                      >
                        <Sparkles size={16} />
                        {isGenerating ? "Generating..." : "Generate with AI"}
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name="html_content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>HTML Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter HTML email content..."
                              className="min-h-[300px] font-mono text-sm"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Use HTML markup for styling. Include inline CSS for better email client compatibility.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="text_content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plain Text Content (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter plain text version of the email..."
                              className="min-h-[150px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Plain text version for email clients that don't support HTML.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-4 pt-4">
                      <Button type="button" variant="outline" onClick={() => navigate("/templates")}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        <Save size={16} className="mr-2" />
                        {isSubmitting ? "Saving..." : (id ? "Update Template" : "Create Template")}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye size={20} />
                  Template Preview
                </CardTitle>
                <CardDescription>
                  Preview how your email template will look when sent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="bg-white border rounded-lg shadow-sm">
                    <div className="border-b p-4">
                      <div className="text-sm text-gray-600 mb-2">Subject:</div>
                      <div className="font-medium">{form.watch("subject") || "No subject"}</div>
                    </div>
                    <div className="p-4">
                      {watchedHtmlContent ? (
                        <div 
                          dangerouslySetInnerHTML={{ __html: watchedHtmlContent }}
                          className="prose max-w-none"
                        />
                      ) : (
                        <div className="text-gray-500 italic">
                          No HTML content to preview. Add HTML content in the editor tab.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CreateTemplate;
