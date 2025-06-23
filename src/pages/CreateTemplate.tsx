
import React from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CreateTemplate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const handleGenerateWithAI = () => {
    toast({
      title: "Feature In Development",
      description: "🚧 This feature is still in development. You'll be able to use it in the next update.",
      duration: 5000
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: isEditing ? "Template Updated" : "Template Created",
      description: `Your email template has been ${isEditing ? 'updated' : 'created'} successfully.`,
    });
    navigate("/templates");
  };

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

        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>
              Configure your email template content and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="Enter template name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <div className="flex gap-2">
                  <Input
                    id="subject"
                    placeholder="Enter email subject line"
                    className="flex-1"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateWithAI}
                    className="flex items-center gap-2"
                  >
                    <Sparkles size={16} />
                    AI Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Banking">Banking</SelectItem>
                    <SelectItem value="Social">Social Media</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                    <SelectItem value="Cloud">Cloud Services</SelectItem>
                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Email Content</Label>
                <div className="space-y-2">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateWithAI}
                      className="flex items-center gap-2"
                    >
                      <Sparkles size={14} />
                      Generate with AI
                    </Button>
                  </div>
                  <Textarea 
                    id="content"
                    className="min-h-64"
                    placeholder="Enter your email content here..."
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/templates")}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Update Template" : "Create Template"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateTemplate;
