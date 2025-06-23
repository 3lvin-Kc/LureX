
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Globe, LoaderCircle } from "lucide-react";

interface CloneWebsiteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CloneWebsiteModal = ({ open, onOpenChange, onSuccess }: CloneWebsiteModalProps) => {
  const { toast } = useToast();
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
      
      onSuccess();
      onOpenChange(false);
      setFormData({ url: "", name: "", category: "" });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Clone Website
          </DialogTitle>
          <DialogDescription>
            Create a phishing page by cloning an existing website
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Page Name</Label>
            <Input
              id="name"
              placeholder="Enter a name for this phishing page"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Only clone websites you have permission to use for authorized testing purposes.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CloneWebsiteModal;
