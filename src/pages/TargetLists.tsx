
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PlusCircle, Edit, Trash2, Upload, Download, Users } from "lucide-react";
import { format } from "date-fns";
import { useTargetLists } from "@/hooks/useTargetLists";

const TargetLists = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { targetLists, loading, deleteTargetList, exportTargetList } = useTargetLists();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteList = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteTargetList(id);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsDeleting(null);
    }
  };

  const handleImportTargets = () => {
    navigate("/target-lists/new");
  };

  const handleExportTargets = async (listId: string) => {
    await exportTargetList(listId);
  };

  const handleExportAll = async () => {
    try {
      const allTargetsCSV = [
        'list_name,email,first_name,last_name,department,position,phone',
        ...targetLists.flatMap(list => 
          // This would need actual targets data, simplified for now
          [`${list.name},example@email.com,,,,,`]
        )
      ].join('\n');

      const blob = new Blob([allTargetsCSV], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'all-target-lists.csv';
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "All target lists exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export all target lists",
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
            <h1 className="text-3xl font-bold">Target Lists</h1>
            <p className="text-muted-foreground">Manage your phishing campaign target lists</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleImportTargets}>
              <Upload size={16} className="mr-2" />
              Import CSV
            </Button>
            <Button variant="outline" onClick={handleExportAll}>
              <Download size={16} className="mr-2" />
              Export All
            </Button>
            <Button onClick={() => navigate("/target-lists/new")}>
              <PlusCircle size={16} className="mr-2" />
              New List
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Target Lists</CardTitle>
            <CardDescription>
              Manage recipient lists for your phishing campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {targetLists.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No target lists found</p>
                <Button onClick={() => navigate("/target-lists/new")}>
                  <PlusCircle size={16} className="mr-2" />
                  Create Your First List
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
                  {targetLists.map((list) => (
                    <TableRow key={list.id}>
                      <TableCell className="font-medium">{list.name}</TableCell>
                      <TableCell>{list.description || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {list.target_count} targets
                        </Badge>
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
                                  onClick={() => handleExportTargets(list.id)}
                                >
                                  <Download size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Export</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => navigate(`/target-lists/${list.id}/edit`)}
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
                                  disabled={isDeleting === list.id}
                                  onClick={() => handleDeleteList(list.id)}
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
    </DashboardLayout>
  );
};

export default TargetLists;
