
import React, { useState } from "react";
import { PlusCircle, Globe, Edit, Trash2, Copy, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { format } from "date-fns";
import CloneWebsiteWarning from "@/components/phishing/CloneWebsiteWarning";
import { usePhishingPages } from "@/hooks/usePhishingPages";

const PhishingPages = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { pages, loading } = usePhishingPages();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showCloneWarning, setShowCloneWarning] = useState(false);

  const handleDeletePage = (id: string) => {
    setIsDeleting(id);
    try {
      // TODO: Implement actual delete functionality
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
    setShowCloneWarning(true);
  };

  const handleCloneProceed = () => {
    navigate("/phishing-pages/create-from-url");
  };

  const handleCloneCancel = () => {
    navigate("/phishing-pages/new");
  };

  const handleDuplicatePage = async (pageId: string) => {
    try {
      const pageData = pages.find(p => p.id === pageId);
      if (!pageData) return;
      
      toast({
        title: "Feature not implemented",
        description: "Page duplication will be available soon",
        variant: "destructive"
      });
      
    } catch (error) {
      toast({
        title: "Error duplicating page",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="flex items-center justify-center h-64">
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Phishing Page Library</CardTitle>
            <CardDescription>
              Browse and manage your fake login pages for phishing campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pages?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No phishing pages found</p>
                <div className="mt-6 flex flex-col gap-4 md:flex-row md:justify-center">
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
                  {pages?.map((page) => (
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
      </div>
      
      <CloneWebsiteWarning 
        open={showCloneWarning}
        onOpenChange={setShowCloneWarning}
        onProceed={handleCloneProceed}
        onCancel={handleCloneCancel}
      />
    </DashboardLayout>
  );
};

export default PhishingPages;
