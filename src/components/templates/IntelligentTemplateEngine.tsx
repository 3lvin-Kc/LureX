import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useIntelligentTemplates } from '@/hooks/useIntelligentTemplates';
import { Brain, Sparkles, Target, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

interface IntelligentTemplateEngineProps {
  onTemplateCreated?: (template: any) => void;
}

export const IntelligentTemplateEngine: React.FC<IntelligentTemplateEngineProps> = ({
  onTemplateCreated
}) => {
  const {
    loading,
    industryTemplates,
    contextEvents,
    fetchIndustryTemplates,
    createFromIndustryTemplate,
    analyzeTemplate,
    generateContextSuggestions,
    createContextEvent,
  } = useIntelligentTemplates();

  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [personalizationData, setPersonalizationData] = useState<Record<string, string>>({});
  const [contextSuggestions, setContextSuggestions] = useState<any[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  // New context event form
  const [newEvent, setNewEvent] = useState({
    event_type: 'company' as const,
    event_title: '',
    event_description: '',
    event_data: '{}',
    event_date: new Date().toISOString().split('T')[0],
    relevance_score: 0.7,
  });

  const industries = [
    'healthcare', 'finance', 'legal', 'technology', 'education',
    'government', 'retail', 'manufacturing', 'consulting', 'nonprofit'
  ];

  const sophisticationLevels = [
    { value: 'basic', label: 'Basic', description: 'Simple, direct approach' },
    { value: 'medium', label: 'Medium', description: 'Moderate sophistication' },
    { value: 'advanced', label: 'Advanced', description: 'Highly sophisticated' },
  ];

  useEffect(() => {
    if (selectedIndustry) {
      fetchIndustryTemplates(selectedIndustry);
      generateContextSuggestions(selectedIndustry).then(setContextSuggestions);
    }
  }, [selectedIndustry]);

  const handleCreateTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const customizations = {
        personalization_variables: personalizationData,
      };

      const newTemplate = await createFromIndustryTemplate(selectedTemplate, customizations);
      
      if (newTemplate && onTemplateCreated) {
        onTemplateCreated(newTemplate);
      }
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleAddContextEvent = async () => {
    try {
      let eventData = {};
      try {
        eventData = JSON.parse(newEvent.event_data);
      } catch {
        eventData = { content: newEvent.event_data };
      }

      await createContextEvent({
        event_type: newEvent.event_type,
        event_title: newEvent.event_title,
        event_description: newEvent.event_description,
        event_data: eventData,
        event_date: newEvent.event_date,
        relevance_score: newEvent.relevance_score,
        is_active: true,
      });

      // Reset form
      setNewEvent({
        event_type: 'company',
        event_title: '',
        event_description: '',
        event_data: '{}',
        event_date: new Date().toISOString().split('T')[0],
        relevance_score: 0.7,
      });
    } catch (error) {
      console.error('Error creating context event:', error);
    }
  };

  const selectedTemplateData = industryTemplates.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Intelligent Template Engine
          </CardTitle>
          <CardDescription>
            Create dynamic, personalized phishing templates with real-time context awareness
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Template</TabsTrigger>
          <TabsTrigger value="context">Context Events</TabsTrigger>
          <TabsTrigger value="analyze">Analyze</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Industry Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Industry Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="industry">Target Industry</Label>
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
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

                {industryTemplates.length > 0 && (
                  <div>
                    <Label>Available Templates</Label>
                    <div className="space-y-2 mt-2">
                      {industryTemplates.map(template => (
                        <div
                          key={template.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedTemplate === template.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{template.template_name}</h4>
                            <Badge 
                              variant={
                                template.sophistication_level === 'advanced' ? 'destructive' :
                                template.sophistication_level === 'medium' ? 'default' : 'secondary'
                              }
                            >
                              {template.sophistication_level}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {(template.template_data as any)?.category || 'General'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Template Preview & Personalization */}
            {selectedTemplateData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Template Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Subject</Label>
                    <div className="p-2 bg-muted rounded text-sm">
                      {(selectedTemplateData.template_data as any)?.subject || 'No subject'}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Variables</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {((selectedTemplateData.template_data as any)?.variables || []).map((variable: string) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium mb-2">Personalization Data</Label>
                    <div className="space-y-2">
                      {((selectedTemplateData.template_data as any)?.variables || []).map((variable: string) => (
                        <div key={variable}>
                          <Label htmlFor={variable} className="text-xs">
                            {variable.replace(/_/g, ' ').toUpperCase()}
                          </Label>
                          <Input
                            id={variable}
                            value={personalizationData[variable] || ''}
                            onChange={(e) => setPersonalizationData(prev => ({
                              ...prev,
                              [variable]: e.target.value
                            }))}
                            placeholder={`Enter ${variable}`}
                            className="text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={handleCreateTemplate}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Creating...' : 'Create Personalized Template'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Context Suggestions */}
          {contextSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Context-Aware Suggestions
                </CardTitle>
                <CardDescription>
                  Current events and company updates that can enhance your template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contextSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{suggestion.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(suggestion.relevance * 100)}% relevant
                        </Badge>
                      </div>
                      {suggestion.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {suggestion.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {suggestion.variables?.map((variable: string) => (
                          <Badge key={variable} variant="outline" className="text-xs">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="context" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Context Events Management
              </CardTitle>
              <CardDescription>
                Add current events, company updates, and contextual information for more realistic templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="event_type">Event Type</Label>
                  <Select 
                    value={newEvent.event_type} 
                    onValueChange={(value: any) => setNewEvent(prev => ({ ...prev, event_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">Company Update</SelectItem>
                      <SelectItem value="news">Industry News</SelectItem>
                      <SelectItem value="security">Security Alert</SelectItem>
                      <SelectItem value="seasonal">Seasonal Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="event_date">Event Date</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={newEvent.event_date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, event_date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="event_title">Event Title</Label>
                <Input
                  id="event_title"
                  value={newEvent.event_title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, event_title: e.target.value }))}
                  placeholder="e.g., Quarterly Security Update, New HIPAA Regulations"
                />
              </div>

              <div>
                <Label htmlFor="event_description">Description</Label>
                <Textarea
                  id="event_description"
                  value={newEvent.event_description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, event_description: e.target.value }))}
                  placeholder="Brief description of the event..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="event_data">Event Data (JSON)</Label>
                <Textarea
                  id="event_data"
                  value={newEvent.event_data}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, event_data: e.target.value }))}
                  placeholder='{"update_type": "security", "deadline": "2024-12-31"}'
                  rows={3}
                />
              </div>

              <div>
                <Label>Relevance Score: {newEvent.relevance_score}</Label>
                <Progress value={newEvent.relevance_score * 100} className="mt-2" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={newEvent.relevance_score}
                  onChange={(e) => setNewEvent(prev => ({ 
                    ...prev, 
                    relevance_score: parseFloat(e.target.value) 
                  }))}
                  className="w-full mt-2"
                />
              </div>

              <Button onClick={handleAddContextEvent} disabled={loading} className="w-full">
                {loading ? 'Adding...' : 'Add Context Event'}
              </Button>
            </CardContent>
          </Card>

          {/* Active Context Events */}
          {contextEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active Context Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contextEvents.slice(0, 5).map(event => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{event.event_title}</h4>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {event.event_type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(event.relevance_score * 100)}%
                          </Badge>
                        </div>
                      </div>
                      {event.event_description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {event.event_description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.event_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analyze" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Template Analysis
              </CardTitle>
              <CardDescription>
                Analyze template effectiveness and get improvement suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisResults ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {analysisResults.personalization_score}%
                      </div>
                      <div className="text-sm text-muted-foreground">Personalization</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {analysisResults.context_awareness}%
                      </div>
                      <div className="text-sm text-muted-foreground">Context Awareness</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {analysisResults.industry_relevance}%
                      </div>
                      <div className="text-sm text-muted-foreground">Industry Relevance</div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Improvement Suggestions</h4>
                    <div className="space-y-2">
                      {analysisResults.suggestions.map((suggestion: string, index: number) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{suggestion}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Select a template to analyze its effectiveness
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};