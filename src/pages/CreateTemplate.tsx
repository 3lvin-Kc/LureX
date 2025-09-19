import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTemplates } from "@/hooks/useTemplates";
import TemplateForm from "@/components/templates/TemplateForm";

const CreateTemplate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { createTemplate, updateTemplate, templates, loading } = useTemplates();
  
  const isEditing = !!id;
  const template = isEditing ? templates.find(t => t.id === id) : null;

  const handleSubmit = async (data: any) => {
    if (isEditing && id) {
      await updateTemplate(id, data);
    } else {
      await createTemplate({
        ...data,
        version: 1
      });
    }
    navigate("/templates");
  };

  // Show loading if editing and templates are still loading
  if (isEditing && loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading template...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show not found if editing and template doesn't exist
  if (isEditing && !loading && id && templates.length > 0 && !template) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-2">Template Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The template you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate("/templates")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Templates
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-4xl">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/templates")}>
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
              : "Create a new phishing email template with logo-enhanced branding or manual HTML entry"
            }
          </p>
        </div>

        <TemplateForm
          onSubmit={handleSubmit}
          initialData={template}
          isEditing={isEditing}
        />
      </div>
    </DashboardLayout>
  );
};

export default CreateTemplate;