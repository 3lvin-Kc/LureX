
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Edit, Trash2, Copy, Eye, Wand2 } from "lucide-react";
import { format } from "date-fns";
import { useTemplates } from "@/hooks/useTemplates";
import { supabase } from "@/integrations/supabase/client";

const Templates = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { templates: templatesData, loading, deleteTemplate } = useTemplates();
  const [isGenerating, setIsGenerating] = useState(false);
  const [templates, setTemplates] = useState(templatesData);

  React.useEffect(() => {
    setTemplates(templatesData);
  }, [templatesData]);

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTemplate(id);
      toast({
        title: "Template deleted",
        description: "Email template has been deleted successfully"
      });
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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name: `${templateToDuplicate.name} (Copy)`,
          subject: templateToDuplicate.subject,
          html_content: templateToDuplicate.html_content,
          text_content: templateToDuplicate.text_content,
          category: templateToDuplicate.category,
          description: templateToDuplicate.description,
          version: 1,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [...prev, data]);
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
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to generate templates with AI",
          variant: "destructive"
        });
        return;
      }

      const response = await supabase.functions.invoke('generate-template-ai', {
        body: { 
          prompt: "Generate a professional phishing email template for security awareness training that simulates a password reset request" 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'AI generation failed');
      }

      if (response.data?.success) {
        setTemplates(prev => [...prev, response.data.data]);
        toast({
          title: "Template generated",
          description: "AI-generated template has been created successfully"
        });
      } else {
        throw new Error(response.data?.error || 'AI generation failed');
      }
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
            <Button 
              variant="outline" 
              onClick={handleGenerateWithAI}
              disabled={isGenerating}
            >
              <Wand2 size={16} className="mr-2" />
              {isGenerating ? "Generating..." : "Generate with AI"}
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
                <Button onClick={handleGenerateWithAI} disabled={isGenerating}>
                  <Wand2 size={16} className="mr-2" />
                  {isGenerating ? "Generating..." : "Generate Your First Template"}
                </Button>
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
