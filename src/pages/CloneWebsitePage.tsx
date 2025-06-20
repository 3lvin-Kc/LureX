
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowLeft, Globe, LoaderCircle } from "lucide-react";

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

    setIsCloning(true);
    try {
      // Mock cloning process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Website Cloned Successfully",
        description: `"${formData.name}" has been added to your phishing pages`,
      });
      
      navigate("/phishing-pages");
    } catch (error) {
      toast({
        title: "Cloning Failed",
        description: "Failed to clone the website. Please try again.",
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
                </SelectContent>
              </Select>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ Important Notes</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Only clone websites you have permission to use for testing</li>
                <li>• This is for authorized phishing simulations only</li>
                <li>• The cloned page will be modified to include tracking capabilities</li>
                <li>• Some interactive elements may not function identically</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/phishing-pages")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleClone}
                disabled={isCloning}
                className="flex-1"
              >
                {isCloning && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                {isCloning ? "Cloning..." : "Clone Website"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CloneWebsitePage;
