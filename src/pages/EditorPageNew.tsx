import { useState, useCallback, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MainEditorPanel } from "@/components/editor/MainEditorPanel";
import { EditorHeader } from "@/components/EditorHeader";
import { EditorStatusBar } from "@/components/EditorStatusBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { AIAssistantPanel } from "@/components/editor/AIAssistantPanel";

const EditorPageNew = () => {
  // UI State
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [isCodeEditable, setIsCodeEditable] = useState(true);
  const [editorContent, setEditorContent] = useState('// Welcome to the editor!\n// Select a file to start editing.');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Preview State
  const [previewCode, setPreviewCode] = useState<string>('');

  // Project State - Initialize with empty project
  const [files, setFiles] = useState<Map<string, any>>(new Map());
  const [projectName, setProjectName] = useState<string>('Untitled Project');
  const [projectStructure] = useState({ name: '', path: '', type: 'folder', children: [] });

  // Initialize with empty content
  useEffect(() => {
    // No initial file to load when project is empty
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
      const fileData = files.get(selectedFile);
      setHasUnsavedChanges(value !== (fileData?.content || ''));
    }
  };

  const saveCurrentFile = async (): Promise<void> => {
    if (selectedFile) {
      console.log(`File "${selectedFile}" would be saved here.`);
      setHasUnsavedChanges(false);
    }
  };

  const shouldShowFileExplorer = () => {
    return showFileExplorer && files.size > 0;
  };

  // Convert files Map to object structure
  const projectFiles = Object.fromEntries(files);

  // Handle file selection from file tree
  const handleFileSelect = (filePath: string) => {
    const fileData = files.get(filePath);
    if (fileData) {
      setSelectedFile(filePath);
      setEditorContent(fileData.content);
      setHasUnsavedChanges(false);
    }
  };

  const handlePreviewLoad = useCallback((success: boolean) => {
    console.log('Preview load status:', success);
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="h-screen bg-background flex flex-col w-full">
        <EditorHeader
          projectName={projectName}
          showFileExplorer={shouldShowFileExplorer()}
          onToggleFileExplorer={() => setShowFileExplorer(!showFileExplorer)}
        />

        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* AI Assistant Panel - Resizable */}
            <ResizablePanel defaultSize={25} minSize={15} maxSize={40} className="border-r">
              <AIAssistantPanel showAIAssistant={true} />
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            {/* Main Content with Fixed File Tree */}
            <ResizablePanel defaultSize={75} minSize={60}>
              <div className="h-full flex">
                {/* Main Content Area */}
                <div className="flex-1">
                  <MainEditorPanel
                    selectedFile={selectedFile}
                    isCodeEditable={isCodeEditable}
                    previewCode={previewCode}
                    onPreviewLoad={handlePreviewLoad}
                    setIsCodeEditable={setIsCodeEditable}
                  />
                </div>

                {/* Fixed Width File Explorer - Only show when files exist */}
                {shouldShowFileExplorer() && (
                  <div className="w-80 h-full glass-panel border-l flex-shrink-0">
                    <div className="h-10 px-4 border-b flex items-center justify-between bg-background/50">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">Files</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {files.size || 0} files
                      </div>
                    </div>
                    <ScrollArea className="h-[calc(100%-2.5rem)] px-1 py-1">
                      <div className="p-4 text-center text-muted-foreground">
                        <p>No files to display</p>
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        <EditorStatusBar 
          selectedFile={selectedFile}
          fileCount={files.size}
          showFileExplorer={shouldShowFileExplorer()}
          hasFiles={files.size > 0}
          onToggleFileExplorer={() => setShowFileExplorer(!showFileExplorer)}
        />
      </div>
    </SidebarProvider>
  );
};

export default EditorPageNew;