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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderCircle, Calendar, Mail, Users, Globe, FileText, Link, Paperclip } from "lucide-react";
import { useTemplates } from "@/hooks/useTemplates";
import { useTargetLists } from "@/hooks/useTargetLists";
import { usePhishingPages } from "@/hooks/usePhishingPages";
import { useCustomDomains } from "@/hooks/useCustomDomains";

const formSchema = z.object({
  name: z.string().min(1, { message: "Campaign name is required" }),
  description: z.string().optional(),
  simulation_type: z.enum(["link", "file"], { message: "Simulation type is required" }),
  file_type: z.string().optional(),
  file_name: z.string().optional(),
  template_id: z.string().min(1, { message: "Email template is required" }),
  target_list_id: z.string().min(1, { message: "Target list is required" }),
  phishing_page_id: z.string().optional(),
  domain_id: z.string().optional(),
  schedule_time: z.string().optional(),
}).refine((data) => {
  // For link simulation, phishing_page_id is required
  if (data.simulation_type === "link") {
    return data.phishing_page_id && data.phishing_page_id.length > 0;
  }
  // For file simulation, file_type and file_name are required
  if (data.simulation_type === "file") {
    return data.file_type && data.file_type.length > 0 && data.file_name && data.file_name.length > 0;
  }
  return true;
}, {
  message: "Required fields are missing for the selected simulation type",
  path: ["simulation_type"]
});

interface CampaignFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ onSubmit, initialData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [simulationType, setSimulationType] = useState<"link" | "file">("link");
  
  const { templates, loading: templatesLoading } = useTemplates();
  const { targetLists, loading: targetListsLoading } = useTargetLists();
  const { phishingPages, loading: pagesLoading } = usePhishingPages();
  const { getVerifiedDomains } = useCustomDomains();
  
  const verifiedDomains = getVerifiedDomains();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      simulation_type: initialData?.simulation_type || "link",
      file_type: initialData?.file_type || "pdf",
      file_name: initialData?.file_name || "",
      template_id: initialData?.template_id || "",
      target_list_id: initialData?.target_list_id || "",
      phishing_page_id: initialData?.phishing_page_id || undefined,
      domain_id: initialData?.domain_id || undefined,
      schedule_time: initialData?.schedule_time ? new Date(initialData.schedule_time).toISOString().slice(0, 16) : "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const submitValues = {
        ...values,
        // Convert empty strings to null for UUID fields
        phishing_page_id: values.phishing_page_id && values.phishing_page_id.trim() !== "" ? values.phishing_page_id : null,
        domain_id: values.domain_id && values.domain_id !== "default" && values.domain_id.trim() !== "" ? values.domain_id : null,
      };
      await onSubmit(submitValues);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  const minDateTime = formatDateTime(new Date(Date.now() + 5 * 60 * 1000)); // 5 minutes from now

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Configuration</CardTitle>
        <CardDescription>
          Set up your phishing simulation campaign with email templates, target lists, and landing pages
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
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter campaign name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

        
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of this campaign..."
                      className="h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Simulation Type Selection */}
            <FormField
              control={form.control}
              name="simulation_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Simulation Type</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSimulationType(value as "link" | "file");
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose simulation type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="link">
                        <div className="flex items-center gap-2">
                          <Link className="w-4 h-4" />
                          Link-based Phishing
                        </div>
                      </SelectItem>
                      <SelectItem value="file">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4" />
                          File Attachment Phishing
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {simulationType === "link" 
                      ? "Users will receive emails with malicious links to click"
                      : "Users will receive emails with file attachments to download/open"
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Configuration - Only show when file type is selected */}
            {simulationType === "file" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-muted/20">
                <FormField
                  control={form.control}
                  name="file_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        File Type
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select file type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Document (.pdf)</SelectItem>
                          <SelectItem value="docx">Word Document (.docx)</SelectItem>
                          <SelectItem value="xlsx">Excel Spreadsheet (.xlsx)</SelectItem>
                          <SelectItem value="zip">ZIP Archive (.zip)</SelectItem>
                          <SelectItem value="exe">Executable (.exe)</SelectItem>
                          <SelectItem value="jpg">Image (.jpg)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The type of file attachment to simulate
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="file_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Invoice_December_2024.pdf" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        The filename that will appear in the email
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

           
            

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="template_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Template
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templatesLoading ? (
                          <SelectItem value="loading" disabled>Loading templates...</SelectItem>
                        ) : templates.length === 0 ? (
                          <SelectItem value="no-templates" disabled>No templates available</SelectItem>
                        ) : (
                          templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name} ({template.category})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The email template to send to targets
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_list_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Target List
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target list" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {targetListsLoading ? (
                          <SelectItem value="loading" disabled>Loading target lists...</SelectItem>
                        ) : targetLists.length === 0 ? (
                          <SelectItem value="no-lists" disabled>No target lists available</SelectItem>
                        ) : (
                          targetLists.map((list) => (
                            <SelectItem key={list.id} value={list.id}>
                              {list.name} ({list.target_count} targets)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The list of people to target
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {simulationType !== 'file' && (
                <FormField
                  control={form.control}
                  name="phishing_page_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Landing Page
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select landing page" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pagesLoading ? (
                            <SelectItem value="loading" disabled>Loading pages...</SelectItem>
                          ) : phishingPages.length === 0 ? (
                            <SelectItem value="no-pages" disabled>No phishing pages available</SelectItem>
                          ) : (
                            phishingPages.map((page) => (
                              <SelectItem key={page.id} value={page.id}>
                                {page.name} {page.category && `(${page.category})`}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The page targets will see when they click the email
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Domain Selection */}
            <FormField
              control={form.control}
              name="domain_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Custom Domain (Optional)
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Use default domain" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="default">Default Platform Domain</SelectItem>
                      {verifiedDomains.map((domain) => (
                        <SelectItem key={domain.id} value={domain.id}>
                          {domain.domain} {domain.ssl_enabled && '🔒'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose a custom domain for this campaign's phishing URLs
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-medium text-blue-800 mb-2">Campaign Requirements</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Ensure you have created at least one email template</li>
                <li>• Create a target list with email addresses</li>
                <li>• Set up a phishing page (landing page) for targets to visit</li>
                <li>• All components must be created before launching the campaign</li>
              </ul>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                {isScheduled ? "Schedule Campaign" : "Create Campaign"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CampaignForm;
