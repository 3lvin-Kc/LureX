
import React, { useState } from "react";
import { PlusCircle, Users, Edit, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { format } from "date-fns";
import { useTargetLists } from "@/hooks/useTargetLists";

const TargetLists = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { targetLists, loading, deleteTargetList } = useTargetLists();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteList = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteTargetList(id);
      toast({
        title: "Target list deleted",
        description: "The target list has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error deleting target list",
        description: "Failed to delete the target list",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Target Lists</h1>
            <p className="text-muted-foreground text-lg">Manage recipient lists for your phishing campaigns</p>
          </div>
          <Button 
            onClick={() => navigate("/target-lists/new")}
            className="flex items-center gap-2 h-10 px-4 bg-primary hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <PlusCircle size={16} />
            New Target List
          </Button>
        </div>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-xl font-semibold">Target List Library</CardTitle>
            <CardDescription className="text-base">
              Browse and manage your recipient lists for phishing campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : targetLists.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="mx-auto w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-muted-foreground/60" />
                </div>
                <p className="text-muted-foreground text-lg mb-2">No target lists found</p>
                <p className="text-muted-foreground/70 text-sm mb-8">Create your first target list to get started</p>
                <Button 
                  onClick={() => navigate("/target-lists/new")}
                  className="flex items-center gap-2 h-10 px-4 bg-primary hover:bg-primary/90 transition-all duration-200"
                >
                  <PlusCircle size={16} />
                  Create Target List
                </Button>
              </div>
            ) : (
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-muted/30">
                      <TableHead className="font-semibold text-foreground/90 py-4">Name</TableHead>
                      <TableHead className="font-semibold text-foreground/90">Description</TableHead>
                      <TableHead className="font-semibold text-foreground/90">Recipients</TableHead>
                      <TableHead className="font-semibold text-foreground/90">Created</TableHead>
                      <TableHead className="text-right font-semibold text-foreground/90">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {targetLists.map((list) => (
                      <TableRow 
                        key={list.id}
                        className="border-border/30 hover:bg-muted/20 transition-colors duration-200"
                      >
                        <TableCell className="font-medium py-4 text-foreground">{list.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {list.description || <span className="text-muted-foreground/50">—</span>}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className="flex items-center gap-1 w-fit border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors duration-200"
                          >
                            <Users size={12} />
                            {list.target_count} recipients
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(list.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={isDeleting === list.id}
                                    onClick={() => handleDeleteList(list.id)}
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
    </DashboardLayout>
  );
};

export default TargetLists;
