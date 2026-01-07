import { ScrollArea } from "@/components/ui/scroll-area";
import { FileTree } from "./FileTree";
import { buildStructure } from "../helpers";
import { useEditorStore } from "@/stores/editor-store";

interface FileTreeExplorerProps {
  appData: { files?: Record<string, string> } | null;
  selectedFile: string;
  isBuilding: boolean;
  onFileSelect: (path: string) => void;
}

export const FileTreeExplorer = ({
  appData,
  selectedFile,
  isBuilding,
  onFileSelect,
}: FileTreeExplorerProps) => {
  // Get streaming state from editor store
  const streamingFilePath = useEditorStore((state) => state.streamingFilePath);
  const files = useEditorStore((state) => state.files);

  // Build file statuses map from editor store files
  const fileStatuses = new Map<
    string,
    "pending" | "streaming" | "complete" | "error"
  >();

  files.forEach((file, path) => {
    fileStatuses.set(path, file.status);
  });

  // Build file tree structure from appData
  const fileTree = appData ? buildStructure(appData.files || {}) : [];

  // If we have files from the editor store, merge them into the tree
  // This ensures newly generated files appear in the tree
  if (files.size > 0) {
    files.forEach((file, path) => {
      if (!appData?.files?.[path]) {
        // File exists in store but not in appData, add it to structure
        // This will be handled by the parent component syncing state
      }
    });
  }

  return (
    <div className="w-full h-full flex flex-col">
      <ScrollArea className="flex-1 scrollbar-premium">
        {isBuilding ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted-foreground">Generating files...</p>
          </div>
        ) : (
          <FileTree
            files={fileTree}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
            streamingFilePath={streamingFilePath}
            fileStatuses={fileStatuses}
          />
        )}
      </ScrollArea>
    </div>
  );
};
