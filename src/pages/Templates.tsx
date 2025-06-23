
import React, { useState } from "react";
import { PlusCircle, Mail, Edit, Trash2, Copy, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { format } from "date-fns";

// Mock data for templates
const mockTemplates = [
  {
    id: "1",
    name: "Bank Security Alert",
    subject: "Urgent: Verify Your Account",
    category: "Banking",
    created_at: "2024-01-15T09:00:00Z"
  },
  {
    id: "2", 
    name: "IT Support Request",
    subject: "Action Required: Update Your Password",
    category: "Corporate",
    created_at: "2024-02-01T09:00:00Z"
  }
];

const Templates = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [templates] = useState(mockTemplates);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteTemplate = async (id: string) => {
    setIsDeleting(id);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Template deleted",
        description: "Email template has been deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error deleting template",
        description: "Failed to delete the template",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleGenerateWithAI = () => {
    toast({
      title: "Feature In Development",
      description: "🚧 This feature is still in development. You'll be able to use it in the next update.",
      duration: 5000
    });
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    try {
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
      </div>
    </DashboardLayout>
  );
};

export default Templates;
