
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Mail, CreditCard, Cloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PhishingTemplate {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  htmlContent: string;
  cssContent?: string | null;
  jsContent?: string | null;
  previewImage?: string;
}

interface PhishingTemplateLibraryProps {
  onSelect: (template: PhishingTemplate) => void;
}

const mockTemplates: PhishingTemplate[] = [
  {
    id: "1",
    name: "Bank Login Page",
    category: "Banking",
    description: "Generic bank login form that looks authentic",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ddd;">
        <h2>Secure Login</h2>
        <form>
          <div style="margin-bottom: 15px;">
            <label>Username:</label>
            <input type="text" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc;">
          </div>
          <div style="margin-bottom: 15px;">
            <label>Password:</label>
            <input type="password" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc;">
          </div>
          <button type="submit" style="width: 100%; padding: 10px; background: #007cba; color: white; border: none;">Login</button>
        </form>
      </div>
    `,
    cssContent: "body { background-color: #f5f5f5; }"
  },
  {
    id: "2",
    name: "Office 365 Login",
    category: "Corporate",
    description: "Microsoft Office 365 login page replica",
    htmlContent: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 440px; margin: 100px auto; padding: 44px; background: white; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA4IiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMTA4IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDgiIGhlaWdodD0iMjQiIGZpbGw9IiNmZjYwMDAiLz48L3N2Zz4=" alt="Microsoft" style="margin-bottom: 24px;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">Sign in</h1>
        <p style="margin-bottom: 24px; color: #323130;">to continue to Office</p>
        <form>
          <input type="email" placeholder="Email, phone, or Skype" style="width: 100%; padding: 8px 12px; margin-bottom: 16px; border: 1px solid #605e5c; font-size: 15px;">
          <button type="submit" style="background: #0078d4; color: white; border: none; padding: 8px 12px; width: 100%; font-size: 15px;">Next</button>
        </form>
      </div>
    `
  }
];

const PhishingTemplateLibrary: React.FC<PhishingTemplateLibraryProps> = ({ onSelect }) => {
  const [templates, setTemplates] = useState<PhishingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('phishing_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTemplates: PhishingTemplate[] = data.map(page => ({
        id: page.id,
        name: page.name,
        category: page.category,
        description: page.category,
        htmlContent: page.html_content,
        cssContent: page.css_content,
        jsContent: page.js_content
      }));

      // Add mock templates for initial functionality
      setTemplates([...mockTemplates, ...formattedTemplates]);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error loading templates",
        description: "Using default templates only",
        variant: "destructive",
      });
      setTemplates(mockTemplates);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string | null) => {
    switch (category) {
      case 'Banking': return <CreditCard size={16} />;
      case 'Corporate': return <Mail size={16} />;
      case 'Cloud': return <Cloud size={16} />;
      default: return <Globe size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
              <Badge variant="outline" className="flex items-center gap-1">
                {getCategoryIcon(template.category)}
                {template.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{template.description || 'No description available'}</p>
            <div className="border rounded-md p-2 mb-4 bg-gray-50 max-h-32 overflow-hidden">
              <div 
                className="text-xs transform scale-75 origin-top-left"
                dangerouslySetInnerHTML={{ __html: template.htmlContent }}
              />
            </div>
            <Button 
              onClick={() => onSelect(template)}
              className="w-full"
              size="sm"
            >
              Use Template
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PhishingTemplateLibrary;
