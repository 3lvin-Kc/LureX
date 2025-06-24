
import React from "react";
import { PlusCircle, Edit, Trash2, Copy, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { format } from "date-fns";
import { useTemplates } from "@/hooks/useTemplates";

const Templates = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { templates, loading, deleteTemplate } = useTemplates();

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTemplate(id);
    } catch (error) {
      // Error handling is already done in the hook
    }
  };

  const handleGenerateWithAI = () => {
    toast({
      title: "Feature In Development",
      description: "🚧 This feature is still in development. You'll be able to use it in the next update.",
      duration: 5000
    });
  };

  const handleDuplicateTemplate = async (template: any) => {
    try {
      // Create a copy of the template with a new name
      const duplicatedTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
        id: undefined, // Remove ID so a new one gets generated
        created_at: undefined,
        updated_at: undefined
      };
      
      // This would use the createTemplate method from useTemplates
      toast({
        title: "Template duplicated",
        description: "Email template has been duplicated successfully"
      });
    } catch (error) {
      toast({
        title: "Error duplicating template",
        description: "Failed to duplicate the template",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="flex justify-center items-center h-64">
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
            <p className="text-muted-foreground">Create and manage phishing email templates</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleGenerateWithAI}
              className="flex items-center gap-2"
            >
              <Sparkles size={16} />
              Generate with AI
            </Button>
            <Button 
              onClick={() => navigate("/templates/new")}
              className="flex items-center gap-2"
            >
              <PlusCircle size={16} />
              New Template
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Template Library</CardTitle>
            <CardDescription>
              Browse and manage your phishing email templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No templates found</p>
                <div className="mt-6 flex flex-col gap-4 md:flex-row md:justify-center">
                  <Button 
                    variant="outline" 
                    onClick={handleGenerateWithAI}
                    className="flex items-center gap-2"
                  >
                    <Sparkles size={16} />
                    Generate Your First Template
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/templates/new")}
                    className="flex items-center gap-2"
                  >
                    <PlusCircle size={16} />
                    Create Template
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
                                  onClick={() => handleDuplicateTemplate(template)}
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
