
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

const PhishingPages = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showCloneWarning, setShowCloneWarning] = useState(false);

  // Fetch phishing pages from Supabase
  const { data: phishingPages, isLoading, refetch } = useQuery({
    queryKey: ["phishing-pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("phishing_pages")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        toast({
          title: "Error fetching pages",
          description: error.message,
          variant: "destructive"
        });
        return [];
      }
      
      return data || [];
    },
  });

  // Poll for updates every 5 seconds while on this page
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [refetch]);

  // Delete phishing page mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setIsDeleting(id);
      const { error } = await supabase
        .from("phishing_pages")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["phishing-pages"] });
      toast({
        title: "Page deleted",
        description: "Phishing page has been deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting page",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsDeleting(null);
    }
  });

  const handleDeletePage = (id: string) => {
    deleteMutation.mutate(id);
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
      // First, get the page to duplicate
      const { data: pageData, error: fetchError } = await supabase
        .from("phishing_pages")
        .select("*")
        .eq("id", pageId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Create a duplicate without the id field
      const { name, category, source_url, html_content, css_content, js_content, is_custom } = pageData;
      const newName = `${name} (Copy)`;
      
      const { data: newPage, error: insertError } = await supabase
        .from("phishing_pages")
        .insert([
          { 
            name: newName, 
            category, 
            source_url, 
            html_content, 
            css_content, 
            js_content, 
            is_custom 
          }
        ])
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      queryClient.invalidateQueries({ queryKey: ["phishing-pages"] });
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
            {isLoading ? (
              <div className="text-center py-8">Loading phishing pages...</div>
            ) : phishingPages?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No phishing pages found</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate("/phishing-pages/new")}
                >
                  Create Phishing Page
                </Button>
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
