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
import { LoaderCircle, Calendar, Mail, Users, Globe } from "lucide-react";
import { useTemplates } from "@/hooks/useTemplates";
import { useTargetLists } from "@/hooks/useTargetLists";
import { usePhishingPages } from "@/hooks/usePhishingPages";
import { useCustomDomains } from "@/hooks/useCustomDomains";

const formSchema = z.object({
  name: z.string().min(1, { message: "Campaign name is required" }),
  description: z.string().optional(),
  template_id: z.string().min(1, { message: "Email template is required" }),
  target_list_id: z.string().min(1, { message: "Target list is required" }),
  phishing_page_id: z.string().min(1, { message: "Phishing page is required" }),
  domain_id: z.string().optional(),
  schedule_time: z.string().optional(),
});

interface CampaignFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ onSubmit, initialData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  
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
      template_id: initialData?.template_id || "",
      target_list_id: initialData?.target_list_id || "",
      phishing_page_id: initialData?.phishing_page_id || "",
      domain_id: initialData?.domain_id || "default",
      schedule_time: initialData?.schedule_time ? new Date(initialData.schedule_time).toISOString().slice(0, 16) : "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const submitValues = {
        ...values,
        domain_id: values.domain_id === "default" ? null : values.domain_id,
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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="schedule"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="schedule" className="text-sm font-medium">
                  Schedule campaign for later
                </label>
              </div>
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

            {isScheduled && (
              <FormField
                control={form.control}
                name="schedule_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Schedule Time
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local"
                        min={minDateTime}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Choose when to automatically start this campaign
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
