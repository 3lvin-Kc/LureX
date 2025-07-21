
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Edit, LoaderCircle } from "lucide-react";
import { usePhishingPages } from "@/hooks/usePhishingPages";

const PhishingPagePreview = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { phishingPages, loading } = usePhishingPages();
  const [page, setPage] = useState<any>(null);

  useEffect(() => {
    if (id && phishingPages.length > 0) {
      const foundPage = phishingPages.find(p => p.id === id);
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
  }, [id, phishingPages, navigate, toast]);

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
