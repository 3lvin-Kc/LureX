import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PaperclipIcon, LinkIcon, SendIcon, SaveIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject line is required"),
  category: z.string().optional(),
  htmlContent: z.string().min(1, "Email content is required"),
  textContent: z.string().optional(),
  description: z.string().optional(),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface TemplateFormProps {
  templateId?: string;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ templateId }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPhishingPage, setSelectedPhishingPage] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      subject: "",
      category: "",
      htmlContent: "",
      textContent: "",
      description: "",
    },
  });

  // Fetch template data if editing
  const { data: templateData } = useQuery({
    queryKey: ["template", templateId],
    queryFn: async () => {
      if (!templateId) return null;
      
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("id", templateId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!templateId,
  });

  // Fetch phishing pages for linking
  const { data: phishingPages } = useQuery({
    queryKey: ["phishing-pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("phishing_pages")
        .select("id, name");
        
      if (error) throw error;
      return data;
    },
  });

  // Populate form with template data if editing
  useEffect(() => {
    if (templateData) {
      form.reset({
        name: templateData.name,
        subject: templateData.subject,
        category: templateData.category || "",
        htmlContent: templateData.html_content,
        textContent: templateData.text_content || "",
        description: templateData.description || "",
      });
    }
  }, [templateData, form]);

  const onSubmit = async (values: TemplateFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Determine if we're creating or updating
      const isUpdate = !!templateId;

      // Prepare template data
      const templateData = {
        name: values.name,
        subject: values.subject,
        category: values.category || null,
        html_content: values.htmlContent,
        text_content: values.textContent || null,
        description: values.description || null,
      };

      let templateResult;

      if (isUpdate) {
        // Update existing template
        const { data, error } = await supabase
          .from("email_templates")
          .update(templateData)
          .eq("id", templateId)
          .select()
          .single();
          
        if (error) throw error;
        templateResult = data;
      } else {
        // Create new template
        const { data, error } = await supabase
          .from("email_templates")
          .insert(templateData)
          .select()
          .single();
          
        if (error) throw error;
        templateResult = data;
      }

      // Handle attachments if any
      if (attachments.length > 0) {
        // Handle file uploads, this would depend on your storage solution
        // For example with Supabase Storage:
        for (const file of attachments) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('attachments')
            .upload(`template-attachments/${templateResult.id}/${fileName}`, file);
            
          if (uploadError) throw uploadError;
        }
      }

      toast({
        title: isUpdate ? "Template updated" : "Template created",
        description: isUpdate 
          ? "Your template has been updated successfully" 
          : "Your template has been created successfully",
      });

      // Navigate back to templates list
      navigate("/templates");
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPhishingPage = () => {
    if (!selectedPhishingPage) return;
    
    // Generate a placeholder URL for the phishing page link
    const phishingPageUrl = `{{phishing_page:${selectedPhishingPage}}}`;
    
    // Insert link to the HTML content
    const currentContent = form.getValues("htmlContent");
    const updatedContent = currentContent + `<a href="${phishingPageUrl}">Click here to verify</a>`;
    form.setValue("htmlContent", updatedContent);
    
    toast({
      title: "Phishing page link added",
      description: "The link has been added to your template",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setAttachments([...attachments, ...fileArray]);
    }
  };

  const removeAttachment = (index: number) => {
    const updatedAttachments = [...attachments];
    updatedAttachments.splice(index, 1);
    setAttachments(updatedAttachments);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Subject</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email subject" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., Password Reset, IT Security" {...field} />
                </FormControl>
                <FormDescription>
                  Categorize your template to organize your library
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
                  <Input placeholder="Brief description of this template" {...field} />
                </FormControl>
                <FormDescription>
                  Provide a short description to help identify this template's purpose
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="htmlContent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Content (HTML)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter email content in HTML format" 
                    {...field} 
                    className="min-h-[200px] font-mono"
                  />
                </FormControl>
                <FormDescription>
                  You can use HTML to format your email. Add links, images, and formatting.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="textContent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plain Text Version (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter plain text version of email" 
                    {...field} 
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormDescription>
                  Plain text version for email clients that don't support HTML
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Add Phishing Page Link</h3>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Select 
                    onValueChange={(value) => setSelectedPhishingPage(value)}
                    value={selectedPhishingPage || undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a phishing page" />
                    </SelectTrigger>
                    <SelectContent>
                      {phishingPages?.map((page) => (
                        <SelectItem key={page.id} value={page.id}>
                          {page.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleAddPhishingPage}
                  disabled={!selectedPhishingPage}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Add Link
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Add Attachments</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <Button type="button" variant="outline" asChild>
                    <label className="flex cursor-pointer">
                      <PaperclipIcon className="mr-2 h-4 w-4" />
                      Add Files
                      <input 
                        type="file" 
                        className="sr-only" 
                        onChange={handleFileChange} 
                        multiple 
                      />
                    </label>
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Supported files: PDF, DOCX, EXE, ZIP (max 10MB)
                  </p>
                </div>
                
                {attachments.length > 0 && (
                  <ul className="space-y-2 mt-2">
                    {attachments.map((file, index) => (
                      <li key={index} className="flex items-center justify-between text-sm border rounded-md p-2">
                        <span className="truncate max-w-[200px]">{file.name}</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/templates")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {templateId ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                <SaveIcon className="mr-2 h-4 w-4" />
                {templateId ? "Update Template" : "Save Template"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TemplateForm;
