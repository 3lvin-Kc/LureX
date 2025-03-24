import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import CloneWebsiteWarning from "@/components/phishing/CloneWebsiteWarning";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DOMPurify from "dompurify";

const CloneWebsitePage = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to use this feature",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
        if (!session) {
          navigate("/auth");
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  const isValidUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const handleClone = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL to clone",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid http:// or https:// URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const fetchedHtml = await response.text();
      
      console.log(`Website cloned: ${url} at ${new Date().toISOString()}`);
      
      setHtml(fetchedHtml);
      setShowPreview(true);
    } catch (error) {
      console.error("Error cloning website:", error);
      setError("Failed to clone website. Please try again or use a different URL.");
      toast({
        title: "Error",
        description: "Failed to clone website. Please try a different URL.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPage = () => {
    navigate("/phishing-pages/new");
  };

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 max-w-5xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You must be logged in to access this page.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <CloneWebsiteWarning 
        open={showWarning}
        onOpenChange={setShowWarning}
        onProceed={() => setShowWarning(false)}
        onCancel={handleNewPage}
      />

      <div className="container mx-auto p-4 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Clone Website</h1>
          <p className="text-muted-foreground">
            Enter a URL to clone its HTML content.
          </p>
        </div>

        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Beta Feature</AlertTitle>
          <AlertDescription>
            This feature is currently in beta and may not work as expected. For better results, 
            consider using the New Page option to create a custom phishing page.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Website URL</CardTitle>
            <CardDescription>
              Enter the URL of the website you want to clone.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL
              </Label>
              <Input
                id="url"
                className="col-span-3"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <Button onClick={handleClone} disabled={isLoading}>
              {isLoading ? "Cloning..." : "Clone Website"}
            </Button>
            {error && <p className="text-red-500">{error}</p>}
          </CardContent>
        </Card>

        {showPreview && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Cloned HTML Content</CardTitle>
              <CardDescription>
                Review the cloned HTML content before saving.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Textarea
                value={html}
                className="min-h-[300px]"
                readOnly
              />
              <Button onClick={() => navigate("/phishing-pages/new", { state: { html } })}>
                Use this HTML
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CloneWebsitePage;
