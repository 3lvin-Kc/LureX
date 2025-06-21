
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import TemplateForm from "@/components/templates/TemplateForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTemplates } from "@/hooks/useTemplates";

const CreateTemplate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { templates, createTemplate, updateTemplate, loading } = useTemplates();
  const [existingTemplate, setExistingTemplate] = useState(null);
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing && templates.length > 0) {
      const template = templates.find(t => t.id === id);
      if (template) {
        setExistingTemplate(template);
      } else {
        toast({
          title: "Template not found",
          description: "The template you're trying to edit doesn't exist.",
          variant: "destructive",
        });
        navigate("/templates");
      }
    }
  }, [id, templates, isEditing, toast, navigate]);

  const handleTemplateSubmit = async (data: any) => {
    try {
      if (isEditing) {
        await updateTemplate(id!, {
          name: data.name,
          subject: data.subject,
          html_content: data.html_content,
          text_content: data.text_content,
          category: data.category,
          description: data.description,
        });
      } else {
        await createTemplate({
          name: data.name,
          subject: data.subject,
          html_content: data.html_content,
          text_content: data.text_content,
          category: data.category,
          description: data.description,
          version: 1,
        });
      }
      
      navigate("/templates");
    } catch (error: any) {
      console.error('Template submission error:', error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? 'update' : 'create'} template. Please try again.`,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 max-w-5xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-5xl">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate("/templates")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Templates
        </Button>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Email Template" : "Create New Email Template"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing 
              ? "Make changes to your existing template" 
              : "Create a new phishing email template that can be used in campaigns"}
          </p>
        </div>

        <TemplateForm 
          onSubmit={handleTemplateSubmit} 
          initialData={existingTemplate}
          isEditing={isEditing}
        />
      </div>
    </DashboardLayout>
  );
};

export default CreateTemplate;
