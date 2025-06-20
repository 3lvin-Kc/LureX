
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, RefreshCcw } from "lucide-react";

// Mock data for phishing pages
const mockPhishingPages = [
  {
    id: "1",
    name: "Login Page Clone",
    category: "Banking",
    html_content: "<form><input type='email' placeholder='Email'><input type='password' placeholder='Password'><button>Login</button></form>",
    css_content: "body { font-family: Arial; }",
    js_content: "console.log('Mock phishing page');",
    created_at: "2024-01-01T00:00:00Z"
  }
];

const PhishingPagePreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [previewContent, setPreviewContent] = useState("");

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        // Mock data fetch
        const foundPage = mockPhishingPages.find(p => p.id === id);
        if (!foundPage) {
          throw new Error("Page not found");
        }
        
        setPage(foundPage);
        
        if (foundPage) {
          const content = generatePreviewContent(foundPage);
          setPreviewContent(content);
        }
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
  const generatePreviewContent = (pageData: any) => {
    if (!pageData) return "";

    // Extract HTML content
    let content = pageData.html_content || "";
    
    // Ensure we have a proper HTML structure
    if (!content.includes("<html")) {
      content = `<html><head></head><body>${content}</body></html>`;
    }

    // Add base tag to handle relative paths correctly
    if (content.includes("<head>")) {
      content = content.replace(
        "<head>",
        `<head><base target="_blank">`
      );
    } else if (content.includes("<html>")) {
      content = content.replace(
        "<html>",
        `<html><head><base target="_blank"></head>`
      );
    }

    // Add CSS if available
    if (pageData.css_content) {
      // Check if there's a head tag
      if (content.includes("</head>")) {
        content = content.replace(
          "</head>",
          `<style>${pageData.css_content}</style></head>`
        );
      } else if (content.includes("<head>")) {
        content = content.replace(
          "<head>",
          `<head><style>${pageData.css_content}</style>`
        );
      } else if (content.includes("<html>")) {
        content = content.replace(
          "<html>",
          `<html><head><style>${pageData.css_content}</style></head>`
        );
      } else {
        content = `<style>${pageData.css_content}</style>${content}`;
      }
    }

    // Add JavaScript if available
    if (pageData.js_content) {
      // Add script before </body> tag if it exists
      if (content.includes("</body>")) {
        content = content.replace(
          "</body>",
          `<script>${pageData.js_content}</script></body>`
        );
      } else {
        content = `${content}<script>${pageData.js_content}</script>`;
      }
    }

    // Add a dummy form handler
    const formHandler = `
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const forms = document.querySelectorAll('form');
          forms.forEach(form => {
            form.addEventListener('submit', function(e) {
              e.preventDefault();
              const formData = new FormData(form);
              const formValues = {};
              
              for (let [key, value] of formData.entries()) {
                formValues[key] = value;
              }
              
              console.log('Form submitted:', formValues);
              alert('Phishing simulation complete! Form data captured for training purposes.');
              return false;
            });
          });
        });
      </script>
    `;

    if (content.includes("</body>")) {
      content = content.replace("</body>", `${formHandler}</body>`);
    } else {
      content = `${content}${formHandler}`;
    }

    return content;
  };

  const refreshPreview = () => {
    if (page) {
      const content = generatePreviewContent(page);
      setPreviewContent(content);
    }
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
                  srcDoc={previewContent}
                  title="Phishing Page Preview"
                  width="100%"
                  height="100%"
                  sandbox="allow-forms allow-scripts"
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
