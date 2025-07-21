import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit } from "lucide-react";
import { useTemplates } from "@/hooks/useTemplates";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const TemplatePreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { templates, loading } = useTemplates();
  const { toast } = useToast();
  const [template, setTemplate] = useState<any>(null);

  useEffect(() => {
    if (id && templates.length > 0) {
      const found = templates.find(t => t.id === id);
      if (found) {
        setTemplate(found);
      } else {
        toast({
          title: "Template not found",
          description: "The requested template could not be found",
          variant: "destructive"
        });
        navigate("/templates");
      }
    }
  }, [id, templates, navigate, toast]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!template) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate("/templates")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Templates
        </Button>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{template.name}</h1>
            <p className="text-muted-foreground">Preview of your email template</p>
          </div>
          <Button onClick={() => navigate(`/templates/${id}/edit`)}>
            <Edit size={16} className="mr-2" /> Edit Template
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-4 flex-wrap">
              <Badge variant="outline">{template.category}</Badge>
              <span>v{template.version}</span>
              <span>{format(new Date(template.created_at), "MMM d, yyyy")}</span>
            </div>
            <div className="mb-4">
              <strong>Subject:</strong> {template.subject}
            </div>
            {template.description && (
              <div className="mb-4">
                <strong>Description:</strong> {template.description}
              </div>
            )}
            <div className="mb-4">
              <strong>HTML Preview:</strong>
              <div className="border rounded-lg p-4 bg-white min-h-64 mt-2">
                <div dangerouslySetInnerHTML={{ __html: template.html_content }} />
              </div>
            </div>
            {template.text_content && (
              <div className="mb-4">
                <strong>Plain Text Version:</strong>
                <pre className="bg-muted p-2 rounded mt-2">{template.text_content}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TemplatePreview; 