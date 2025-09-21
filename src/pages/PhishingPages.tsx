
import React, { useState } from "react";
import { PlusCircle, Globe, Edit, Trash2, Copy, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { format } from "date-fns";
import CloneWebsiteWarning from "@/components/phishing/CloneWebsiteWarning";
import { usePhishingPages } from "@/hooks/usePhishingPages";

const PhishingPages = () => {
  const navigate = useNavigate();
  const { phishingPages, loading, deletePhishingPage, duplicatePhishingPage } = usePhishingPages();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showCloneWarning, setShowCloneWarning] = useState(false);

  const handleDeletePage = async (id: string) => {
    setIsDeleting(id);
    try {
      await deletePhishingPage(id);
    } catch (error) {
      // Error handling is already done in the hook
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCloneWebsiteClick = () => {
    setShowCloneWarning(true);
  };

  const handleCloneProceed = () => {
    setShowCloneWarning(false);
    navigate("/phishing-pages/create-from-url");
  };

  const handleCloneCancel = () => {
    setShowCloneWarning(false);
  };

  const handleDuplicatePage = async (pageId: string) => {
    try {
      await duplicatePhishingPage(pageId);
    } catch (error) {
      // Error handling is already done in the hook
    }
  };

  const handlePreview = (pageId: string) => {
    navigate(`/phishing-pages/${pageId}/preview`);
  };

  const handleEdit = (pageId: string) => {
    navigate(`/phishing-pages/${pageId}/edit`);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Phishing Pages</h1>
            <p className="text-muted-foreground text-lg">Manage fake login pages for your phishing campaigns</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={handleCloneWebsiteClick}
              className="flex items-center gap-2 h-10 px-4 hover:bg-accent/50 transition-all duration-200 border-border/50 hover:border-border shadow-sm"
            >
              <Globe size={16} className="text-muted-foreground" />
              Clone Website
            </Button>
            <Button 
              onClick={() => navigate("/phishing-pages/new")}
              className="flex items-center gap-2 h-10 px-4 bg-primary hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <PlusCircle size={16} />
              New Page
            </Button>
          </div>
        </div>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-xl font-semibold">My Phishing Pages</CardTitle>
            <CardDescription className="text-base">
              Browse and manage your fake login pages for phishing campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : phishingPages?.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="mx-auto w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                  <Globe className="w-8 h-8 text-muted-foreground/60" />
                </div>
                <p className="text-muted-foreground text-lg mb-2">No phishing pages found</p>
                <p className="text-muted-foreground/70 text-sm mb-8">Get started by creating your first phishing page</p>
                <div className="flex flex-col gap-3 md:flex-row md:justify-center">
                  <Button 
                    variant="outline" 
                    onClick={handleCloneWebsiteClick}
                    className="flex items-center gap-2 h-10 px-4 hover:bg-accent/50 transition-all duration-200"
                  >
                    <Globe size={16} />
                    Clone Website
                  </Button>
                  <Button 
                    onClick={() => navigate("/phishing-pages/new")}
                    className="flex items-center gap-2 h-10 px-4 bg-primary hover:bg-primary/90 transition-all duration-200"
                  >
                    <PlusCircle size={16} />
                    Create Custom Page
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-muted/30">
                      <TableHead className="font-semibold text-foreground/90 py-4">Name</TableHead>
                      <TableHead className="font-semibold text-foreground/90">Category</TableHead>
                      <TableHead className="font-semibold text-foreground/90">Type</TableHead>
                      <TableHead className="font-semibold text-foreground/90">Created</TableHead>
                      <TableHead className="text-right font-semibold text-foreground/90">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {phishingPages?.map((page, index) => (
                      <TableRow 
                        key={page.id} 
                        className="border-border/30 hover:bg-muted/20 transition-colors duration-200"
                      >
                        <TableCell className="font-medium py-4 text-foreground">{page.name}</TableCell>
                        <TableCell>
                          {page.category ? (
                            <Badge 
                              variant="outline" 
                              className="capitalize border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors duration-200"
                            >
                              {page.category}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={page.is_custom ? "default" : "secondary"}
                            className={`${
                              page.is_custom 
                                ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" 
                                : "bg-muted text-muted-foreground border-border/50 hover:bg-muted/80"
                            } transition-colors duration-200`}
                          >
                            {page.is_custom ? "Custom" : "Cloned"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(page.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handlePreview(page.id)}
                                    className="h-8 w-8 hover:bg-accent/50 transition-all duration-200"
                                  >
                                    <Eye size={14} className="text-muted-foreground hover:text-foreground" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">Preview</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(page.id)}
                                    className="h-8 w-8 hover:bg-accent/50 transition-all duration-200"
                                  >
                                    <Edit size={14} className="text-muted-foreground hover:text-foreground" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">Edit</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDuplicatePage(page.id)}
                                    className="h-8 w-8 hover:bg-accent/50 transition-all duration-200"
                                  >
                                    <Copy size={14} className="text-muted-foreground hover:text-foreground" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">Duplicate</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={isDeleting === page.id}
                                    onClick={() => handleDeletePage(page.id)}
                                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 disabled:opacity-50"
                                  >
                                    <Trash2 size={14} className="text-muted-foreground" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">Delete</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
