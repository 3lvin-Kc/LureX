
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, RefreshCcw } from "lucide-react";

const PhishingPagePreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0); // Used to force iframe refresh

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("phishing_pages")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setPage(data);
      } catch (error) {
        toast({
          title: "Error loading page",
          description: error instanceof Error ? error.message : "Failed to load phishing page",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPage();
    }
  }, [id, toast]);

  // Combine HTML, CSS, and JS into a complete page
  const generatePreviewContent = () => {
    if (!page) return "";

    // Extract HTML content
    let content = page.html_content || "";

    // Add CSS if available
    if (page.css_content) {
      // Check if there's a head tag
      if (content.includes("</head>")) {
        content = content.replace(
          "</head>",
          `<style>${page.css_content}</style></head>`
        );
      } else if (content.includes("<head>")) {
        content = content.replace(
          "<head>",
          `<head><style>${page.css_content}</style>`
        );
      } else if (content.includes("<html>")) {
        content = content.replace(
          "<html>",
          `<html><head><style>${page.css_content}</style></head>`
        );
      } else {
        content = `<style>${page.css_content}</style>${content}`;
      }
    }

    // Add JavaScript if available
    if (page.js_content) {
      // Add script before </body> tag if it exists
      if (content.includes("</body>")) {
        content = content.replace(
          "</body>",
          `<script>${page.js_content}</script></body>`
        );
      } else {
        content = `${content}<script>${page.js_content}</script>`;
      }
    }

    return content;
  };

  const refreshPreview = () => {
    setIframeKey(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-7xl">
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
              <h1 className="text-3xl font-bold">
                {loading ? "Loading..." : page?.name}
              </h1>
              <p className="text-muted-foreground">Preview how your phishing page will appear to targets</p>
            </div>
            <Button
              variant="outline"
              onClick={refreshPreview}
              disabled={loading}
            >
              <RefreshCcw className="w-4 h-4 mr-2" /> Refresh Preview
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading phishing page preview...</div>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Page Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-gray-200 rounded-md overflow-hidden" style={{ height: "600px" }}>
                <iframe
                  key={iframeKey}
                  srcDoc={generatePreviewContent()}
                  title="Phishing Page Preview"
                  width="100%"
                  height="100%"
                  sandbox="allow-forms"
                  style={{ border: "none" }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PhishingPagePreview;
