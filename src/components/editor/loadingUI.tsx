import { EditorHeader } from "./EditorHeader";
import { EditorStatusBar } from "./EditorStatusBar";
import { ResizableFeatures } from "./ResizableFeatures";

interface AppData {
  projectName?: string;
  files?: Record<string, string>;
}

interface EditorPageLayoutProps {
  // Data
  appData: AppData | null;
  selectedFile: string;
  currentProject: Record<string, unknown> | null;

  // UI State
  loading: boolean;
  isBuilding: boolean;
  showFileExplorer: boolean;
  showAIAssistant: boolean;
  currentTab: "code" | "preview";
  isCodeEditable: boolean;
  editorContent: string;

  // Event Handlers
  onFileSelect: (file: string) => void;
  onCodeUpdate: (data: AppData) => void;
  onProjectUpdate: (project: Record<string, unknown> | null) => void;
  onBuildComplete: () => void;
  onEditorChange: (value: string | undefined) => void;
  onTabChange: (tab: "code" | "preview") => void;
  onDownload: () => void;
}

export const EditorPageLayout = ({
  appData,
  selectedFile,
  currentProject,
  loading,
  isBuilding,
  showFileExplorer,
  showAIAssistant,
  currentTab,
  isCodeEditable,
  editorContent,
  onFileSelect,
  onCodeUpdate,
  onProjectUpdate,
  onBuildComplete,
  onEditorChange,
  onTabChange,
  onDownload,
}: EditorPageLayoutProps) => {
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Initializing your Flutter development environment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <EditorHeader
        projectName={appData?.projectName || "New Flutter Project"}
        onDownload={onDownload}
        currentProject={currentProject}
      />

      <ResizableFeatures
        appData={appData}
        selectedFile={selectedFile}
        isBuilding={isBuilding}
        showFileExplorer={showFileExplorer && currentTab === "code"}
        showAIAssistant={showAIAssistant}
        isCodeEditable={isCodeEditable}
        editorContent={editorContent}
        currentProject={currentProject}
        onFileSelect={onFileSelect}
        onCodeUpdate={(newAppData) => {
          onCodeUpdate(newAppData);
        }}
        onProjectUpdate={onProjectUpdate}
        onBuildComplete={onBuildComplete}
        onEditorChange={onEditorChange}
        onTabChange={onTabChange}
      />

      <EditorStatusBar
        selectedFile={selectedFile}
        fileCount={appData?.files ? Object.keys(appData.files).length : 0}
      />
    </div>
  );
};
