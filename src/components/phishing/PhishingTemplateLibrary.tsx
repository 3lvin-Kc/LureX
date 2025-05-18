import React, { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { phishingTemplates, getUniqueCategories, getUniquePlatforms, searchTemplates } from "@/utils/phishingTemplateLibrary";
import { Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Memo-ized component to prevent unnecessary re-renders
const TemplatePreview = memo(({ template, onSelect }) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md cursor-pointer h-full flex flex-col">
      <div className="h-48 bg-gray-100 relative">
        {template.thumbnailUrl ? (
          <img
            src={template.thumbnailUrl}
            alt={template.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/assets/templates/placeholder-template.svg";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200">
            <span className="text-slate-500">{template.platform}</span>
          </div>
        )}
        <Badge className="absolute top-2 right-2">{template.category}</Badge>
      </div>
      <CardContent className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold line-clamp-1">{template.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{template.description}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <Button
          onClick={() => onSelect(template)}
          className="mt-auto"
          variant="secondary"
          size="sm"
        >
          Use Template
        </Button>
      </CardContent>
    </Card>
  );
});

TemplatePreview.displayName = 'TemplatePreview';

const TemplateDetails = memo(({ template, onUse, onClose }) => {
  const [activeTab, setActiveTab] = useState("preview");
  
  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{template.name}</DialogTitle>
        <DialogDescription>{template.description}</DialogDescription>
      </DialogHeader>

      {/* Use defaultValue to avoid controlled/uncontrolled component warnings */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="mb-4">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="css">CSS</TabsTrigger>
          <TabsTrigger value="js">JavaScript</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="border rounded-md">
          <div className="h-96 overflow-auto border rounded-md">
            <iframe
              srcDoc={`
                <html>
                  <head>
                    <style>${template.cssContent || ''}</style>
                  </head>
                  <body>
                    ${template.htmlContent}
                    <script>${template.jsContent || ''}</script>
                  </body>
                </html>
              `}
              title={`Preview of ${template.name}`}
              className="w-full h-full border-0"
              sandbox="allow-scripts"
            />
          </div>
        </TabsContent>

        <TabsContent value="html">
          <pre className="p-4 bg-gray-50 rounded border overflow-x-auto max-h-96 text-sm">
            <code>{template.htmlContent}</code>
          </pre>
        </TabsContent>

        <TabsContent value="css">
          <pre className="p-4 bg-gray-50 rounded border overflow-x-auto max-h-96 text-sm">
            <code>{template.cssContent || 'No CSS content'}</code>
          </pre>
        </TabsContent>

        <TabsContent value="js">
          <pre className="p-4 bg-gray-50 rounded border overflow-x-auto max-h-96 text-sm">
            <code>{template.jsContent || 'No JavaScript content'}</code>
          </pre>
        </TabsContent>
      </Tabs>

      <DialogFooter className="gap-2 mt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => onUse(template)}>
          Use This Template
        </Button>
      </DialogFooter>
    </DialogContent>
  );
});

TemplateDetails.displayName = 'TemplateDetails';

// Main component wrapped with memo to prevent unnecessary re-renders
const PhishingTemplateLibrary = ({ onSelect }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const categories = ["All", ...getUniqueCategories()];
  const platforms = ["All", ...getUniquePlatforms()];

  // Only re-run this effect when the dependencies change
  useEffect(() => {
    let results = phishingTemplates;
    
    // Apply search filter
    if (searchQuery.trim()) {
      results = searchTemplates(searchQuery);
    }
    
    // Apply category filter
    if (selectedCategory && selectedCategory !== "All") {
      results = results.filter((template) => template.category === selectedCategory);
    }
    
    // Apply platform filter
    if (selectedPlatform && selectedPlatform !== "All") {
      results = results.filter((template) => template.platform === selectedPlatform);
    }
    
    setFilteredTemplates(results);
  }, [searchQuery, selectedCategory, selectedPlatform]);

  // Initialize the filtered templates on component mount
  useEffect(() => {
    setFilteredTemplates(phishingTemplates);
  }, []);

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setIsDetailsOpen(true);
  };

  const handleUseTemplate = async (template) => {
    try {
      // If we have an onSelect prop, use it and don't create a new page
      if (onSelect) {
        onSelect(template);
        setIsDetailsOpen(false);
        return;
      }
      
      // Otherwise, create the phishing page from the template
      const { data, error } = await supabase.from("phishing_pages").insert([
        {
          name: template.name,
          category: template.category,
          html_content: template.htmlContent,
          css_content: template.cssContent || "",
          js_content: template.jsContent || "",
          is_custom: false,
          source_url: ""
        }
      ]).select();
      
      if (error) throw error;
      
      toast({
        title: "Template Applied",
        description: `${template.name} template has been added to your phishing pages`,
        variant: "default"
      });
      
      // Close the dialog and navigate
      setIsDetailsOpen(false);
      navigate("/phishing-pages");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create phishing page from template",
        variant: "destructive"
      });
      console.error("Error creating phishing page:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            size={18}
          />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <Select 
              value={selectedCategory} 
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Select 
            value={selectedPlatform} 
            onValueChange={setSelectedPlatform}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              {platforms.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <Search size={48} className="mx-auto text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplatePreview
              key={template.id}
              template={template}
              onSelect={handleTemplateClick}
            />
          ))}
        </div>
      )}
      
      <Dialog
        open={isDetailsOpen}
        onOpenChange={(open) => {
          // Only update state if it's different to avoid rendering loops
          if (isDetailsOpen !== open) {
            setIsDetailsOpen(open);
          }
        }}
      >
        {selectedTemplate && (
          <TemplateDetails
            template={selectedTemplate}
            onUse={handleUseTemplate}
            onClose={() => setIsDetailsOpen(false)}
          />
        )}
      </Dialog>
    </div>
  );
};

export default PhishingTemplateLibrary;
