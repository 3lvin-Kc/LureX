
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Globe, LoaderCircle, AlertTriangle } from "lucide-react";
import { phishingPageService } from "@/utils/phishingPageService";

const CloneWebsitePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCloning, setIsCloning] = useState(false);
  const [formData, setFormData] = useState({
    url: "",
    name: "",
    category: "",
  });

  const handleClone = async () => {
    if (!formData.url || !formData.name) {
      toast({
        title: "Missing Information",
        description: "Please provide both URL and page name",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    try {
      new URL(formData.url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., https://example.com)",
        variant: "destructive",
      });
      return;
    }

    setIsCloning(true);
    try {
      await phishingPageService.cloneWebsite(
        formData.url,
        formData.name,
        formData.category || undefined
      );
      
      toast({
        title: "Website Cloned Successfully",
        description: `"${formData.name}" has been added to your phishing pages`,
      });
      
      navigate("/phishing-pages");
    } catch (error: any) {
      console.error("Cloning error:", error);
      toast({
        title: "Cloning Failed",
        description: error.message || "Failed to clone the website. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/phishing-pages")}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Phishing Pages
          </Button>
          <h1 className="text-3xl font-bold">Clone Website</h1>
          <p className="text-muted-foreground">Create a phishing page by cloning an existing website</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Website Cloning
            </CardTitle>
            <CardDescription>
              Enter the URL of the website you want to clone for your phishing simulation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Page Name</Label>
              <Input
                id="name"
                placeholder="Enter a name for this phishing page"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Banking">Banking</SelectItem>
                  <SelectItem value="Social">Social Media</SelectItem>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                  <SelectItem value="Cloud">Cloud Services</SelectItem>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Cloned">Cloned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Legal & Ethical Guidelines
              </h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Only clone websites you have explicit permission to use for testing</li>
                <li>• This tool is for authorized phishing simulations only</li>
                <li>• The cloned page will include tracking capabilities for metrics</li>
                <li>• Some dynamic elements may require manual adjustment</li>
                <li>• Ensure compliance with your organization's security policies</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/phishing-pages")}
                className="flex-1"
                disabled={isCloning}
              >
                Cancel
              </Button>
              <Button
                onClick={handleClone}
                disabled={isCloning}
                className="flex-1"
              >
                {isCloning && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                {isCloning ? "Cloning Website..." : "Clone Website"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CloneWebsitePage;
