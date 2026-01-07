import { useState } from "react";
import { useProjectState } from "../../contexts/ProjectStateContext";
import { useEditorStore } from "@/stores/editor-store";
import { useGenerationStore } from "@/stores/generation-store";

interface AppData {
  projectName?: string;
  files?: Record<string, string>;
}

export const useStateManagement = () => {
  const {
    projectState,
    mode,
    isLoading,
    error,
    executeGatekeeping,
    updateProjectState,
    refreshProjectState,
  } = useProjectState();

  // Get streaming state from stores
  const streamingFilePath = useEditorStore((state) => state.streamingFilePath);
  const editorFiles = useEditorStore((state) => state.files);
  const generationStatus = useGenerationStore(
    (state) => state.generationStatus,
  );
  const generatedFiles = useGenerationStore((state) => state.files);

  const isGenerating =
    generationStatus === "planning" || generationStatus === "generating";

  const [appData, setAppData] = useState<AppData>({
    projectName: "Flutter Demo",
    files: {},
  });
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [currentTab, setCurrentTab] = useState<"code" | "preview">("code");
  const [isBuilding, setIsBuilding] = useState(false);
  const [isCodeEditable, setIsCodeEditable] = useState(true);
  const [editorContent, setEditorContent] = useState("");
  const [currentProject, setCurrentProject] = useState<Record<
    string,
    unknown
  > | null>(null);

  return {
    // Project state
    projectState,
    mode,
    isLoading,
    error,
    executeGatekeeping,
    updateProjectState,
    refreshProjectState,
    
    // Generation state
    isGenerating,
    streamingFilePath,
    generationStatus,
    generatedFiles,
    editorFiles,
    
    // App data
    appData,
    selectedFile,
    loading,
    showFileExplorer,
    showAIAssistant,
    currentTab,
    isBuilding,
    isCodeEditable,
    editorContent,
    currentProject,
    
    // Setters
    setAppData,
    setSelectedFile,
    setLoading,
    setShowFileExplorer,
    setShowAIAssistant,
    setCurrentTab,
    setIsBuilding,
    setIsCodeEditable,
    setEditorContent,
    setCurrentProject,
  };
};
