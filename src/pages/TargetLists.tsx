import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Users, FileUp, Edit, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TargetLists = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [newListData, setNewListData] = useState({ name: "", description: "" });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: targetLists, isLoading, error, refetch } = useQuery({
    queryKey: ["targetLists"],
    queryFn: async () => {
      // First get all target lists
      const { data: lists, error: listsError } = await supabase
        .from("target_lists")
        .select("*")
        .order("created_at", { ascending: false });

      if (listsError) throw listsError;

      // For each list, count the number of targets
      const listsWithCounts = await Promise.all(
        lists.map(async (list) => {
          const { count, error: countError } = await supabase
            .from("targets")
            .select("*", { count: "exact", head: true })
            .eq("list_id", list.id);

          if (countError) throw countError;

          return {
            ...list,
            target_count: count || 0,
          };
        })
      );

      return listsWithCounts;
    },
  });

  // Create target list mutation
  const createListMutation = useMutation({
    mutationFn: async (listData: { name: string; description: string }) => {
      const { data, error } = await supabase
        .from("target_lists")
        .insert([{ 
          name: listData.name, 
          description: listData.description
        }])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["targetLists"] });
      setNewListData({ name: "", description: "" });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Target list created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create target list",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  // Delete target list mutation
  const deleteListMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("target_lists")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["targetLists"] });
      toast({
        title: "Success",
        description: "Target list deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete target list",
        variant: "destructive",
      });
    }
  });

  const handleCreateList = async () => {
    try {
      setIsSubmitting(true);
      
      if (!newListData.name) {
        toast({
          title: "Error",
          description: "List name is required",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      createListMutation.mutate(newListData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create target list",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleImportList = async () => {
    try {
      setIsSubmitting(true);
      
      if (!csvFile) {
        toast({
          title: "Error",
          description: "Please select a CSV file to import",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!newListData.name) {
        toast({
          title: "Error",
          description: "List name is required",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // First create the list
      const { data: listData, error: listError } = await supabase
        .from("target_lists")
        .insert([{ 
          name: newListData.name, 
          description: newListData.description
        }])
        .select();

      if (listError) throw listError;
      
      const listId = listData[0].id;
      
      // Then parse and import the CSV data
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const rows = content.split("\n");
          
          // Skip header row and parse CSV
          const header = rows[0].split(",");
          const emailIndex = header.findIndex(col => col.toLowerCase().includes("email"));
          const firstNameIndex = header.findIndex(col => col.toLowerCase().includes("first") || col.toLowerCase().includes("fname"));
          const lastNameIndex = header.findIndex(col => col.toLowerCase().includes("last") || col.toLowerCase().includes("lname"));
          
          if (emailIndex === -1) {
            throw new Error("CSV must contain an email column");
          }
          
          const targets = [];
          
          // Start from row 1 to skip header
          for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue; // Skip empty rows
            
            const columns = rows[i].split(",");
            
            if (columns.length > emailIndex) {
              const email = columns[emailIndex].trim();
              
              if (email) { // Only add if email exists
                const target = {
                  list_id: listId,
                  email,
                  first_name: firstNameIndex !== -1 && columns.length > firstNameIndex ? columns[firstNameIndex].trim() : null,
                  last_name: lastNameIndex !== -1 && columns.length > lastNameIndex ? columns[lastNameIndex].trim() : null,
                };
                
                targets.push(target);
              }
            }
          }
          
          if (targets.length === 0) {
            throw new Error("No valid targets found in CSV");
          }
          
          // Insert targets in batches of 100
          const batchSize = 100;
          for (let i = 0; i < targets.length; i += batchSize) {
            const batch = targets.slice(i, i + batchSize);
            const { error: insertError } = await supabase
              .from("targets")
              .insert(batch);
              
            if (insertError) throw insertError;
          }
          
          toast({
            title: "Success",
            description: `Imported ${targets.length} targets to "${newListData.name}"`,
          });
          
          setNewListData({ name: "", description: "" });
          setCsvFile(null);
          setIsImportDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ["targetLists"] });
        } catch (error: any) {
          toast({
            title: "Import Error",
            description: error.message || "Failed to import targets",
            variant: "destructive",
          });
        } finally {
          setIsSubmitting(false);
        }
      };
      
      reader.onerror = () => {
        toast({
          title: "File Error",
          description: "Failed to read CSV file",
          variant: "destructive",
        });
        setIsSubmitting(false);
      };
      
      reader.readAsText(csvFile);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to import target list",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleDeleteList = async (id: string) => {
    deleteListMutation.mutate(id);
  };

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load target lists",
      variant: "destructive",
    });
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Target Lists</h1>
            <p className="text-muted-foreground">Manage your phishing campaign target lists</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsImportDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <FileUp size={16} />
              Import List
            </Button>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusCircle size={16} />
              New List
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Target Lists</CardTitle>
            <CardDescription>
              Manage target lists for your phishing campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading target lists...</div>
            ) : targetLists?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No target lists found</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  Create Target List
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Targets</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targetLists?.map((list) => (
                    <TableRow key={list.id}>
                      <TableCell className="font-medium">{list.name}</TableCell>
                      <TableCell>{list.description || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          {list.target_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(list.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => navigate(`/targets/${list.id}`)}
                                >
                                  <Users size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Targets</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => navigate(`/targets/${list.id}/edit`)}
                                >
                                  <Edit size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit List</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDeleteList(list.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete List</TooltipContent>
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

        {/* Create New List Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Target List</DialogTitle>
              <DialogDescription>
                Add a new list to organize your phishing campaign targets
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="list-name">List Name</Label>
                <Input 
                  id="list-name" 
                  placeholder="HR Department Targets" 
                  value={newListData.name}
                  onChange={(e) => setNewListData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="list-description">Description (Optional)</Label>
                <Textarea 
                  id="list-description" 
                  placeholder="Targets for the HR department phishing campaign" 
                  value={newListData.description}
                  onChange={(e) => setNewListData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateList} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create List"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import List Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Import Target List</DialogTitle>
              <DialogDescription>
                Import targets from a CSV file
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="import-list-name">List Name</Label>
                <Input 
                  id="import-list-name" 
                  placeholder="Imported Targets" 
                  value={newListData.name}
                  onChange={(e) => setNewListData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="import-list-description">Description (Optional)</Label>
                <Textarea 
                  id="import-list-description" 
                  placeholder="Targets imported from CSV" 
                  value={newListData.description}
                  onChange={(e) => setNewListData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="csv-file">CSV File</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="csv-file" 
                    type="file" 
                    accept=".csv" 
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  />
                  {csvFile && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => setCsvFile(null)}
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  CSV must include column for email (required), first name and last name (optional)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleImportList} disabled={isSubmitting || !csvFile}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  "Import List"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default TargetLists;
