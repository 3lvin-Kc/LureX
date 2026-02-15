import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Smartphone, Palette } from "lucide-react";
import { PreviewPanel } from "@/components/PreviewPanel";



// Define GitHub Light theme


interface MainEditorPanelProps {
  selectedFile?: string;
  isCodeEditable?: boolean;
  previewCode?: string;
  onPreviewLoad?: (success: boolean) => void;
  setIsCodeEditable?: (editable: boolean) => void;
}

export const MainEditorPanel = ({
  selectedFile = '',
  isCodeEditable = true,
  previewCode,
  onPreviewLoad,
  setIsCodeEditable
}: MainEditorPanelProps) => {

  return (
    <div className="h-full flex flex-col glass-panel">
      <Tabs defaultValue="code" className="h-full flex flex-col">
        <div className="h-10 border-b px-3 flex items-center justify-between bg-background/50">
          <TabsList className="h-7 bg-muted/50">
            <TabsTrigger value="code" className="text-xs h-6 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Palette className="w-3 h-3 mr-1" />
              Canvas
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs h-6 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Smartphone className="w-3 h-3 mr-1" />
              Preview
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-4">
            {selectedFile && (
              <span className="text-sm text-muted-foreground font-mono">{selectedFile}</span>
            )}
            
            {setIsCodeEditable && (
              <div className="flex items-center gap-2">
                <Label htmlFor="editable-toggle" className="text-xs">
                  Edit
                </Label>
                <Switch
                  id="editable-toggle"
                  checked={isCodeEditable}
                  onCheckedChange={setIsCodeEditable}
                />
              </div>
            )}
          </div>
        </div>

        <TabsContent value="code" className="flex-1 m-0">
        </TabsContent>

        <TabsContent value="preview" className="flex-1 m-0">
          <PreviewPanel 
            code={previewCode || ''}
            onPreviewLoad={onPreviewLoad}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};