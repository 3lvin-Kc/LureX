
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Users, FileUp, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { format } from "date-fns";

const TargetLists = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleDeleteList = async (id: string) => {
    try {
      const { error } = await supabase
        .from("target_lists")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Target list deleted successfully",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete target list",
        variant: "destructive",
      });
    }
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
              onClick={() => navigate("/targets/import")}
              className="flex items-center gap-2"
            >
              <FileUp size={16} />
              Import List
            </Button>
            <Button 
              onClick={() => navigate("/targets/new")}
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
                  onClick={() => navigate("/targets/new")}
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
      </div>
    </DashboardLayout>
  );
};

export default TargetLists;
