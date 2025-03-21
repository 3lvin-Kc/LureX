
import React from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import TemplateForm from "@/components/templates/TemplateForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreateTemplate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

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

        <TemplateForm templateId={id} />
      </div>
    </DashboardLayout>
  );
};

export default CreateTemplate;
