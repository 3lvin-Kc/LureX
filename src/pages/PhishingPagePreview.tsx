
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Edit, LoaderCircle } from "lucide-react";

// Mock data - same as in PhishingPages
const mockPhishingPages = [
  {
    id: "1",
    name: "Login Page Clone",
    category: "Banking",
    html_content: "<form><input type='email' placeholder='Email'><input type='password' placeholder='Password'><button>Login</button></form>",
    css_content: "body { font-family: Arial; }",
    js_content: "console.log('Mock phishing page');",
    is_custom: false,
    source_url: "https://example.com",
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Office 365 Login",
    category: "Corporate",
    html_content: "<div style='font-family: Segoe UI;'><h2>Sign in</h2><form><input type='email' placeholder='Email'><input type='password' placeholder='Password'><button>Sign in</button></form></div>",
    css_content: "body { background: #f5f5f5; }",
    js_content: "",
    is_custom: true,
    source_url: "",
    created_at: "2024-01-02T00:00:00Z"
  }
];

const PhishingPagePreview = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const foundPage = mockPhishingPages.find(p => p.id === id);
      if (foundPage) {
        setPage(foundPage);
      } else {
        toast({
          title: "Page not found",
          description: "The requested phishing page could not be found",
          variant: "destructive"
        });
        navigate("/phishing-pages");
      }
    }
    setLoading(false);
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 max-w-6xl">
          <div className="flex justify-center items-center h-64">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!page) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 max-w-6xl">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Page not found</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/phishing-pages")}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Pages
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{page.name}</h1>
              <p className="text-muted-foreground">Preview of your phishing page</p>
            </div>
            <Button
              onClick={() => navigate(`/phishing-pages/${id}/edit`)}
              className="flex items-center gap-2"
            >
              <Edit size={16} />
              Edit Page
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Page Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg bg-white">
              <iframe
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <style>${page.css_content || ''}</style>
                    </head>
                    <body>
                      ${page.html_content}
                      <script>${page.js_content || ''}</script>
                    </body>
                  </html>
                `}
                className="w-full h-96 border-0"
                title="Page Preview"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PhishingPagePreview;
