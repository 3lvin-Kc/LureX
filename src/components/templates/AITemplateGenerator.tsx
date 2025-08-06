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
      // Simulate AI generation process with progress updates
      const steps = [
        { message: "Analyzing industry context...", progress: 20 },
        { message: "Generating template structure...", progress: 40 },
        { message: "Personalizing content...", progress: 60 },
        { message: "Optimizing effectiveness...", progress: 80 },
        { message: "Finalizing template...", progress: 100 }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProgress(step.progress);
      }

      // Mock generated template - In real implementation, this would call AI service
      const mockTemplate = {
        name: formData.template_name || `${formData.campaign_type.replace(/_/g, ' ')} - ${formData.target_industry}`,
        subject: generateMockSubject(formData),
        category: formData.target_industry,
        html_content: generateMockContent(formData),
        text_content: generateMockTextContent(formData),
        description: `AI-generated ${formData.campaign_type.replace(/_/g, ' ')} template for ${formData.target_industry} industry`,
        version: 1,
        industry_type: formData.target_industry,
        personalization_variables: {
          sophistication_level: formData.sophistication_level,
          tone: formData.tone,
          urgency_level: formData.urgency_level,
          ai_generated: true
        },
        tags: [
          formData.campaign_type,
          formData.target_industry,
          'ai_generated',
          formData.sophistication_level
        ]
      };

      setGeneratedTemplate(mockTemplate);

      toast({
        title: "Template Generated!",
        description: "AI has successfully created your template. Review and save it below.",
      });

    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!generatedTemplate) return;

    try {
      const savedTemplate = await createTemplate(generatedTemplate, {
        source: 'ai_generated'
      });

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
                  <div className="p-4 bg-white">
                    <div 
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

// Helper functions for mock generation
function generateMockSubject(formData: any): string {
  const subjects = {
    credential_harvesting: [
      "Urgent: Your account will be suspended",
      "Security Alert: Unusual login activity detected",
      "Action Required: Verify your account immediately"
    ],
    business_email_compromise: [
      "Urgent Wire Transfer Request",
      "Confidential: Change in banking details",
      "Invoice Payment - Updated Account Information"
    ],
    ceo_fraud: [
      "Confidential Request from CEO",
      "Urgent: Acquisition Details",
      "Private: Board Meeting Preparation"
    ]
  };
  
  const categorySubjects = subjects[formData.campaign_type as keyof typeof subjects] || [
    "Important Update Required",
    "Urgent: Action Needed",
    "Security Notice"
  ];
  
  return categorySubjects[Math.floor(Math.random() * categorySubjects.length)];
}

function generateMockContent(formData: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 20px;">{{company_name}} Security Notice</h2>
        
        <p>Dear {{first_name}} {{last_name}},</p>
        
        <p>We've detected unusual activity on your {{company_name}} account and need you to verify your credentials immediately to prevent account suspension.</p>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>⚠️ Action Required:</strong> Please verify your account within 24 hours to maintain access.
        </div>
        
        <p>Click the button below to verify your account:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{tracking_link}}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Account Now
          </a>
        </div>
        
        <p>If you don't verify your account, it will be temporarily suspended for security purposes.</p>
        
        <p>Best regards,<br>
        {{company_name}} Security Team</p>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          This email was sent to {{email}}. If you believe this was sent in error, please contact our support team.
        </p>
      </div>
    </div>
  `;
}

function generateMockTextContent(formData: any): string {
  return `
    {{company_name}} Security Notice

    Dear {{first_name}} {{last_name}},

    We've detected unusual activity on your {{company_name}} account and need you to verify your credentials immediately to prevent account suspension.

    ACTION REQUIRED: Please verify your account within 24 hours to maintain access.

    Verify your account here: {{tracking_link}}

    If you don't verify your account, it will be temporarily suspended for security purposes.

    Best regards,
    {{company_name}} Security Team

    ---
    This email was sent to {{email}}. If you believe this was sent in error, please contact our support team.
  `;
}