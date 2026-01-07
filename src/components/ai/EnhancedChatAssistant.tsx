import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Send,
  Sparkles,
  Brain,
  FileCode,
  CheckCircle2,
  XCircle,
  Loader2,
  Zap,
  Layout,
  Component,
  StopCircle,
  WifiOff,
  RefreshCw,
  User,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useCodeGeneration } from "@/hooks/useCodeGeneration";
import { useGenerationStore } from "@/stores/generation-store";
import { NarrationMessage, ThinkingIndicator } from "@/components/chat/narration";
import { PlanDisplay, FileStreamingStatus } from "@/components/chat/plan-display";
import { ConnectionStatus, GenerationComplete } from "@/components/chat/helpers";
import { GenerationError } from "@/components/chat/error-display";
import { useChatEffects, useChatHandlers } from "./effect-state";
import { InputField } from "./inputfield";

import { cn } from "@/lib/utils";

// User message component
const UserMessageBubble = ({ content }: { content: string }) => (
  <div className="flex justify-end mb-4">
    <div className="flex items-start gap-2 max-w-[85%]">
      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <User className="w-4 h-4 text-primary" />
      </div>
    </div>
  </div>
);

export const EnhancedChatAssistant = () => {
  const [inputValue, setInputValue] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  const userMessages = useGenerationStore((state) => state.userMessages);

  const {
    connectionStatus,
    isConnected,
    reconnect,
    generationStatus,
    isGenerating,
    isComplete,
    hasError,
    startGeneration,
    cancelGeneration,
    reset,
    narrations,
    currentThinking,
    plan,
    progress,
    error,
    streamingFilePath,
    fileCount,
  } = useCodeGeneration();

  const { duration } = useChatEffects(
    scrollContainerRef,
    narrations,
    currentThinking,
    plan,
    isComplete,
    hasError,
    startTime,
    setStartTime
  );

  const {
    handleSend,
    handleKeyDown,
    handleRetry,
    handleReconnect,
    handleAutoStart,
  } = useChatHandlers(
    inputValue,
    isConnected,
    isGenerating,
    startTime,
    setStartTime,
    setInputValue,
    startGeneration,
    reset,
    reconnect
  );

  // Auto-start generation if prompt is in URL
  useEffect(() => {
    if (isConnected && !isGenerating) {
      handleAutoStart();
    }
  }, [isConnected, isGenerating, handleAutoStart]);

  // Interleave user messages with narrations for display
  const renderChatMessages = () => {
    // For now, show user message first, then all narrations
    // This creates a simple flow: user asks -> AI responds
    return (
      <>
        {/* User messages */}
        {userMessages.map((msg) => (
          <UserMessageBubble key={msg.id} content={msg.content} />
        ))}

        {/* AI Narration messages */}
        {narrations.length > 0 && (
          <div className="mb-6">
            {narrations.map((narration, index) => {
              const isLatest = index === narrations.length - 1 && !currentThinking;
              return (
                <NarrationMessage
                  key={narration.id}
                  message={narration.message}
                  type={narration.type}
                  timestamp={narration.timestamp}
                  isLatest={isLatest}
                />
              );
            })}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      
      {/* Content Area - simple div with overflow-auto instead of ScrollArea */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto p-4">
        <ConnectionStatus
          status={connectionStatus}
          onReconnect={handleReconnect}
        />

        {/* Empty state */}
        {generationStatus === "idle" && narrations.length === 0 && userMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-violet-600 dark:text-violet-400" />
            </div>
            <h4 className="font-semibold mb-2">Describe Your Flutter App</h4>
            <p className="text-sm text-muted-foreground max-w-xs">
              Tell me what you want to build and I'll generate the Flutter code
              for you in real-time.
            </p>
          </div>
        )}

        {/* Chat messages (user + AI) */}
        {renderChatMessages()}

        {/* Current thinking state */}
        {currentThinking && <ThinkingIndicator message={currentThinking} />}

        {/* Plan display */}
        {plan && <PlanDisplay plan={plan} />}

        {/* File streaming progress - removed for cleaner UI */}
        {isGenerating && <FileStreamingStatus />}

        {/* Generation complete - removed for cleaner UI */}
        {isComplete && <GenerationComplete />}

        {/* Error state */}
        {hasError && error && (
          <GenerationError error={error} onRetry={handleRetry} />
        )}
      </div>

      <InputField
        inputValue={inputValue}
        isConnected={isConnected}
        isGenerating={isGenerating}
        setInputValue={setInputValue}
        handleKeyDown={handleKeyDown}
        handleSend={handleSend}
        handleCancel={cancelGeneration}
      />
    </div>
  );
};
