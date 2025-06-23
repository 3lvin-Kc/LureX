
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Upload, Plus, Trash2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, { message: "List name is required" }),
  description: z.string().optional(),
});

const CreateTargetList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [targets, setTargets] = useState([{ email: "", firstName: "", lastName: "", department: "", position: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const addTarget = () => {
    setTargets([...targets, { email: "", firstName: "", lastName: "", department: "", position: "" }]);
  };

  const removeTarget = (index: number) => {
    setTargets(targets.filter((_, i) => i !== index));
  };

  const updateTarget = (index: number, field: string, value: string) => {
    const updatedTargets = targets.map((target, i) => 
      i === index ? { ...target, [field]: value } : target
    );
    setTargets(updatedTargets);
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Mock submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Target list created successfully",
      });
      navigate("/target-lists");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create target list",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const parsedTargets = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          return {
            email: values[headers.indexOf('email')] || '',
            firstName: values[headers.indexOf('first_name')] || '',
            lastName: values[headers.indexOf('last_name')] || '',
            department: values[headers.indexOf('department')] || '',
            position: values[headers.indexOf('position')] || '',
          };
        }).filter(target => target.email);

        setTargets(parsedTargets);
        toast({
          title: "CSV Imported",
          description: `${parsedTargets.length} targets imported successfully`,
        });
      };
      reader.readAsText(file);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate("/target-lists")}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Target Lists
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Target List</h1>
            <p className="text-muted-foreground">Create a new target list for your phishing campaigns</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>List Details</CardTitle>
              <CardDescription>Basic information about your target list</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>List Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter list name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description of this target list..."
                            className="h-20"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import Targets</CardTitle>
              <CardDescription>Upload a CSV file or manually add targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <Upload size={16} className="mr-2" />
                        Upload CSV
                      </span>
                    </Button>
                  </label>
                  <Button variant="outline" onClick={addTarget}>
                    <Plus size={16} className="mr-2" />
                    Add Target
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  CSV format: email, first_name, last_name, department, position
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Targets ({targets.length})</CardTitle>
              <CardDescription>Manage individual targets in your list</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {targets.map((target, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                    <Input
                      placeholder="Email"
                      value={target.email}
                      onChange={(e) => updateTarget(index, 'email', e.target.value)}
                    />
                    <Input
                      placeholder="First Name"
                      value={target.firstName}
                      onChange={(e) => updateTarget(index, 'firstName', e.target.value)}
                    />
                    <Input
                      placeholder="Last Name"
                      value={target.lastName}
                      onChange={(e) => updateTarget(index, 'lastName', e.target.value)}
                    />
                    <Input
                      placeholder="Department"
                      value={target.department}
                      onChange={(e) => updateTarget(index, 'department', e.target.value)}
                    />
                    <Input
                      placeholder="Position"
                      value={target.position}
                      onChange={(e) => updateTarget(index, 'position', e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeTarget(index)}
                      disabled={targets.length === 1}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate("/target-lists")}>
              Cancel
            </Button>
            <Button onClick={form.handleSubmit(handleSubmit)} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Target List"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateTargetList;
