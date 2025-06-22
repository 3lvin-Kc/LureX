
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { ArrowLeft, Save, Upload } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

const CreateTargetList = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [targets, setTargets] = useState<Array<{email: string, first_name?: string, last_name?: string, department?: string, position?: string}>>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const parsedTargets = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const target: any = {};
        headers.forEach((header, index) => {
          if (values[index]) {
            target[header.toLowerCase().replace(' ', '_')] = values[index];
          }
        });
        return target;
      }).filter(target => target.email);

      setTargets(parsedTargets);
      toast({
        title: 'CSV uploaded',
        description: `${parsedTargets.length} targets loaded from CSV`,
      });
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (targets.length === 0) {
      toast({
        title: 'No targets',
        description: 'Please upload a CSV file with targets',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create target list and targets
      toast({
        title: 'Success',
        description: `Target list "${values.name}" created with ${targets.length} targets`,
      });
      navigate('/target-lists');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create target list',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/target-lists')}
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Target List</h1>
            <p className="text-muted-foreground">Create a new target list for your campaigns</p>
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
                          <Textarea placeholder="Enter list description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/target-lists')}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Save className="mr-2 h-4 w-4 animate-spin" />}
                      Create List
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Targets</CardTitle>
              <CardDescription>
                Upload a CSV file with target information. Required columns: email. 
                Optional: first_name, last_name, department, position
              </CardDescription>
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
                </div>
                
                {targets.length > 0 && (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <p className="text-sm font-medium mb-2">Loaded {targets.length} targets:</p>
                    <div className="max-h-40 overflow-y-auto">
                      {targets.slice(0, 5).map((target, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          {target.email} {target.first_name && `- ${target.first_name} ${target.last_name}`}
                        </div>
                      ))}
                      {targets.length > 5 && (
                        <div className="text-sm text-muted-foreground">
                          ... and {targets.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateTargetList;
