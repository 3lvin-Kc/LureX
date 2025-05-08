
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { formSubmissionLimiter } from '@/utils/rateLimiter';
import { securityLogger, SecurityEventType, sanitizeInput } from '@/utils/securityLogger';

const CampaignForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [targetListId, setTargetListId] = useState('');
  const [providerId, setProviderId] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      // Log successful data access
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        'Email templates fetched successfully',
        { count: data?.length || 0 }
      );
      
      return data;
    },
  });

  // Fetch target lists
  const { data: targetLists, isLoading: targetListsLoading } = useQuery({
    queryKey: ['target-lists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('target_lists')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      // Log successful data access
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        'Target lists fetched successfully',
        { count: data?.length || 0 }
      );
      
      return data;
    },
  });

  // Fetch email providers
  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ['email-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_providers')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      // Log successful data access
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        'Email providers fetched successfully',
        { count: data?.length || 0 }
      );
      
      return data;
    },
  });

  // Validate form input
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!name.trim()) {
      errors.name = 'Campaign name is required';
    } else if (name.length > 100) {
      errors.name = 'Campaign name cannot exceed 100 characters';
    }
    
    if (description && description.length > 500) {
      errors.description = 'Description cannot exceed 500 characters';
    }
    
    if (!templateId) {
      errors.templateId = 'Please select an email template';
    }
    
    if (!targetListId) {
      errors.targetListId = 'Please select a target list';
    }
    
    if (!providerId) {
      errors.providerId = 'Please select an email provider';
    }
    
    // Validate for potentially malicious input
    const nameValidation = securityLogger.validateInput(name, 'campaign_name');
    if (!nameValidation.safe) {
      errors.name = 'Campaign name contains potentially unsafe characters';
      securityLogger.warn(
        SecurityEventType.INPUT_VALIDATION,
        'Potentially malicious input detected in campaign name',
        { input: name, issues: nameValidation.issues }
      );
    }
    
    const descValidation = securityLogger.validateInput(description, 'campaign_description');
    if (!descValidation.safe) {
      errors.description = 'Description contains potentially unsafe characters';
      securityLogger.warn(
        SecurityEventType.INPUT_VALIDATION,
        'Potentially malicious input detected in campaign description',
        { input: description.substring(0, 100), issues: descValidation.issues }
      );
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting for form submissions
    if (!formSubmissionLimiter.tryRequest()) {
      const timeLeft = Math.ceil(formSubmissionLimiter.getTimeUntilUnblocked() / 1000);
      toast({
        title: 'Too many attempts',
        description: `Please try again in ${timeLeft} seconds`,
        variant: 'destructive',
      });
      
      securityLogger.warn(
        SecurityEventType.RATE_LIMIT,
        'Campaign form submission rate limit exceeded',
        { timeLeft }
      );
      
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Log the campaign creation attempt
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        'Campaign creation initiated', 
        { 
          name: sanitizeInput(name),
          templateId,
          targetListId,
          providerId
        }
      );
      
      // Get template version
      const { data: templateData } = await supabase
        .from('email_templates')
        .select('version')
        .eq('id', templateId)
        .single();
        
      const templateVersion = templateData?.version || 1;
      
      // Create campaign with sanitized inputs
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          name: sanitizeInput(name),
          description: description ? sanitizeInput(description) : null,
          template_id: templateId,
          template_version: templateVersion,
          target_list_id: targetListId,
          provider_id: providerId,
          status: 'draft',
          schedule_time: scheduledDate ? scheduledDate.toISOString() : null,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Log successful campaign creation
      securityLogger.info(
        SecurityEventType.DATA_ACCESS,
        'Campaign created successfully',
        { campaignId: data?.id, name: sanitizeInput(name) }
      );
      
      toast({
        title: 'Campaign created',
        description: 'Your campaign has been created successfully',
      });
      
      navigate('/campaigns');
    } catch (error: any) {
      // Log the error
      securityLogger.error(
        SecurityEventType.DATA_ACCESS,
        'Campaign creation failed',
        { error: error.message || 'Unknown error', details: error.details || {} }
      );
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to create campaign',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className={formErrors.name ? 'text-destructive' : ''}>
              Campaign Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter campaign name"
              className={formErrors.name ? 'border-destructive' : ''}
              required
            />
            {formErrors.name && <p className="text-destructive text-sm">{formErrors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className={formErrors.description ? 'text-destructive' : ''}>
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter campaign description"
              className={formErrors.description ? 'border-destructive' : ''}
              rows={3}
            />
            {formErrors.description && <p className="text-destructive text-sm">{formErrors.description}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="template" className={formErrors.templateId ? 'text-destructive' : ''}>
              Email Template *
            </Label>
            <Select 
              value={templateId} 
              onValueChange={setTemplateId} 
              required
            >
              <SelectTrigger className={formErrors.templateId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templatesLoading ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : templates && templates.length > 0 ? (
                  templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-center">No templates available</div>
                )}
              </SelectContent>
            </Select>
            {formErrors.templateId && <p className="text-destructive text-sm">{formErrors.templateId}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetList" className={formErrors.targetListId ? 'text-destructive' : ''}>
              Target List *
            </Label>
            <Select 
              value={targetListId} 
              onValueChange={setTargetListId} 
              required
            >
              <SelectTrigger className={formErrors.targetListId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a target list" />
              </SelectTrigger>
              <SelectContent>
                {targetListsLoading ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : targetLists && targetLists.length > 0 ? (
                  targetLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-center">No target lists available</div>
                )}
              </SelectContent>
            </Select>
            {formErrors.targetListId && <p className="text-destructive text-sm">{formErrors.targetListId}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="provider" className={formErrors.providerId ? 'text-destructive' : ''}>
              Email Provider *
            </Label>
            <Select 
              value={providerId} 
              onValueChange={setProviderId} 
              required
            >
              <SelectTrigger className={formErrors.providerId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select an email provider" />
              </SelectTrigger>
              <SelectContent>
                {providersLoading ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : providers && providers.length > 0 ? (
                  providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-center">No providers available</div>
                )}
              </SelectContent>
            </Select>
            {formErrors.providerId && <p className="text-destructive text-sm">{formErrors.providerId}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="scheduleDate">Schedule Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !scheduledDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <CardFooter className="flex justify-between px-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/campaigns')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Campaign'
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default CampaignForm;
