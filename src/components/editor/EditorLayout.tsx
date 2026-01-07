import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { File, Smartphone, Loader2 } from "lucide-react";
import { PreviewPanel } from "./PreviewPanel";

interface EditorLayoutProps {
  selectedFile: string;
  isCodeEditable: boolean;
  editorContent?: string;
  onTabChange?: (tab: 'code' | 'preview') => void;
  isProcessing?: boolean;
  children: React.ReactNode; // This will be the CodeEditor component
}

export const EditorLayout = ({
  selectedFile,
  isCodeEditable,
  editorContent,
  onTabChange,
  isProcessing = false,
  children
}: EditorLayoutProps) => {
  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="preview" className="h-full flex flex-col" onValueChange={(value) => onTabChange?.(value as 'code' | 'preview')}>
        <div className="h-10 border-b px-3 flex items-center justify-between bg-background/50">
          <TabsList className="h-7 bg-muted/50">
           
            <TabsTrigger value="preview" className="text-xs h-6 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Smartphone className="w-3 h-3 mr-1" />
             
            </TabsTrigger>
             <TabsTrigger 
              value="code" 
              className="text-xs h-6 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Code (Generating...)
                </>
              ) : (
                <>
                  <File className="w-3 h-3 mr-1" />
                  code
                </>
              )}
            </TabsTrigger>
          </TabsList>
          
        </div>
        

        <TabsContent value="code" className="flex-1 m-0 p-8 h-full overflow-hidden">
          {children}
        </TabsContent>

        <TabsContent value="preview" className="flex-1 m-0 p-8">
          <PreviewPanel code={editorContent} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
