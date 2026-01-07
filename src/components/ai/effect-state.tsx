import { useCallback, useEffect, useRef } from "react";
import { useCodeGeneration } from "@/hooks/useCodeGeneration";
import { useGenerationStore } from "@/stores/generation-store";
import { supabase } from "@/integrations/supabase/client";

export const useChatEffects = (
  scrollContainerRef: React.RefObject<HTMLDivElement>,
  narrations: any[],
  currentThinking: string | null,
  plan: any,
  isComplete: boolean,
  hasError: boolean,
  startTime: number | null,
  setStartTime: (time: number | null) => void
) => {
  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
    // Using JSON.stringify on `plan` creates a stable primitive dependency
    // that only changes when the plan's content changes.
  }, [narrations.length, currentThinking, JSON.stringify(plan)]);

  // Clear start time on completion or error
  useEffect(() => {
    if (isComplete || hasError) {
      setStartTime(null);
    }
  }, [isComplete, hasError]);

  const duration = isComplete && startTime ? Date.now() - startTime : 0;

  return { duration };
};

export const useChatHandlers = (
  inputValue: string,
  isConnected: boolean,
  isGenerating: boolean,
  startTime: number | null,
  setStartTime: (time: number | null) => void,
  setInputValue: (value: string) => void,
  startGeneration: (projectId: string, prompt: string) => void,
  reset: () => void,
  reconnect: () => void
) => {
  const addUserMessage = useGenerationStore((state) => state.addUserMessage);

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || !isConnected || isGenerating) return;

    const projectId =
      new URLSearchParams(window.location.search).get("project") || "";
    if (!projectId) {
      console.error("No project ID available");
      return;
    }

    // Add user message to store before starting generation
    addUserMessage(inputValue.trim());
    
    startGeneration(projectId, inputValue.trim());
    setInputValue("");
    setStartTime(Date.now());
  }, [inputValue, isConnected, isGenerating, startGeneration, setInputValue, setStartTime, addUserMessage]);

  // Auto-start generation if prompt is in URL
  const hasAutoStartedRef = useRef(false);
  const isCheckingArtifactsRef = useRef(false);
  
  const handleAutoStart = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("project");
    const prompt = urlParams.get("prompt");

    if (projectId && prompt && !isGenerating && isConnected && !hasAutoStartedRef.current && !isCheckingArtifactsRef.current) {
      isCheckingArtifactsRef.current = true;
      
      // =========================================================================
      // ZERO_TO_ONE ENFORCEMENT: Check if project already has artifacts
      // If artifacts exist, do NOT auto-start generation
      // =========================================================================
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("[AutoStart] Checking if project already has artifacts...");
          const response = await fetch(`/api/artifacts/${projectId}`, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.artifactCount > 0 || (data.artifacts && data.artifacts.length > 0)) {
              console.log(`[AutoStart] Project already has ${data.artifactCount || data.artifacts?.length} artifacts. Skipping auto-start.`);
              hasAutoStartedRef.current = true;
              isCheckingArtifactsRef.current = false;
              
              // Remove prompt from URL to prevent future auto-start attempts
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete("prompt");
              window.history.replaceState({}, "", newUrl.toString());
              return;
            }
          }
        }
      } catch (e) {
        console.log("[AutoStart] Could not check artifacts, proceeding with generation");
      }
      // =========================================================================
      
      hasAutoStartedRef.current = true;
      isCheckingArtifactsRef.current = false;
      const decodedPrompt = decodeURIComponent(prompt);
      
      // Add user message for the initial prompt
      addUserMessage(decodedPrompt);
      
      setInputValue(decodedPrompt);
      
      // Remove prompt from URL after starting generation to prevent re-runs on refresh
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("prompt");
      window.history.replaceState({}, "", newUrl.toString());
      
      setTimeout(() => {
        startGeneration(projectId, decodedPrompt);
        setStartTime(Date.now());
      }, 100); // Small delay to ensure UI updates
    }
  }, [isGenerating, isConnected, startGeneration, setInputValue, setStartTime, addUserMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleRetry = useCallback(() => {
    reset();
    setStartTime(null);
  }, [reset, setStartTime]);

  const handleReconnect = useCallback(() => {
    reconnect();
  }, [reconnect]);

  return { 
    handleSend, 
    handleKeyDown, 
    handleRetry, 
    handleReconnect,
    handleAutoStart
  };
};