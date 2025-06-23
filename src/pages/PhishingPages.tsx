
import React, { useState, useEffect } from "react";
import { PlusCircle, Globe, Edit, Trash2, Copy, Eye, Library, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PhishingTemplateLibrary from "@/components/phishing/PhishingTemplateLibrary";
import { PhishingTemplate } from "@/utils/phishingTemplateLibrary";

// Mock data for phishing pages
const mockPhishingPages = [
  {
    id: "1",
    name: "Login Page Clone",
    category: "Banking",
    html_content: "<form><input type='email' placeholder='Email'><input type='password' placeholder='Password'><button>Login</button></form>",
    css_content: "body { font-family: Arial; }",
    js_content: "console.log('Mock phishing page');",
    is_custom: false,
    source_url: "https://example.com",
    created_at: "2024-01-01T00:00:00Z"
  }
];

const PhishingPages = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [phishingPages, setPhishingPages] = useState(mockPhishingPages);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("my-pages");

  const handleDeletePage = (id: string) => {
    setIsDeleting(id);
    try {
      setPhishingPages(prev => prev.filter(page => page.id !== id));
      toast({
        title: "Page deleted",
        description: "Phishing page has been deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error deleting page",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCloneWebsiteClick = () => {
    toast({
      title: "Clone Website",
      description: "⚠️ You can use this feature, but it's still in development. Results may not be as expected.",
      duration: 5000
    });
  };

  const handleDuplicatePage = async (pageId: string) => {
    try {
      const pageData = phishingPages.find(p => p.id === pageId);
      if (!pageData) return;
      
      const { name, category, source_url, html_content, css_content, js_content, is_custom } = pageData;
      const newName = `${name} (Copy)`;
      
      const newPage = {
        id: Date.now().toString(),
        name: newName,
        category,
        source_url,
        html_content,
        css_content,
        js_content,
        is_custom,
        created_at: new Date().toISOString()
      };
      
      setPhishingPages(prev => [...prev, newPage]);
      toast({
        title: "Page duplicated",
        description: `"${name}" has been duplicated successfully`
      });
      
    } catch (error) {
      toast({
        title: "Error duplicating page",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  };

  // Handler for template selection
  const handleTemplateSelect = async (template: PhishingTemplate) => {
    try {
      const newPage = {
        id: Date.now().toString(),
        name: template.name,
        category: template.category,
        html_content: template.htmlContent,
        css_content: template.cssContent || "",
        js_content: template.jsContent || "",
        is_custom: false,
        source_url: "",
        created_at: new Date().toISOString()
      };
      
      setPhishingPages(prev => [...prev, newPage]);
      toast({
        title: "Template Applied",
        description: `${template.name} template has been added to your phishing pages`,
        variant: "default"
      });
      
      setActiveTab("my-pages");
      
    } catch (error) {
      toast({
        title: "Error creating page",
        description: "Failed to create phishing page from template",
        variant: "destructive"
      });
      console.error("Error creating phishing page:", error);
    }
  };

  const handleCreateFromTemplate = () => {
    setActiveTab("templates");
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Phishing Pages</h1>
            <p className="text-muted-foreground">Manage fake login pages for your phishing campaigns</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleCloneWebsiteClick}
              className="flex items-center gap-2"
            >
              <Globe size={16} />
              Clone Website
            </Button>
            <Button 
              onClick={() => navigate("/phishing-pages/new")}
              className="flex items-center gap-2"
            >
              <PlusCircle size={16} />
              New Page
            </Button>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="my-pages" className="flex items-center gap-2">
              <Eye size={16} />
              My Pages
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Library size={16} />
              Template Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-pages">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Phishing Page Library</CardTitle>
                <CardDescription>
                  Browse and manage your fake login pages for phishing campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {phishingPages?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No phishing pages found</p>
                    <div className="mt-6 flex flex-col gap-4 md:flex-row md:justify-center">
                      <Button 
                        variant="outline" 
                        onClick={handleCreateFromTemplate}
                        className="flex items-center gap-2"
                      >
                        <Library size={16} />
                        Use Template
                        <ChevronRight size={16} className="ml-1" />
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleCloneWebsiteClick}
                        className="flex items-center gap-2"
                      >
                        <Globe size={16} />
                        Clone Website
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate("/phishing-pages/new")}
                        className="flex items-center gap-2"
                      >
                        <PlusCircle size={16} />
                        Create Custom Page
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {phishingPages?.map((page) => (
                        <TableRow key={page.id}>
                          <TableCell className="font-medium">{page.name}</TableCell>
                          <TableCell>
                            {page.category ? (
                              <Badge variant="outline" className="capitalize">
                                {page.category}
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={page.is_custom ? "default" : "secondary"}>
                              {page.is_custom ? "Custom" : "Cloned"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(page.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => navigate(`/phishing-pages/${page.id}/preview`)}
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
                                      onClick={() => navigate(`/phishing-pages/${page.id}/edit`)}
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
                                      onClick={() => handleDuplicatePage(page.id)}
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
                                      disabled={isDeleting === page.id}
                                      onClick={() => handleDeletePage(page.id)}
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

          <TabsContent value="templates">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Phishing Template Library</CardTitle>
                <CardDescription>
                  Browse and use pre-built phishing templates for various platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhishingTemplateLibrary onSelect={handleTemplateSelect} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PhishingPages;
