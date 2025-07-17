
import React, { useState, useRef, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  LoaderCircle, 
  Eye, 
  Code, 
  Palette, 
  Type, 
  Image, 
  Link2, 
  Copy,
  Download,
  Upload,
  Smartphone,
  Monitor,
  Tablet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, { message: "Template name is required" }),
  subject: z.string().min(1, { message: "Email subject is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  description: z.string().optional(),
  html_content: z.string().min(1, { message: "HTML content is required" }),
  text_content: z.string().optional(),
});

interface EnhancedTemplateEditorProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  isEditing?: boolean;
}

const EnhancedTemplateEditor: React.FC<EnhancedTemplateEditorProps> = ({ 
  onSubmit, 
  initialData, 
  isEditing = false 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showVariables, setShowVariables] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

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

  const variables = [
    { name: "{{first_name}}", description: "Target's first name" },
    { name: "{{last_name}}", description: "Target's last name" },
    { name: "{{email}}", description: "Target's email address" },
    { name: "{{department}}", description: "Target's department" },
    { name: "{{position}}", description: "Target's job position" },
    { name: "{{company}}", description: "Target's company name" },
    { name: "{{phishing_link}}", description: "Tracking link for the campaign" }
  ];

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
      setPreviewHtml(initialData.html_content || "");
    }
  }, [initialData, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      toast({
        title: "Template saved",
        description: `Template "${values.name}" has been saved successfully`
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    const htmlContent = form.getValues("html_content");
    setPreviewHtml(htmlContent);
    
    if (previewRef.current) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  };

  const insertVariable = (variable: string) => {
    const currentContent = form.getValues("html_content");
    const textarea = document.querySelector('textarea[name="html_content"]') as HTMLTextAreaElement;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = currentContent.substring(0, start) + variable + currentContent.substring(end);
      
      form.setValue("html_content", newContent);
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const insertTemplate = (templateType: string) => {
    let template = "";
    
    switch (templateType) {
      case 'basic':
        template = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #333; text-align: center;">Hello {{first_name}}!</h1>
        <p style="color: #666; line-height: 1.6;">Your message content goes here...</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{phishing_link}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Click Here</a>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center;">Best regards,<br>Security Team</p>
    </div>
</body>
</html>`;
        break;
      case 'security':
        template = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Alert</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-left: 4px solid #dc3545; padding: 20px;">
        <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <strong>⚠️ Security Alert</strong>
        </div>
        <h2 style="color: #333;">Hi {{first_name}},</h2>
        <p style="color: #666; line-height: 1.6;">We detected unusual activity on your account associated with {{email}}.</p>
        <p style="color: #666; line-height: 1.6;"><strong>Action Required:</strong> Please verify your account immediately to prevent suspension.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{phishing_link}}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Account Now</a>
        </div>
        <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
    </div>
</body>
</html>`;
        break;
    }
    
    form.setValue("html_content", template);
    setPreviewHtml(template);
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Enhanced Template Editor
          </CardTitle>
          <CardDescription>
            Create professional phishing email templates with advanced features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Basic Information */}
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
                          <SelectItem value="security-alert">Security Alert</SelectItem>
                          <SelectItem value="password-reset">Password Reset</SelectItem>
                          <SelectItem value="account-verification">Account Verification</SelectItem>
                          <SelectItem value="system-notification">System Notification</SelectItem>
                          <SelectItem value="hr-communication">HR Communication</SelectItem>
                          <SelectItem value="it-support">IT Support</SelectItem>
                          <SelectItem value="financial">Financial</SelectItem>
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
                      Use variables like {{first_name}} for personalization
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

              <Separator />

              {/* Template Tools */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Template Tools
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => insertTemplate('basic')}
                  >
                    <Code className="h-3 w-3 mr-1" />
                    Basic Template
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => insertTemplate('security')}
                  >
                    <Code className="h-3 w-3 mr-1" />
                    Security Alert
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowVariables(!showVariables)}
                  >
                    <Type className="h-3 w-3 mr-1" />
                    Variables
                  </Button>
                </div>

                {showVariables && (
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Available Variables</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {variables.map((variable) => (
                        <div 
                          key={variable.name}
                          className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted"
                          onClick={() => insertVariable(variable.name)}
                        >
                          <div>
                            <Badge variant="outline" className="text-xs">
                              {variable.name}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {variable.description}
                            </p>
                          </div>
                          <Copy className="h-3 w-3" />
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              <Separator />

              {/* Content Editor */}
              <Tabs defaultValue="html" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="html" className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    HTML Content
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Text Content
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
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
                            className="font-mono h-96 text-sm"
                            placeholder="<html><body>Your email content here...</body></html>"
                          />
                        </FormControl>
                        <FormDescription>
                          HTML markup for the email template. Use variables for personalization
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" onClick={handlePreview}>
                        <Eye className="w-4 h-4 mr-2" />
                        Update Preview
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant={previewMode === 'desktop' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('desktop')}
                      >
                        <Monitor className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={previewMode === 'tablet' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('tablet')}
                      >
                        <Tablet className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={previewMode === 'mobile' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewMode('mobile')}
                      >
                        <Smartphone className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg bg-white" style={{ width: getPreviewWidth(), margin: '0 auto' }}>
                    <iframe
                      ref={previewRef}
                      className="w-full h-96 border-0 rounded-lg"
                      title="Email Preview"
                      srcDoc={previewHtml || '<p style="text-align: center; color: #666; padding: 40px;">Click "Update Preview" to see how your email will look</p>'}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <Separator />

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

export default EnhancedTemplateEditor;
