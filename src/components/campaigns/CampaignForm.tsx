
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

  // Fetch templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');
        
      if (error) throw error;
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
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!name || !templateId || !targetListId || !providerId) {
        throw new Error('Please fill in all required fields');
      }
      
      // Get template version
      const { data: templateData } = await supabase
        .from('email_templates')
        .select('version')
        .eq('id', templateId)
        .single();
        
      const templateVersion = templateData?.version || 1;
      
      // Create campaign
      const { data, error } = await supabase
        .from('campaigns')
        .insert([
          {
            name,
            description,
            template_id: templateId,
            template_version: templateVersion,
            target_list_id: targetListId,
            provider_id: providerId,
            status: 'draft',
            schedule_time: scheduledDate,
          },
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: 'Campaign created',
        description: 'Your campaign has been created successfully',
      });
      
      navigate('/campaigns');
    } catch (error: any) {
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
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter campaign name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter campaign description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="template">Email Template *</Label>
            <Select value={templateId} onValueChange={setTemplateId} required>
              <SelectTrigger>
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetList">Target List *</Label>
            <Select value={targetListId} onValueChange={setTargetListId} required>
              <SelectTrigger>
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="provider">Email Provider *</Label>
            <Select value={providerId} onValueChange={setProviderId} required>
              <SelectTrigger>
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
