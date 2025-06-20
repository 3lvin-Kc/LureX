
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { securityLogger, SecurityEventType } from "@/utils/securityLogger";

const formSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  template_id: z.string().min(1, "Template is required"),
  target_list_id: z.string().min(1, "Target list is required"),
  provider_id: z.string().min(1, "Email provider is required"),
  schedule_time: z.string().optional(),
  enable_tracking: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface CampaignFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
  initialData?: Partial<FormData>;
}

const CampaignForm: React.FC<CampaignFormProps> = ({
  onSubmit,
  isLoading = false,
  initialData = {},
}) => {
  const { toast } = useToast();
  const [templates] = useState([
    { id: "1", name: "Password Reset Template" },
    { id: "2", name: "IT Support Alert" }
  ]);
  const [targetLists] = useState([
    { id: "1", name: "All Employees" },
    { id: "2", name: "Marketing Team" }
  ]);
  const [providers] = useState([
    { id: "1", name: "SMTP Provider" },
    { id: "2", name: "SendGrid" }
  ]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name || "",
      description: initialData.description || "",
      template_id: initialData.template_id || "",
      target_list_id: initialData.target_list_id || "",
      provider_id: initialData.provider_id || "",
      schedule_time: initialData.schedule_time || "",
      enable_tracking: initialData.enable_tracking ?? true,
    },
  });

  const handleSubmit = (data: FormData) => {
    // Validate campaign name
    const nameValidation = securityLogger.validateInput(data.name, 'campaign_name');
    if (!nameValidation.safe) {
      securityLogger.warn(
        SecurityEventType.INPUT_VALIDATION,
        "Invalid campaign name detected",
        { reason: nameValidation.reason, issues: nameValidation.issues }
      );
      toast({
        title: "Validation Error",
        description: nameValidation.reason,
        variant: "destructive",
      });
      return;
    }

    // Validate description if provided
    if (data.description) {
      const descValidation = securityLogger.validateInput(data.description, 'campaign_description');
      if (!descValidation.safe) {
        securityLogger.warn(
          SecurityEventType.INPUT_VALIDATION,
          "Invalid campaign description detected",
          { reason: descValidation.reason, issues: descValidation.issues }
        );
        toast({
          title: "Validation Error", 
          description: descValidation.reason,
          variant: "destructive",
        });
        return;
      }
    }

    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Details</CardTitle>
        <CardDescription>
          Configure your phishing simulation campaign
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter campaign description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="template_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Template</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select email template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_list_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target List</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target list" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {targetLists.map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          {list.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provider_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Provider</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select email provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="schedule_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Time (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enable_tracking"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Tracking</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Track email opens and link clicks
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating Campaign..." : "Create Campaign"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CampaignForm;
