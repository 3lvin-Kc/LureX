
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
import { LoaderCircle, Eye } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, { message: "Template name is required" }),
  subject: z.string().min(1, { message: "Email subject is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  description: z.string().optional(),
  html_content: z.string().min(1, { message: "HTML content is required" }),
  text_content: z.string().optional(),
});

interface TemplateFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  isEditing?: boolean;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ onSubmit, initialData, isEditing = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

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
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        subject: initialData.subject || "",
        category: initialData.category || "",
        description: initialData.description || "",
        html_content: initialData.html_content || "",
        text_content: initialData.text_content || "",
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    const htmlContent = form.getValues("html_content");
    setPreviewHtml(htmlContent);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
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
                            <SelectValue placeholder="Select a category" />
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
                    <FormDescription>
                      This will be the subject line of the phishing email
                    </FormDescription>
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

              <Tabs defaultValue="html" className="w-full">
                <TabsList>
                  <TabsTrigger value="html">HTML Content</TabsTrigger>
                  <TabsTrigger value="text">Text Content</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                
                <TabsContent value="html" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="html_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HTML Email Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            className="font-mono h-96"
                            placeholder="<html><body>Your email content here...</body></html>"
                          />
                        </FormControl>
                        <FormDescription>
                          HTML markup for the email template. Use variables like {"{name}"}, {"{email}"}, etc. for personalization
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="text_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plain Text Content (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            className="h-64"
                            placeholder="Plain text version of your email..."
                          />
                        </FormControl>
                        <FormDescription>
                          Plain text fallback for email clients that don't support HTML
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Button type="button" variant="outline" onClick={handlePreview}>
                      <Eye className="w-4 h-4 mr-2" />
                      Update Preview
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 bg-white min-h-64">
                    {previewHtml ? (
                      <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                    ) : (
                      <p className="text-muted-foreground">Click "Update Preview" to see how your email will look</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Update Template" : "Create Template"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateForm;
