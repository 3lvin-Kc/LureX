
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Wand2, Bot, Archive } from "lucide-react";
import { useTemplates } from "@/hooks/useTemplates";
import { TemplateLibrary } from "@/components/templates/TemplateLibrary";
import { AITemplateGenerator } from "@/components/templates/AITemplateGenerator";
import { IntelligentTemplateEngine } from "@/components/templates/IntelligentTemplateEngine";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Templates = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { templates, loading, deleteTemplate, handleDuplicateTemplate, refetchTemplates } = useTemplates();
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

  const handleTemplateGenerated = (template: any) => {
    refetchTemplates();
    toast({
      title: "Template Generated!",
      description: "AI-generated template has been added to your library",
    });
  };

  const handleIntelligentTemplateCreated = () => {
    refetchTemplates();
    toast({
      title: "Template Created",
      description: "Intelligent template created successfully",
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Email Templates</h1>
            <p className="text-muted-foreground">Unified template library with AI-powered generation</p>
          </div>
        </div>

        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Archive size={16} />
              Template Library
            </TabsTrigger>
            <TabsTrigger value="ai-generator" className="flex items-center gap-2">
              <Bot size={16} />
              AI Generator
            </TabsTrigger>
            <TabsTrigger value="intelligent" className="flex items-center gap-2">
              <Wand2 size={16} />
              Intelligent Engine
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library">
            <TemplateLibrary
              templates={templates}
              loading={loading}
              onDeleteTemplate={handleDeleteTemplate}
              onDuplicateTemplate={handleDuplicateTemplate}
              isDeleting={isDeleting}
            />
          </TabsContent>

          <TabsContent value="ai-generator">
            <AITemplateGenerator onTemplateGenerated={handleTemplateGenerated} />
          </TabsContent>

          <TabsContent value="intelligent">
            <IntelligentTemplateEngine onTemplateCreated={handleIntelligentTemplateCreated} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Templates;
