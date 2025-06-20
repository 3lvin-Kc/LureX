
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

// Mock data for target lists
const mockTargetLists = [
  {
    id: "1",
    name: "All Employees",
    description: "Complete employee directory",
    target_count: 150,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "2", 
    name: "Marketing Team",
    description: "Marketing department staff",
    target_count: 25,
    created_at: "2024-01-20T14:30:00Z",
    updated_at: "2024-01-20T14:30:00Z"
  }
];

const TargetLists = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [targetLists, setTargetLists] = useState(mockTargetLists);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteList = async (id: string) => {
    setIsDeleting(id);
    try {
      // Mock deletion
      setTargetLists(prev => prev.filter(list => list.id !== id));
      toast({
        title: "List deleted",
        description: "Target list has been deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error deleting list",
        description: "Failed to delete target list",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleImportTargets = () => {
    toast({
      title: "Import not implemented",
      description: "CSV import functionality is not yet available",
      variant: "destructive"
    });
  };

  const handleExportTargets = () => {
    toast({
      title: "Export not implemented", 
      description: "CSV export functionality is not yet available",
      variant: "destructive"
    });
  };

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
            <Button variant="outline" onClick={handleExportTargets}>
              <Download size={16} className="mr-2" />
              Export
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
