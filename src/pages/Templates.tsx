
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Edit, Trash2, Copy, Eye, Wand2, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useTemplates } from "@/hooks/useTemplates";

const Templates = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { templates, loading, deleteTemplate, createTemplate } = useTemplates();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiCategory, setAiCategory] = useState("");

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTemplate(id);
    } catch (error: any) {
      toast({
        title: "Error deleting template",
        description: error.message || "Failed to delete email template",
        variant: "destructive"
      });
    }
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    try {
      const templateToDuplicate = templates.find(t => t.id === templateId);
      if (!templateToDuplicate) return;

      await createTemplate({
        name: `${templateToDuplicate.name} (Copy)`,
        subject: templateToDuplicate.subject,
        html_content: templateToDuplicate.html_content,
        text_content: templateToDuplicate.text_content || "",
        category: templateToDuplicate.category,
        description: templateToDuplicate.description,
        version: 1,
      });

      toast({
        title: "Template duplicated",
        description: `"${templateToDuplicate.name}" has been duplicated successfully`
      });
    } catch (error: any) {
      toast({
        title: "Error duplicating template",
        description: error.message || "Failed to duplicate email template",
        variant: "destructive"
      });
    }
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for AI generation",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=AIzaSyBH7YKXnzoOW8QfUGPHyQd8tHOJMXxLkwU', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a professional phishing email template for security awareness training. Based on this prompt: "${aiPrompt}".

Please provide a JSON response with the following structure:
{
  "name": "Template name (descriptive)",
  "subject": "Email subject line",
  "category": "One of: phishing, spear-phishing, credential-harvest, attachment, business-email, social-engineering, general",
  "html_content": "Complete HTML email content with realistic styling and call-to-action",
  "text_content": "Plain text version of the email"
}

Make it realistic but clearly for educational/training purposes. Include proper HTML structure with inline CSS for email compatibility. The content should be convincing but appropriate for security awareness training.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
      }

      const content = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Gemini response');
      }

      const templateData = JSON.parse(jsonMatch[0]);
      
      await createTemplate({
        name: templateData.name,
        subject: templateData.subject,
        html_content: templateData.html_content,
        text_content: templateData.text_content,
        category: aiCategory || templateData.category,
        description: `AI-generated template based on: ${aiPrompt}`,
        version: 1,
      });

      setShowAIDialog(false);
      setAiPrompt("");
      setAiCategory("");
      
      toast({
        title: "Template generated",
        description: "AI-generated template has been created successfully"
      });
    } catch (error: any) {
      toast({
        title: "AI generation failed",
        description: error.message || "Failed to generate template with AI",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Email Templates</h1>
            <p className="text-muted-foreground">Manage email templates for your phishing campaigns</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={isGenerating}>
                  <Wand2 size={16} className="mr-2" />
                  Generate with AI
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Generate Template with AI</DialogTitle>
                  <DialogDescription>
                    Describe the type of phishing template you want to create for security awareness training.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="prompt">Template Description</Label>
                    <Textarea
                      id="prompt"
                      placeholder="E.g., Create a password reset email template that looks like it's from IT department..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category (Optional)</Label>
                    <Select value={aiCategory} onValueChange={setAiCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phishing">Phishing</SelectItem>
                        <SelectItem value="spear-phishing">Spear Phishing</SelectItem>
                        <SelectItem value="credential-harvest">Credential Harvesting</SelectItem>
                        <SelectItem value="attachment">Malicious Attachment</SelectItem>
                        <SelectItem value="business-email">Business Email Compromise</SelectItem>
                        <SelectItem value="social-engineering">Social Engineering</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAIDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleGenerateWithAI} disabled={isGenerating}>
                    {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={() => navigate("/templates/new")}>
              <Plus size={16} className="mr-2" />
              New Template
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Template Library</CardTitle>
            <CardDescription>
              Browse and manage your email templates for phishing campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No templates found</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setShowAIDialog(true)} disabled={isGenerating}>
                    <Wand2 size={16} className="mr-2" />
                    {isGenerating ? "Generating..." : "Generate Your First Template"}
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/templates/new")}>
                    <Plus size={16} className="mr-2" />
                    Create Manually
                  </Button>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {template.category}
                        </Badge>
                      </TableCell>
                      <TableCell>v{template.version}</TableCell>
                      <TableCell>
                        {format(new Date(template.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => navigate(`/templates/${template.id}/preview`)}
                                >
                                  <Eye size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Preview</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => navigate(`/templates/${template.id}/edit`)}
                                >
                                  <Edit size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDuplicateTemplate(template.id)}
                                >
                                  <Copy size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Duplicate</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDeleteTemplate(template.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Templates;
