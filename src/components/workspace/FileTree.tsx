import { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileTreeProps {
  files: FileNode[];
  selectedFile: string;
  onFileSelect: (file: string) => void;
  streamingFilePath?: string | null;
  fileStatuses?: Map<string, "pending" | "streaming" | "complete" | "error">;
}

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  path?: string;
}

const FileStatusIcon = ({
  status,
  isStreaming,
}: {
  status?: "pending" | "streaming" | "complete" | "error";
  isStreaming?: boolean;
}) => {
  if (isStreaming || status === "streaming") {
    return (
      <Loader2 className="w-3 h-3 text-blue-500 animate-spin flex-shrink-0" />
    );
  }

  if (status === "complete") {
    return <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />;
  }

  if (status === "error") {
    return <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />;
  }

  if (status === "pending") {
    return (
      <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
    );
  }

  return null;
};

const FileTreeItem = ({
  node,
  depth = 0,
  selectedFile,
  onFileSelect,
  streamingFilePath,
  fileStatuses,
}: {
  node: FileNode;
  depth?: number;
  selectedFile: string;
  onFileSelect: (file: string) => void;
  streamingFilePath?: string | null;
  fileStatuses?: Map<string, "pending" | "streaming" | "complete" | "error">;
}) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);

  const handleClick = () => {
    if (node.type === "folder") {
      setIsExpanded(!isExpanded);
    } else if (node.path) {
      onFileSelect(node.path);
    }
  };

  const isSelected = node.path === selectedFile;
  const isStreaming = node.path === streamingFilePath;
  const fileStatus = node.path ? fileStatuses?.get(node.path) : undefined;

  // Auto-expand folder if it contains the streaming file
  useEffect(() => {
    if (
      node.type === "folder" &&
      streamingFilePath &&
      node.children?.some(
        (child) =>
          child.path === streamingFilePath ||
          (child.type === "folder" &&
            child.children?.some((gc) => gc.path === streamingFilePath)),
      )
    ) {
      setIsExpanded(true);
    }
  }, [streamingFilePath, node]);

  const getFileIcon = () => {
    if (node.type === "folder") {
      return isExpanded ? (
        <FolderOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
      ) : (
        <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
      );
    }

    // Determine file icon color based on status
    const iconClass = cn(
      "w-4 h-4 flex-shrink-0",
      isStreaming
        ? "text-blue-500"
        : fileStatus === "complete"
          ? "text-emerald-500"
          : fileStatus === "error"
            ? "text-red-500"
            : "text-muted-foreground",
    );

    return <File className={iconClass} />;
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent text-xs group relative transition-colors duration-150",
          isSelected && "bg-accent text-accent-foreground font-medium",
          isStreaming &&
            "bg-blue-50 dark:bg-blue-950/30 border-l-2 border-blue-500",
        )}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
        onClick={handleClick}
      >
        {/* Selection highlight bridge */}
        {isSelected && (
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-primary/20 to-transparent -mr-2 z-10" />
        )}

        {/* Streaming pulse effect */}
        {isStreaming && (
          <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
        )}

        <div className="flex items-center gap-2 flex-1 min-w-0">
          {node.type === "folder" ? (
            <>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              {getFileIcon()}
            </>
          ) : (
            <>
              <div className="w-4" />
              {getFileIcon()}
            </>
          )}

          <span
            className={cn(
              "truncate",
              isStreaming && "text-blue-700 dark:text-blue-300 font-medium",
            )}
          >
            {node.name}
          </span>

          {/* Status indicator for files */}
          {node.type === "file" && (
            <FileStatusIcon status={fileStatus} isStreaming={isStreaming} />
          )}
        </div>
      </div>

      {node.type === "folder" && isExpanded && node.children && (
        <div>
          {node.children.map((child, index) => (
            <FileTreeItem
              key={child.path || `${child.name}-${index}`}
              node={child}
              depth={depth + 1}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
              streamingFilePath={streamingFilePath}
              fileStatuses={fileStatuses}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileTree = ({
  files,
  selectedFile,
  onFileSelect,
  streamingFilePath,
  fileStatuses,
}: FileTreeProps) => {
  if (!files || files.length === 0) {
    return (
      <div className="py-8 text-center">
        <File className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">No files yet</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      {files.map((node, index) => (
        <FileTreeItem
          key={node.path || `${node.name}-${index}`}
          node={node}
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
          streamingFilePath={streamingFilePath}
          fileStatuses={fileStatuses}
        />
      ))}
    </div>
  );
};
