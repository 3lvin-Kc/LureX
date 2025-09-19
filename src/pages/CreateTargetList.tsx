
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
import { useTargetLists } from "@/hooks/useTargetLists";

const formSchema = z.object({
  name: z.string().min(1, { message: "List name is required" }),
  description: z.string().optional(),
});

const CreateTargetList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createTargetList } = useTargetLists();
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
      const validTargets = targets.filter(target => target.email.trim() !== '');
      
      if (validTargets.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one target with a valid email address",
          variant: "destructive",
        });
        return;
      }

      await createTargetList(
        {
          name: values.name,
          description: values.description || null,
        },
        validTargets.map(target => ({
          email: target.email,
          first_name: target.firstName || null,
          last_name: target.lastName || null,
          department: target.department || null,
          position: target.position || null,
        }))
      );
      
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
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => navigate("/target-lists")}
                className="hover:bg-accent/50 transition-all duration-200 border-border/50 hover:border-border shadow-sm mb-4"
              >
                <ArrowLeft size={16} />
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Create Target List</h1>
                <p className="text-muted-foreground">Create a new target list for your phishing campaigns</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 mt-8">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                  id="csv-upload-header"
                />
                <label htmlFor="csv-upload-header">
                  <Button 
                    variant="outline" 
                    className="cursor-pointer hover:bg-accent/50 transition-all duration-200 border-border/50 hover:border-border shadow-sm" 
                    asChild
                  >
                    <span>
                      <Upload size={16} className="mr-2" />
                      Upload CSV
                    </span>
                  </Button>
                </label>
                <Button 
                  variant="outline" 
                  onClick={addTarget}
                  className="hover:bg-accent/50 transition-all duration-200 border-border/50 hover:border-border shadow-sm"
                >
                  <Plus size={16} className="mr-2" />
                  Add Target
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                CSV format: email, first_name, last_name, department, position
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">List Details</h2>
              <p className="text-muted-foreground">Basic information about your target list</p>
            </div>
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
          </div>


          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Targets ({targets.length})</h2>
              <p className="text-muted-foreground">Manage individual targets in your list</p>
            </div>
            <div className="space-y-4">
              {targets.map((target, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-border/30 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors duration-200">
                  <Input
                    placeholder="Email"
                    value={target.email}
                    onChange={(e) => updateTarget(index, 'email', e.target.value)}
                    className="border-border/50 focus:border-primary transition-colors duration-200"
                  />
                  <Input
                    placeholder="First Name"
                    value={target.firstName}
                    onChange={(e) => updateTarget(index, 'firstName', e.target.value)}
                    className="border-border/50 focus:border-primary transition-colors duration-200"
                  />
                  <Input
                    placeholder="Last Name"
                    value={target.lastName}
                    onChange={(e) => updateTarget(index, 'lastName', e.target.value)}
                    className="border-border/50 focus:border-primary transition-colors duration-200"
                  />
                  <Input
                    placeholder="Department"
                    value={target.department}
                    onChange={(e) => updateTarget(index, 'department', e.target.value)}
                    className="border-border/50 focus:border-primary transition-colors duration-200"
                  />
                  <Input
                    placeholder="Position"
                    value={target.position}
                    onChange={(e) => updateTarget(index, 'position', e.target.value)}
                    className="border-border/50 focus:border-primary transition-colors duration-200"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTarget(index)}
                    disabled={targets.length === 1}
                    className="h-10 w-10 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button 
              variant="outline" 
              onClick={() => navigate("/target-lists")}
              className="hover:bg-muted/50 transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={form.handleSubmit(handleSubmit)} 
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Target List"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateTargetList;
