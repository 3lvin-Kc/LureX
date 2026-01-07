// Editor page - Integrated with backend Zero-to-One Mode Detection & Hard Boundary Layer

import { useState, useEffect, useCallback, useRef } from "react";
import { EditorPageLayout } from "@/components/editor/loadingUI";
import { useSearchParams } from "react-router-dom";
import { useStateManagement } from "@/components/editor/statemng";
import { useEffectsAndLogic } from "@/components/editor/usestate";
import { toast } from "sonner";

interface AppData {
  projectName?: string;
  files?: Record<string, string>;
}

const EditorPage = () => {
  const [searchParams] = useSearchParams();

  const stateManagement = useStateManagement();
  const {
    projectState,
    mode,
    isLoading,
    error,
    executeGatekeeping,
    updateProjectState,
    refreshProjectState,
    isGenerating,
    streamingFilePath,
    generationStatus,
    generatedFiles,
    editorFiles,
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
  } = stateManagement;

  const { handleBuildComplete, handleEditorChange } = useEffectsAndLogic(
    searchParams,
    refreshProjectState,
    streamingFilePath,
    isGenerating,
    setSelectedFile,
    setCurrentTab,
    generationStatus,
    generatedFiles,
    setAppData,
    editorFiles,
    appData,
    selectedFile,
    setEditorContent,
    projectState,
    updateProjectState,
    executeGatekeeping,
    mode,
    setIsCodeEditable,
    error,
    setIsBuilding
  );

  return (
    <EditorPageLayout
      // Data
      appData={appData}
      selectedFile={selectedFile}
      currentProject={currentProject}
      // UI State
      loading={loading}
      isBuilding={isBuilding || isGenerating}
      showFileExplorer={showFileExplorer}
      showAIAssistant={showAIAssistant}
      currentTab={currentTab}
      isCodeEditable={isCodeEditable && !isGenerating}
      editorContent={editorContent}
      // Event Handlers
      onFileSelect={setSelectedFile}
      onCodeUpdate={setAppData}
      onProjectUpdate={setCurrentProject}
      onBuildComplete={handleBuildComplete}
      onEditorChange={handleEditorChange}
      onTabChange={setCurrentTab}
      onDownload={() => {}}
    />
  );
};

export default EditorPage;
