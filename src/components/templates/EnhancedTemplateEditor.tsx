import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Eye, Code, Save, X, Plus, Info } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  html_content: z.string().min(1, "HTML content is required"),
  text_content: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EnhancedTemplateEditorProps {
  onSubmit: (data: FormData) => void;
  initialData?: Partial<FormData>;
  isLoading?: boolean;
}

const EnhancedTemplateEditor: React.FC<EnhancedTemplateEditorProps> = ({
  onSubmit,
  initialData = {},
  isLoading = false,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name || "",
      subject: initialData.subject || "",
      category: initialData.category || "general",
      description: initialData.description || "",
      html_content: initialData.html_content || "",
      text_content: initialData.text_content || "",
    },
  });

  const categories = [
    { value: "general", label: "General" },
    { value: "security", label: "Security Alert" },
    { value: "it", label: "IT Support" },
    { value: "hr", label: "HR Notice" },
    { value: "finance", label: "Finance" },
    { value: "social", label: "Social Engineering" },
  ];

  const templateExamples = [
    {
      name: "Password Reset",
      subject: "Urgent: Password Reset Required",
      html_content: `
        <p>Dear {{first_name}},</p>
        <p>Your password needs to be reset immediately.</p>
        <p>Click <a href="{{phishing_link}}">here</a> to reset.</p>
      `,
    },
    {
      name: "Company Announcement",
      subject: "Important Company Update",
      html_content: `
        <p>Dear employee,</p>
        <p>Please read the latest company announcement <a href="{{phishing_link}}">here</a>.</p>
      `,
    },
  ];

  const variables = [
    { name: "first_name", description: "Target's first name" },
    { name: "last_name", description: "Target's last name" },
    { name: "email", description: "Target's email address" },
    { name: "department", description: "Target's department" },
    { name: "position", description: "Target's job position" },
    { name: "phishing_link", description: "The tracking link for the phishing page" },
  ];

  const handlePreview = () => {
    const htmlContent = form.getValues("html_content");
    setPreviewContent(htmlContent);
    setActiveTab("preview");
  };

  const handleSubmit = (data: FormData) => {
    if (!data.html_content.trim()) {
      toast({
        title: "Validation Error",
        description: "HTML content is required",
        variant: "destructive",
      });
      return;
    }

    onSubmit(data);
  };

  const insertVariable = (variable: string) => {
    const textarea = document.querySelector('textarea[name="html_content"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = form.getValues("html_content");
      const newValue = value.substring(0, start) + `{{${variable}}}` + value.substring(end);
      form.setValue("html_content", newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  useEffect(() => {
    if (activeTab === "preview" && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(previewContent || form.getValues("html_content"));
        doc.close();
      }
    }
  }, [activeTab, previewContent]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Template Editor</CardTitle>
          <CardDescription>
            Create and customize email templates for your phishing campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
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
                        placeholder="Brief description of this template"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Template Content</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handlePreview}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="variables">Variables</TabsTrigger>
                  </TabsList>

                  <TabsContent value="edit" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="html_content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>HTML Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter HTML content for the email"
                              className="min-h-[300px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
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
                              placeholder="Enter plain text version of the email"
                              className="min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="preview">
                    <div className="border rounded-lg">
                      <div className="bg-muted p-3 border-b">
                        <h4 className="font-medium">Email Preview</h4>
                      </div>
                      <div className="p-4">
                        <iframe
                          ref={iframeRef}
                          className="w-full h-96 border-0"
                          title="Email Preview"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="variables">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-muted-foreground">
                          Click on any variable to insert it into your template
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {variables.map((variable) => (
                          <div
                            key={variable.name}
                            className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => insertVariable(variable.name)}
                          >
                            <div className="font-mono text-sm text-blue-600">
                              {`{{${variable.name}}}`}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {variable.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Template"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTemplateEditor;
