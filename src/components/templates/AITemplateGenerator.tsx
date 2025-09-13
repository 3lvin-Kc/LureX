import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bot, Target, Zap, Settings, Eye } from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DOMPurify from 'dompurify';

interface AITemplateGeneratorProps {
  onTemplateGenerated?: (template: any) => void;
}

export const AITemplateGenerator: React.FC<AITemplateGeneratorProps> = ({
  onTemplateGenerated
}) => {
  const { createTemplate } = useTemplates();
  const { toast } = useToast();
  
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedTemplate, setGeneratedTemplate] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    campaign_type: '',
    target_industry: '',
    sophistication_level: 'medium',
    template_name: '',
    company_context: '',
    specific_request: '',
    personalization_level: 'high',
    tone: 'professional',
    urgency_level: 'medium'
  });

  const industries = [
    'healthcare', 'finance', 'legal', 'technology', 'education',
    'government', 'retail', 'manufacturing', 'consulting', 'nonprofit'
  ];

  const campaignTypes = [
    { value: 'credential_harvesting', label: 'Credential Harvesting' },
    { value: 'malware_delivery', label: 'Malware Delivery' },
    { value: 'social_engineering', label: 'Social Engineering' },
    { value: 'business_email_compromise', label: 'Business Email Compromise' },
    { value: 'invoice_fraud', label: 'Invoice Fraud' },
    { value: 'ceo_fraud', label: 'CEO Fraud' },
    { value: 'brand_impersonation', label: 'Brand Impersonation' },
    { value: 'urgent_request', label: 'Urgent Request' }
  ];

  const sophisticationLevels = [
    { value: 'basic', label: 'Basic', description: 'Simple, obvious phishing attempt' },
    { value: 'medium', label: 'Medium', description: 'Moderate sophistication with some targeting' },
    { value: 'advanced', label: 'Advanced', description: 'Highly sophisticated and targeted' }
  ];

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'authoritative', label: 'Authoritative' }
  ];

  const handleGenerate = async () => {
    if (!formData.campaign_type || !formData.target_industry) {
      toast({
        title: "Missing Information",
        description: "Please select campaign type and target industry",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    setProgress(0);

    try {
      // Progress simulation
      setProgress(20);
      
      // Build comprehensive prompt for AI generation
      const prompt = buildPrompt(formData);
      
      setProgress(40);

      // Call AI service
      const { data, error } = await supabase.functions.invoke('generate-template-ai', {
        body: { 
          category: formData.target_industry,
          prompt: prompt
        }
      });

      setProgress(80);

      if (error) throw error;

      if (!data.success || !data.template) {
        throw new Error('Failed to generate template');
      }

      const aiTemplate = data.template;
      
      // Create properly formatted template with sanitized content
      const template = {
        name: formData.template_name || aiTemplate.name || `${formData.campaign_type.replace(/_/g, ' ')} - ${formData.target_industry}`,
        subject: aiTemplate.subject || `Urgent: Action Required`,
        category: formData.target_industry,
        html_content: DOMPurify.sanitize(aiTemplate.html_content || '<p>Template content could not be generated.</p>', {
          ALLOWED_TAGS: ['p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'br', 'table', 'tr', 'td', 'th'],
          ALLOWED_ATTR: ['style', 'href', 'target'],
          FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
        }),
        text_content: aiTemplate.text_content || aiTemplate.html_content?.replace(/<[^>]*>/g, '') || '',
        description: aiTemplate.description || `AI-generated ${formData.campaign_type.replace(/_/g, ' ')} template for ${formData.target_industry} industry`,
        version: 1,
        industry_type: formData.target_industry,
        template_source: 'ai_generated',
        personalization_variables: {
          sophistication_level: formData.sophistication_level,
          tone: formData.tone,
          urgency_level: formData.urgency_level,
          ai_generated: true,
          generation_params: formData
        },
        tags: [
          formData.campaign_type,
          formData.target_industry,
          'ai_generated',
          formData.sophistication_level
        ]
      };

      setProgress(100);
      setGeneratedTemplate(template);

      toast({
        title: "Template Generated!",
        description: "AI has successfully created your template. Review and save it below.",
      });

    } catch (error: any) {
      console.error('Template generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const buildPrompt = (data: any): string => {
    return `Generate a professional phishing email template for cybersecurity awareness training with the following specifications:

**Campaign Type:** ${data.campaign_type.replace(/_/g, ' ')}
**Target Industry:** ${data.target_industry}
**Sophistication Level:** ${data.sophistication_level}
**Communication Tone:** ${data.tone}
**Urgency Level:** ${data.urgency_level}

${data.company_context ? `**Company Context:** ${data.company_context}` : ''}
${data.specific_request ? `**Specific Requirements:** ${data.specific_request}` : ''}

**CRITICAL REQUIREMENTS:**
1. This is for AUTHORIZED SECURITY AWARENESS TRAINING ONLY
2. Include realistic but EDUCATIONAL elements appropriate for ${data.target_industry}
3. Use ${data.sophistication_level} level sophistication
4. Maintain a ${data.tone} tone throughout
5. Include industry-specific terminology and context
6. Add subtle urgency indicators if urgency level is medium/high
7. Include personalization placeholders like {{first_name}}, {{company_name}}, {{position}}
8. Make it realistic enough to test employee awareness but clearly educational in nature

Please respond with a JSON object containing:
- name: A descriptive name for the template
- subject: An engaging email subject line appropriate for the campaign type
- html_content: Professional HTML email content with inline CSS styling that is email-client compatible
- description: Brief description of the template's purpose and effectiveness

Focus on creating content that would realistically test employee security awareness while being appropriate for training purposes in the ${data.target_industry} industry.`;
  };

  const handleSaveTemplate = async () => {
    if (!generatedTemplate) return;

    try {
      const savedTemplate = await createTemplate(generatedTemplate);

      if (savedTemplate && onTemplateGenerated) {
        onTemplateGenerated(savedTemplate);
      }

      toast({
        title: "Template Saved!",
        description: "Your AI-generated template has been saved to the library.",
      });

      // Reset form
      setGeneratedTemplate(null);
      setFormData({
        campaign_type: '',
        target_industry: '',
        sophistication_level: 'medium',
        template_name: '',
        company_context: '',
        specific_request: '',
        personalization_level: 'high',
        tone: 'professional',
        urgency_level: 'medium'
      });

    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save template. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Template Generator
          </CardTitle>
          <CardDescription>
            Generate sophisticated, industry-specific phishing templates using AI
          </CardDescription>
        </CardHeader>
      </Card>

      {!generatedTemplate ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Template Configuration
            </CardTitle>
            <CardDescription>
              Configure the parameters for your AI-generated template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="campaign_type">Campaign Type</Label>
                  <Select 
                    value={formData.campaign_type} 
                    onValueChange={(value) => setFormData({...formData, campaign_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign type" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target_industry">Target Industry</Label>
                  <Select 
                    value={formData.target_industry} 
                    onValueChange={(value) => setFormData({...formData, target_industry: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry.charAt(0).toUpperCase() + industry.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sophistication_level">Sophistication Level</Label>
                  <Select 
                    value={formData.sophistication_level} 
                    onValueChange={(value) => setFormData({...formData, sophistication_level: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sophisticationLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-xs text-muted-foreground">{level.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tone">Communication Tone</Label>
                  <Select 
                    value={formData.tone} 
                    onValueChange={(value) => setFormData({...formData, tone: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map(tone => (
                        <SelectItem key={tone.value} value={tone.value}>
                          {tone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="template_name">Template Name (Optional)</Label>
                  <Input
                    id="template_name"
                    value={formData.template_name}
                    onChange={(e) => setFormData({...formData, template_name: e.target.value})}
                    placeholder="Custom template name"
                  />
                </div>

                <div>
                  <Label htmlFor="company_context">Company Context</Label>
                  <Textarea
                    id="company_context"
                    value={formData.company_context}
                    onChange={(e) => setFormData({...formData, company_context: e.target.value})}
                    placeholder="e.g., Recent company merger, new policy announcement, etc."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="specific_request">Specific Requirements</Label>
                  <Textarea
                    id="specific_request"
                    value={formData.specific_request}
                    onChange={(e) => setFormData({...formData, specific_request: e.target.value})}
                    placeholder="Any specific elements or approaches you want included"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {generating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Generating template...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={handleGenerate}
                disabled={generating || !formData.campaign_type || !formData.target_industry}
                size="lg"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {generating ? 'Generating...' : 'Generate Template'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="preview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Generated Template Preview
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setGeneratedTemplate(null)}>
                      Generate New
                    </Button>
                    <Button onClick={handleSaveTemplate}>
                      Save Template
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div><strong>Subject:</strong> {generatedTemplate.subject}</div>
                    <div><strong>Name:</strong> {generatedTemplate.name}</div>
                    <div><strong>Category:</strong> {generatedTemplate.category}</div>
                  </div>
                </div>
                
                <div className="border rounded-lg">
                  <div className="bg-muted p-3 border-b">
                    <h4 className="font-medium">Email Content</h4>
                  </div>
                  <div className="p-4 bg-background border border-border rounded-b-lg">
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ 
                        __html: generatedTemplate.html_content 
                      }} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {generatedTemplate.tags?.map((tag: string) => (
                        <Badge key={tag} variant="outline">
                          {tag.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Configuration</Label>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <div>Sophistication: {generatedTemplate.personalization_variables?.sophistication_level}</div>
                      <div>Tone: {generatedTemplate.personalization_variables?.tone}</div>
                      <div>Industry: {generatedTemplate.industry_type}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {generatedTemplate.description}
                  </p>
                </div>

                <Alert>
                  <Bot className="h-4 w-4" />
                  <AlertDescription>
                    This template was generated using AI and has been sanitized for security. 
                    Always review content before using in campaigns.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};