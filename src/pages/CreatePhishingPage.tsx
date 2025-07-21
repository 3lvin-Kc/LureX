import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { usePhishingPages } from '@/hooks/usePhishingPages';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { ArrowLeft, Save } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().optional(),
  html_content: z.string().min(1, 'HTML content is required'),
  css_content: z.string().optional(),
  js_content: z.string().optional(),
});

const CreatePhishingPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createPhishingPage, refetchPhishingPages } = usePhishingPages();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      html_content: '',
      css_content: '',
      js_content: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await createPhishingPage({
        name: values.name,
        category: values.category,
        html_content: values.html_content,
        css_content: values.css_content,
        js_content: values.js_content,
        is_custom: true,
      });
      await refetchPhishingPages();
      navigate('/phishing-pages');
    } catch (error) {
      // Error handling is done in the hook
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
            onClick={() => navigate('/phishing-pages')}
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Phishing Page</h1>
            <p className="text-muted-foreground">Create a custom phishing page for your campaigns</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Page Details</CardTitle>
            <CardDescription>Configure your custom phishing page</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Page Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter page name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="banking">Banking</SelectItem>
                            <SelectItem value="social-media">Social Media</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="corporate">Corporate</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="html_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTML Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your HTML content here..."
                          className="min-h-40 font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="css_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CSS Content (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your CSS content here..."
                          className="min-h-32 font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="js_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>JavaScript Content (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your JavaScript content here..."
                          className="min-h-32 font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/phishing-pages')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Save className="mr-2 h-4 w-4 animate-spin" />}
                    Create Page
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreatePhishingPage;
