import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEditorStore } from "@/stores/editor-store";
import { useGenerationStore } from "@/stores/generation-store";

interface AppData {
  projectName?: string;
  files?: Record<string, string>;
}

export const useEffectsAndLogic = (
  searchParams: URLSearchParams,
  refreshProjectState: (projectId: string | null) => Promise<void>,
  streamingFilePath: string | null,
  isGenerating: boolean,
  setSelectedFile: (file: string) => void,
  setCurrentTab: (tab: "code" | "preview") => void,
  generationStatus: string,
  generatedFiles: Map<any, any>,
  setAppData: React.Dispatch<React.SetStateAction<AppData>>,
  editorFiles: Map<any, any>,
  appData: AppData | undefined,
  selectedFile: string,
  setEditorContent: (content: string) => void,
  projectState: any,
  updateProjectState: (update: any) => Promise<void>,
  executeGatekeeping: (projectId: string | null, userInput: string, isZeroToOneRequest: boolean) => Promise<any>,
  mode: string,
  setIsCodeEditable: (editable: boolean) => void,
  error: string | null,
  setIsBuilding: (building: boolean) => void
) => {
  const handleBuildComplete = () => {
    setIsBuilding(false);
  };

  // Load project files from storage on mount
  const hasLoadedFilesRef = useRef(false);
  
  useEffect(() => {
    const loadProjectFiles = async () => {
      const projectId = searchParams.get("project");
      if (!projectId || hasLoadedFilesRef.current) return;
      
      try {
        // Check if we have an active session first
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        console.log(`[useEffectsAndLogic] Loading files for project ${projectId}...`);

        // Fetch artifacts for this project
        const response = await fetch(`/api/artifacts/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          console.log("[useEffectsAndLogic] No artifacts found or error fetching");
          return;
        }

        const data = await response.json();
        
        if (data.artifacts?.length > 0) {
          hasLoadedFilesRef.current = true;
          console.log(`[useEffectsAndLogic] Loading ${data.artifacts.length} files from storage`);
          
          // Load each file's content
          const newFiles: Record<string, string> = {};
          
          for (const artifact of data.artifacts) {
            try {
              const fileResponse = await fetch(
                `/api/artifacts/${projectId}/file/${encodeURIComponent(artifact.file_path)}`,
                {
                  headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                  },
                }
              );
              
              if (fileResponse.ok) {
                const fileData = await fileResponse.json();
                if (fileData.content) {
                  newFiles[artifact.file_path] = fileData.content;
                }
              }
            } catch (err) {
              console.error(`[useEffectsAndLogic] Failed to load file ${artifact.file_path}:`, err);
            }
          }
          
          if (Object.keys(newFiles).length > 0) {
            // Update appData
            setAppData((prev: AppData) => ({
              ...prev,
              files: { ...prev.files, ...newFiles },
            }));
            
            // =========================================================================
            // Also populate the editor store so file tree shows correctly
            // =========================================================================
            const editorStore = useEditorStore.getState();
            Object.entries(newFiles).forEach(([path, content]) => {
              editorStore.addFile(path, 'complete');
              editorStore.setFileComplete(path, content);
            });
            // =========================================================================
            
            // Prefer lib/main.dart as the first file, otherwise pick the first available
            const firstFile = Object.keys(newFiles).find(f => f === 'lib/main.dart') 
              || Object.keys(newFiles)[0];
            if (firstFile) {
              setSelectedFile(firstFile);
            }
            
            console.log(`[useEffectsAndLogic] Loaded ${Object.keys(newFiles).length} files successfully`);
            toast.success(`Loaded ${Object.keys(newFiles).length} files from storage`);
          }
        }
      } catch (error) {
        console.error("[useEffectsAndLogic] Failed to load project files:", error);
      }
    };
    
    loadProjectFiles();
  }, [searchParams, setAppData, setSelectedFile]);

  // =========================================================================
  // Load chat history on mount
  // =========================================================================
  const hasLoadedChatRef = useRef(false);
  
  useEffect(() => {
    const loadChatHistory = async () => {
      const projectId = searchParams.get("project");
      if (!projectId || hasLoadedChatRef.current) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        console.log(`[useEffectsAndLogic] Loading chat history for project ${projectId}...`);

        const response = await fetch(`/api/conversations/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'x-user-id': session.user.id
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.conversation?.messages?.length > 0) {
            hasLoadedChatRef.current = true;
            console.log(`[useEffectsAndLogic] Loading ${data.conversation.messages.length} chat messages`);
            useGenerationStore.getState().loadChatHistory(data.conversation.messages);
          }
        }
      } catch (e) {
        console.error("[useEffectsAndLogic] Failed to load chat history:", e);
      }
    };

    loadChatHistory();
  }, [searchParams]);

  // Check project state when component mounts
  useEffect(() => {
    if (searchParams.get("project")) {
      refreshProjectState(searchParams.get("project"));
    } else {
      refreshProjectState(null);
    }
  }, [searchParams, refreshProjectState]);

  // Track previous streaming file to avoid re-selecting
  const prevStreamingFileRef = useRef<string | null>(null);

  // Auto-select streaming file when generation starts
  useEffect(() => {
    if (
      streamingFilePath &&
      isGenerating &&
      streamingFilePath !== prevStreamingFileRef.current
    ) {
      prevStreamingFileRef.current = streamingFilePath;
      setSelectedFile(streamingFilePath);
      setCurrentTab("code");
    } else if (!isGenerating) {
      prevStreamingFileRef.current = null;
    }
  }, [streamingFilePath, isGenerating, setSelectedFile, setCurrentTab]);

  // Track if we've already synced files for this generation
  const hasSyncedRef = useRef(false);

  // Sync generated files to appData when generation completes
  useEffect(() => {
    if (
      generationStatus === "complete" &&
      generatedFiles.size > 0 &&
      !hasSyncedRef.current
    ) {
      hasSyncedRef.current = true;

      setAppData((prev: AppData) => {
        const newFiles: Record<string, string> = { ...(prev.files || {}) };

        generatedFiles.forEach((file, path) => {
          if (file.status === "complete") {
            newFiles[path] = file.content;
          }
        });

        return {
          ...prev,
          files: newFiles,
        };
      });

      toast.success(`Generated ${generatedFiles.size} files successfully!`);
    } else if (generationStatus === "idle" || generationStatus === "planning") {
      hasSyncedRef.current = false;
    }
  }, [generationStatus, generatedFiles, setAppData]);

  // Sync editor files only when a file completes - use a ref to track synced files
  const syncedFilesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (editorFiles.size === 0) {
      syncedFilesRef.current.clear();
      return;
    }

    let hasNewFiles = false;
    const newSyncedFiles = new Set(syncedFilesRef.current);

    editorFiles.forEach((file, path) => {
      if (file.status === "complete" && !syncedFilesRef.current.has(path)) {
        newSyncedFiles.add(path);
        hasNewFiles = true;
      }
    });

    if (hasNewFiles) {
      syncedFilesRef.current = newSyncedFiles;

      setAppData((prev: AppData) => {
        const newFiles: Record<string, string> = { ...(prev.files || {}) };
        let changed = false;

        editorFiles.forEach((file, path) => {
          if (
            file.status === "complete" &&
            file.content &&
            newFiles[path] !== file.content
          ) {
            newFiles[path] = file.content;
            changed = true;
          }
        });

        return changed ? { ...prev, files: newFiles } : prev;
      });
    }
  }, [editorFiles, setAppData]);

  // Update editor content when file changes - debounce streaming updates
  const lastContentRef = useRef<string>("");

  useEffect(() => {
    if (appData && selectedFile) {
      // First check if file is being streamed
      const streamingFile = editorFiles.get(selectedFile);
      let newContent: string;

      if (streamingFile && streamingFile.status === "streaming") {
        newContent = streamingFile.content;
      } else {
        newContent = appData.files?.[selectedFile] || "";
      }

      // Only update if content actually changed
      if (newContent !== lastContentRef.current) {
        lastContentRef.current = newContent;
        setEditorContent(newContent);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile, appData?.files, editorFiles, setEditorContent]);

  // Editor change handler
  const handleEditorChange = async (value: string | undefined) => {
    if (value === undefined) return;

    // Don't allow edits while generating
    if (isGenerating) {
      return;
    }

    // Check if the change is allowed based on the current mode
    if (projectState && projectState.mode_locked === "ZERO_TO_ONE") {
      // For zero-to-one mode, we may want to validate differently
      // For now, just proceed with the change
      setEditorContent(value);
      if (appData && selectedFile) {
        setAppData({
          ...appData,
          files: {
            ...appData.files,
            [selectedFile]: value,
          },
        });

        // Update the project state to reflect that we now have content
        if (value.trim().length > 0) {
          await updateProjectState({
            artifact_count: projectState.artifact_count + 1,
            has_config: true,
            architecture_decisions_recorded: true,
          });
        }
      }
    } else {
      // For one-to-n mode, check if the change is allowed
      const gatekeepingResult = await executeGatekeeping(
        projectState?.project_id || null,
        "update code",
        false, // This is not a zero-to-one request
      );

      if (gatekeepingResult && gatekeepingResult.allowed) {
        setEditorContent(value);
        if (appData && selectedFile) {
          setAppData({
            ...appData,
            files: {
              ...appData.files,
              [selectedFile]: value,
            },
          });
        }
      } else {
        toast.error(
          gatekeepingResult?.reason || "Operation not allowed in current mode",
        );
      }
    }
  };

  // Handle mode-specific restrictions
  useEffect(() => {
    if (mode === "ZERO_TO_ONE") {
      setIsCodeEditable(!isGenerating); // Allow editing in zero-to-one mode unless generating
    } else if (mode === "ONE_TO_N") {
      setIsCodeEditable(!isGenerating); // Allow editing in one-to-n mode unless generating
    }
  }, [mode, isGenerating, setIsCodeEditable]);

  // Show error if there's a project state error
  useEffect(() => {
    if (error) {
      toast.error(`Project state error: ${error}`);
    }
  }, [error]);

  return {
    handleBuildComplete,
    handleEditorChange,
  };
};