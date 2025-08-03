
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PlusCircle, Edit, Trash2, Copy, Eye, Wand2 } from "lucide-react";
import { format } from "date-fns";
import { useTemplates } from "@/hooks/useTemplates";

const Templates = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { templates, loading, deleteTemplate, createTemplate } = useTemplates();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteTemplate = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteTemplate(id);
      // Success toast handled in hook
    } catch (error) {
      // Error toast handled in hook
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    const templateToDuplicate = templates.find(t => t.id === templateId);
    if (!templateToDuplicate) {
      toast({
        title: "Template not found",
        description: "Could not find the template to duplicate.",
        variant: "destructive"
      });
      return;
    }
    try {
      await createTemplate({
        name: `${templateToDuplicate.name} (Copy)`,
        subject: templateToDuplicate.subject,
        category: templateToDuplicate.category,
        html_content: templateToDuplicate.html_content,
        text_content: templateToDuplicate.text_content,
        description: templateToDuplicate.description,
        version: 1,
      });
      toast({
        title: "Template duplicated",
        description: `"${templateToDuplicate.name}" has been duplicated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error duplicating template",
        description: "Failed to duplicate email template",
        variant: "destructive"
      });
    }
  };

  const handleGenerateWithAI = () => {
    toast({
      title: "AI Generation not implemented",
      description: "AI template generation functionality is not yet available",
      variant: "destructive"
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Email Templates</h1>
            <p className="text-muted-foreground">Manage email templates for your phishing campaigns</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGenerateWithAI}>
              <Wand2 size={16} className="mr-2" />
              Generate with AI
            </Button>
            <Button onClick={() => navigate("/templates/new")}> 
              <PlusCircle size={16} className="mr-2" />
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
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No templates found</p>
                <Button onClick={() => navigate("/templates/new")}> 
                  <PlusCircle size={16} className="mr-2" />
                  Create Your First Template
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
                                  disabled={isDeleting === template.id}
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
          </TabsContent>

          <TabsContent value="intelligent">
            <IntelligentTemplateEngine 
              onTemplateCreated={() => {
                refetchTemplates();
                toast({
                  title: "Template Created",
                  description: "Intelligent template created successfully",
                });
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Templates;
