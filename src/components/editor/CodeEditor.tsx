import React, { useCallback, useRef, useEffect } from "react";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { indentUnit } from "@codemirror/language";
import { useEditorStore } from "@/stores/editor-store";
import { useGenerationStore } from "@/stores/generation-store";
import { FileCode, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppData {
  projectName?: string;
  files?: Record<string, string>;
}

interface CodeEditorProps {
  appData: AppData | null;
  selectedFile: string;
  isBuilding: boolean;
  isCodeEditable: boolean;
  editorContent: string;
  onEditorChange: (value: string | undefined) => void;
}

export const CodeEditor = ({
  appData,
  selectedFile,
  isBuilding,
  isCodeEditable,
  editorContent,
  onEditorChange,
}: CodeEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView>();

  // Get streaming state from stores
  const streamingFilePath = useEditorStore((state) => state.streamingFilePath);
  const editorFiles = useEditorStore((state) => state.files);
  const displayContent = useEditorStore((state) => state.getDisplayContent());
  const generationStatus = useGenerationStore(
    (state) => state.generationStatus,
  );

  const isGenerating =
    generationStatus === "planning" || generationStatus === "generating";
  const isStreamingCurrentFile = streamingFilePath === selectedFile;

  // Determine what content to show
  const getContentToDisplay = useCallback(() => {
    // If we're streaming the currently selected file, show the streaming content
    if (isStreamingCurrentFile && streamingFilePath) {
      const streamingFile = editorFiles.get(streamingFilePath);
      if (streamingFile) {
        return streamingFile.content;
      }
    }

    // Otherwise show the regular editor content
    return editorContent;
  }, [isStreamingCurrentFile, streamingFilePath, editorFiles, editorContent]);

  const contentToDisplay = getContentToDisplay();

  const setupEditor = useCallback(() => {
    if (!editorRef.current || !selectedFile) return;

    // Don't setup if we're in building mode and not streaming
    if (isBuilding && !isStreamingCurrentFile) return;

    // Destroy existing editor if any
    if (viewRef.current) {
      viewRef.current.destroy();
    }

    const startState = EditorState.create({
      doc: contentToDisplay,
      extensions: [
        basicSetup,
        EditorView.theme({
          "&": {
            fontSize: "14px",
            fontFamily:
              'JetBrains Mono, Monaco, Consolas, "Courier New", monospace',
            backgroundColor: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            height: "100%",
          },
          ".cm-content": {
            padding: "16px",
          },
          ".cm-focused": {
            outline: "none",
          },
          ".cm-scroller": {
            overflow: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "hsl(var(--border)) transparent",
          },
          ".cm-scroller::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          ".cm-scroller::-webkit-scrollbar-track": {
            background: "transparent",
            borderRadius: "4px",
          },
          ".cm-scroller::-webkit-scrollbar-thumb": {
            background: "hsl(var(--border))",
            borderRadius: "4px",
            border: "2px solid transparent",
            backgroundClip: "content-box",
          },
          ".cm-scroller::-webkit-scrollbar-thumb:hover": {
            background: "hsl(var(--muted-foreground))",
            backgroundClip: "content-box",
          },
          // Highlight for streaming content
          ".cm-line": {
            transition: "background-color 0.1s ease",
          },
        }),
        EditorView.editable.of(isCodeEditable && !isStreamingCurrentFile),
        EditorState.tabSize.of(2),
        indentUnit.of("  "),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isStreamingCurrentFile) {
            const newContent = update.state.doc.toString();
            onEditorChange(newContent);
          }
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;
  }, [
    selectedFile,
    isBuilding,
    isStreamingCurrentFile,
    contentToDisplay,
    isCodeEditable,
    onEditorChange,
  ]);

  // Update editor content when it changes externally or from streaming
  const updateEditorContent = useCallback(() => {
    if (viewRef.current) {
      const currentContent = viewRef.current.state.doc.toString();
      if (currentContent !== contentToDisplay) {
        const scrollPos = viewRef.current.scrollDOM.scrollTop;

        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: contentToDisplay,
          },
        });

        // Auto-scroll to bottom when streaming
        if (isStreamingCurrentFile) {
          requestAnimationFrame(() => {
            if (viewRef.current) {
              const scrollDOM = viewRef.current.scrollDOM;
              scrollDOM.scrollTop = scrollDOM.scrollHeight;
            }
          });
        } else {
          // Preserve scroll position when not streaming
          viewRef.current.scrollDOM.scrollTop = scrollPos;
        }
      }
    }
  }, [contentToDisplay, isStreamingCurrentFile]);

  // Setup editor when dependencies change
  useEffect(() => {
    setupEditor();
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
      }
    };
  }, [setupEditor]);

  // Update content when it changes externally or from streaming
  useEffect(() => {
    updateEditorContent();
  }, [updateEditorContent]);

  // Get file info for streaming indicator
  const streamingFile = streamingFilePath
    ? editorFiles.get(streamingFilePath)
    : null;

  // Determine loading state message
  const getLoadingMessage = () => {
    if (isGenerating) {
      if (streamingFilePath) {
        const fileName = streamingFilePath.split("/").pop();
        return `Generating ${fileName}...`;
      }
      return "AI is generating code...";
    }
    if (isBuilding) {
      return "Building your app...";
    }
    return "Select a file to start coding";
  };

  // Show loading state when building but not actively streaming the selected file
  const showLoadingState =
    (isBuilding || isGenerating) &&
    !isStreamingCurrentFile &&
    !appData?.files?.[selectedFile];

  return (
    <div className="h-full relative">
      {/* Selection highlight bridge from file tree */}
      {selectedFile && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-primary/20 to-transparent z-10" />
      )}

      {/* Streaming indicator overlay */}
      {isStreamingCurrentFile && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
          <div className="relative">
            <FileCode className="w-4 h-4 text-blue-500" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
          </div>
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
            Streaming...
          </span>
          {streamingFile && (
            <span className="text-xs text-muted-foreground">
              {Math.round((streamingFile.size / 1024) * 10) / 10}KB
            </span>
          )}
        </div>
      )}

      {showLoadingState ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div
              className={cn(
                "mx-auto mb-4",
                isGenerating
                  ? "w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center"
                  : "",
              )}
            >
              {isGenerating ? (
                <Loader2 className="w-6 h-6 text-violet-600 dark:text-violet-400 animate-spin" />
              ) : (
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {getLoadingMessage()}
            </p>
            {isGenerating && streamingFilePath && (
              <p className="text-xs text-muted-foreground mt-2">
                Currently streaming:{" "}
                <span className="font-medium text-foreground">
                  {streamingFilePath.split("/").pop()}
                </span>
              </p>
            )}
          </div>
        </div>
      ) : selectedFile ? (
        <div
          ref={editorRef}
          className={cn(
            "h-full",
            isStreamingCurrentFile && "ring-2 ring-blue-500/20 rounded-lg",
          )}
        />
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <FileCode className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Select a file to view its contents
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
