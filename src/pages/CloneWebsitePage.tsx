
import React, { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import CloneWebsiteWarning from "@/components/phishing/CloneWebsiteWarning";

const CloneWebsitePage = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const navigate = useNavigate();

  const handleClone = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL to clone",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const fetchedHtml = await response.text();
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
