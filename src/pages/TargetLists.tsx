
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

// Mock data for frontend-only implementation
const mockTargetLists = [
  {
    id: "1",
    name: "All Employees",
    description: "Complete employee directory",
    target_count: 245,
    created_at: "2024-01-15T09:00:00Z"
  },
  {
    id: "2", 
    name: "Finance Team",
    description: "Finance department staff",
    target_count: 28,
    created_at: "2024-01-20T09:00:00Z"
  },
  {
    id: "3",
    name: "IT Department",
    description: "Information Technology team",
    target_count: 15,
    created_at: "2024-02-01T09:00:00Z"
  }
];

const TargetLists = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [targetLists] = useState(mockTargetLists);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteList = async (id: string) => {
    setIsDeleting(id);
    try {
      // Mock deletion
      await new Promise(resolve => setTimeout(resolve, 1000));
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Target Lists</h1>
            <p className="text-muted-foreground">Manage recipient lists for your phishing campaigns</p>
          </div>
          <Button 
            onClick={() => navigate("/target-lists/new")}
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} />
            New Target List
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Target List Library</CardTitle>
            <CardDescription>
              Browse and manage your recipient lists for phishing campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {targetLists.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No target lists found</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/target-lists/new")}
                  className="flex items-center gap-2"
                >
                  <PlusCircle size={16} />
                  Create Target List
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Recipients</TableHead>
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
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <Users size={12} />
                          {list.target_count} recipients
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
