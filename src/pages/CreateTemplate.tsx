import React, { useRef } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Sparkles, Eye, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTemplates } from "@/hooks/useTemplates";
import VariableAutocomplete from "@/components/templates/VariableAutocomplete";
import SmartTemplateSuggestions, { TemplateSuggestion } from "@/components/templates/SmartTemplateSuggestions";
import TemplateEffectivenessScorer from "@/components/templates/TemplateEffectivenessScorer";
const CreateTemplate = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    createTemplate,
    updateTemplate,
    templates,
    loading
  } = useTemplates();
  const isEditing = !!id;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [form, setForm] = React.useState({
    name: "",
    subject: "",
    category: "",
    html_content: "",
    text_content: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("editor");
  const [previewContent, setPreviewContent] = React.useState("");

  // Load template data for editing
  React.useEffect(() => {
    if (isEditing && id && templates.length > 0) {
      const found = templates.find(t => t.id === id);
      if (found) {
        setForm({
          name: found.name || "",
          subject: found.subject || "",
          category: found.category || "",
          html_content: found.html_content || "",
          text_content: found.text_content || "",
          description: found.description || ""
        });
      }
    }
  }, [isEditing, id, templates]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value
    });
  };
  const handleCategoryChange = (value: string) => {
    setForm({
      ...form,
      category: value
    });
  };
  const handleGenerateWithAI = () => {
    toast({
      title: "Feature In Development",
      description: "🚧 This feature is still in development. You'll be able to use it in the next update.",
      duration: 5000
    });
  };
  const handleVariableInsert = (variable: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = form.html_content.substring(0, start) + `{{${variable}}}` + form.html_content.substring(end);
      setForm({
        ...form,
        html_content: newValue
      });

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };
  const handleSuggestionSelect = (suggestion: TemplateSuggestion) => {
    setForm({
      ...form,
      name: suggestion.name,
      subject: suggestion.subject,
      category: suggestion.category,
      html_content: suggestion.html_content,
      description: suggestion.description
    });
    setActiveTab("editor");
  };
  const handleSuggestionPreview = (suggestion: TemplateSuggestion) => {
    setPreviewContent(suggestion.html_content);
    setActiveTab("preview");
  };
  const handlePreview = () => {
    setPreviewContent(form.html_content);
    setActiveTab("preview");
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing && id) {
        await updateTemplate(id, {
          name: form.name,
          subject: form.subject,
          category: form.category || "general",
          html_content: form.html_content,
          text_content: form.text_content,
          description: form.description
        });
      } else {
        await createTemplate({
          name: form.name,
          subject: form.subject,
          category: form.category || "general",
          html_content: form.html_content,
          text_content: form.text_content,
          description: form.description,
          version: 1
        });
      }
      navigate("/templates");
    } catch (error) {
      // Error toast handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };
  return <DashboardLayout>
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
            {isEditing ? "Make changes to your existing template" : "Create a new phishing email template that can be used in campaigns"}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="suggestions">Smart Suggestions</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
                <CardDescription>
                  Configure your email template content and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Template Name</Label>
                      <Input id="name" placeholder="Enter template name" required value={form.name} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={form.category} onValueChange={handleCategoryChange}>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject</Label>
                    <div className="flex gap-2">
                      <Input id="subject" placeholder="Enter email subject line" className="flex-1" required value={form.subject} onChange={handleChange} />
                      <Button type="button" variant="outline" onClick={handleGenerateWithAI} className="flex items-center gap-2">
                        <Sparkles size={16} />
                        AI Generate
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea id="description" className="min-h-20" placeholder="Brief description (optional)" value={form.description} onChange={handleChange} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Content Editor */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="html_content">Email Content</Label>
                          <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={handlePreview} className="flex items-center gap-2">
                              <Eye size={14} />
                              Preview
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={handleGenerateWithAI} className="flex items-center gap-2">
                              <Sparkles size={14} />
                              Generate with AI
                            </Button>
                          </div>
                        </div>
                        <Textarea ref={textareaRef} id="html_content" className="min-h-96 font-mono text-sm" placeholder="Enter your email content here..." required value={form.html_content} onChange={handleChange} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="text_content">Plain Text Content (Optional)</Label>
                        <Textarea id="text_content" className="min-h-32" placeholder="Enter plain text version (optional)" value={form.text_content} onChange={handleChange} />
                      </div>
                    </div>

                    {/* Variable Autocomplete */}
                    <div className="space-y-4">
                      
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate("/templates")} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? isEditing ? "Updating..." : "Creating..." : isEditing ? "Update Template" : "Create Template"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suggestions">
            <SmartTemplateSuggestions selectedCategory={form.category} onSuggestionSelect={handleSuggestionSelect} onSuggestionPreview={handleSuggestionPreview} />
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Template Preview
                </CardTitle>
                <CardDescription>
                  See how your email template will appear to recipients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Email Headers */}
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div><strong>Subject:</strong> {form.subject || "No subject"}</div>
                      <div><strong>From:</strong> Your Campaign Name &lt;noreply@yourcompany.com&gt;</div>
                      <div><strong>To:</strong> {"{{email}}"}</div>
                    </div>
                  </div>
                  
                  {/* Email Content */}
                  <div className="border rounded-lg min-h-96">
                    <div className="bg-muted p-3 border-b">
                      <h4 className="font-medium">Email Content</h4>
                    </div>
                    <div className="p-4 bg-white">
                      {previewContent || form.html_content ? <div dangerouslySetInnerHTML={{
                      __html: previewContent || form.html_content
                    }} /> : <p className="text-muted-foreground text-center py-8">
                          Add content to see preview
                        </p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis">
            <TemplateEffectivenessScorer templateContent={{
            subject: form.subject,
            html_content: form.html_content,
            text_content: form.text_content,
            category: form.category
          }} onScoreUpdate={metrics => {
            console.log("Template effectiveness metrics:", metrics);
          }} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>;
};
export default CreateTemplate;