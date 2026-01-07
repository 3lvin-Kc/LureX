import { CodeEditor } from "./CodeEditor";
import { EditorLayout } from "./EditorLayout";
import { FileTreeExplorer } from "../workspace/FileTreeExplorer";
import { F3AI } from "@/components/ai/F3-AI";
import { useGenerationStore } from "@/stores/generation-store";

interface AppData {
  projectName?: string;
  files?: Record<string, string>;
}

interface ResizableFeaturesProps {
  appData: AppData | null;
  selectedFile: string;
  isBuilding: boolean;
  showFileExplorer: boolean;
  showAIAssistant: boolean;
  isCodeEditable: boolean;
  editorContent: string;
  currentProject: Record<string, unknown> | null;
  onFileSelect: (path: string) => void;
  onCodeUpdate: (newAppData: AppData) => void;
  onProjectUpdate: (project: Record<string, unknown> | null) => void;
  onBuildComplete: () => void;
  onEditorChange: (value: string | undefined) => void;
  onTabChange?: (tab: "code" | "preview") => void;
}

export const ResizableFeatures = ({
  appData,
  selectedFile,
  isBuilding,
  showFileExplorer,
  showAIAssistant,
  isCodeEditable,
  editorContent,
  currentProject,
  onFileSelect,
  onCodeUpdate,
  onProjectUpdate,
  onBuildComplete,
  onEditorChange,
  onTabChange,
}: ResizableFeaturesProps) => {
  // Get generation status from store
  const generationStatus = useGenerationStore(
    (state) => state.generationStatus,
  );
  const isGenerating =
    generationStatus === "planning" || generationStatus === "generating";

  // Combine isBuilding with isGenerating for the loading state
  const isProcessing = isBuilding || isGenerating;

  return (
    <div className="flex-1 overflow-hidden flex">
      {/* Fixed AI Assistant Panel - Now on Left */}
      {showAIAssistant && (
        <div className="w-[30%] border-r">
          <F3AI />
        </div>
      )}

      {/* Main Editor Container */}
      <div
        className={`glass-panel ${showAIAssistant ? "w-[75%]" : "w-[85%]"} p-4`}
      >
        <EditorLayout
          selectedFile={selectedFile}
          isCodeEditable={isCodeEditable && !isProcessing}
          editorContent={editorContent}
          onTabChange={onTabChange}
          isProcessing={isProcessing}
        >
          <div className="h-full border-2 border-border rounded-lg overflow-hidden p-4">
            <div className="flex h-full">
              {/* File Explorer Container - reserves space even when hidden */}
              <div
                className={`${showFileExplorer ? "w-48" : "w-0"} transition-all duration-200 overflow-hidden`}
              >
                {showFileExplorer && (
                  <FileTreeExplorer
                    appData={appData}
                    selectedFile={selectedFile}
                    isBuilding={isProcessing}
                    onFileSelect={onFileSelect}
                  />
                )}
              </div>

              {/* Subtle divider between tree and editor - always present but only visible when file explorer is shown */}
              {showFileExplorer && (
                <div className="w-px bg-gradient-to-b from-transparent via-border/30 to-transparent" />
              )}

              <div className="flex-1">
                <CodeEditor
                  appData={appData}
                  selectedFile={selectedFile}
                  isBuilding={isProcessing}
                  isCodeEditable={isCodeEditable && !isProcessing}
                  editorContent={editorContent}
                  onEditorChange={onEditorChange}
                />
              </div>
            </div>
          </div>
        </EditorLayout>
      </div>
    </div>
  );
};
