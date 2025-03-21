
import React, { useState } from "react";
import { PlusCircle, Shield, UserPlus, Users, Trash2, Edit, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { format } from "date-fns";

const AdminPanel = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  
  // Mock users data
  const [users] = useState([
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Admin",
      department: "IT Security",
      last_login: "2023-06-10T15:30:45",
      status: "Active"
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Operator",
      department: "HR",
      last_login: "2023-06-09T11:20:15",
      status: "Active"
    },
    {
      id: "3",
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      role: "Viewer",
      department: "Finance",
      last_login: "2023-06-08T09:45:30",
      status: "Active"
    },
    {
      id: "4",
      name: "Emily Williams",
      email: "emily.williams@example.com",
      role: "Operator",
      department: "Marketing",
      last_login: "2023-06-05T14:10:22",
      status: "Inactive"
    }
  ]);

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Viewer",
    department: "",
    isAdmin: false
  });

  const handleAddUser = () => {
    // Would normally add to database here
    toast({
      title: "User Added",
      description: `${newUser.name} has been added successfully.`
    });
    setAddUserOpen(false);
    setNewUser({
      name: "",
      email: "",
      role: "Viewer",
      department: "",
      isAdmin: false
    });
  };

  const renderUsersTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Users size={16} />
            Bulk Import
          </Button>
        </div>
        <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
          <DialogTrigger asChild>
            <Button 
              className="flex items-center gap-2"
            >
              <UserPlus size={16} />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Add a new user to the phishing platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input 
                  id="department" 
                  value={newUser.department}
                  onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select 
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="Admin">Admin</option>
                  <option value="Operator">Operator</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is-admin" 
                  checked={newUser.isAdmin}
                  onCheckedChange={(checked) => setNewUser({...newUser, isAdmin: checked})}
                />
                <Label htmlFor="is-admin">Administrator Access</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddUserOpen(false)}>Cancel</Button>
              <Button onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={
                      user.role === "Admin" ? "destructive" :
                      user.role === "Operator" ? "default" : "secondary"
                    }>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>{format(new Date(user.last_login), "MMM d, yyyy HH:mm")}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "Active" ? "success" : "outline"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                toast({
                                  title: "Edit User",
                                  description: "User edit functionality coming soon"
                                });
                              }}
                            >
                              <Edit size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit User</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                toast({
                                  title: "Reset API Key",
                                  description: "API key reset functionality coming soon"
                                });
                              }}
                            >
                              <Key size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Reset API Key</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                toast({
                                  title: "User Deleted",
                                  description: `${user.name} has been deleted successfully`
                                });
                              }}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete User</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage users and system settings</p>
          </div>
        </div>

        <Tabs 
          defaultValue="users" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="users" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="audit-log" className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Audit Log
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            {renderUsersTab()}
          </TabsContent>
          
          <TabsContent value="permissions">
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Permission management coming soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="audit-log">
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Audit log functionality coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
