import React, { useState, useEffect } from "react";
import { Brain, Sparkles, Layout } from "lucide-react";
import { cn } from "@/lib/utils";

// Narration message component with typing effect
const NarrationMessage = React.memo(
  ({
    message,
    type,
    timestamp,
    isLatest,
  }: {
    message: string;
    type: "thinking" | "narration" | "plan";
    timestamp: Date;
    isLatest: boolean;
  }) => {
    const [displayedText, setDisplayedText] = useState(message);
    const [isTyping, setIsTyping] = useState(isLatest);

    useEffect(() => {
      // Only run the typing effect if this is the latest message and it's still typing.
      if (!isLatest || !isTyping) {
        // If it's not the latest, or typing is done, ensure full message is shown.
        setDisplayedText(message);
        setIsTyping(false);
        return;
      }

      setDisplayedText(""); // Start with a blank slate
      let index = 0;
      const interval = setInterval(() => {
        if (index <= message.length) {
          setDisplayedText(message.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false); // Typing is complete
        }
      }, 15);

      return () => clearInterval(interval);
      // The dependency array is critical. It only re-runs if the message content itself changes.
      // `isLatest` is intentionally omitted to prevent re-triggering on every parent render.
    }, [message]);

  const colorMap = {
    thinking: {
      accent: "bg-purple-500",
      text: "text-purple-500",
      muted: "text-purple-500/70",
    },
    narration: {
      accent: "bg-blue-500", 
      text: "text-blue-500",
      muted: "text-blue-500/70",
    },
    plan: {
      accent: "bg-emerald-500",
      text: "text-emerald-500", 
      muted: "text-emerald-500/70",
    },
  };

  return (
    <div className="flex items-start gap-3">
      <div className={`w-1 h-1 rounded-full mt-2 ${colorMap[type].accent}`}></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-mono text-foreground leading-relaxed">
          {displayedText}
          {isTyping && (
            <span className="inline-block w-1.5 h-4 bg-current ml-0.5 animate-pulse" />
          )}
        </p>
      </div>
    </div>
  );
}
);

// Thinking indicator
const ThinkingIndicator = ({ message }: { message: string }) => (
  <div className="space-y-1">
    <div className="flex items-start gap-3">
      <div className="w-1 h-1 rounded-full mt-2 bg-purple-500"></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-mono text-foreground leading-relaxed">
          {message}
        </p>
        <div className="flex gap-0.5 mt-1">
          <span
            className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"
            style={{ animationDelay: "200ms" }}
          />
          <span
            className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"
            style={{ animationDelay: "400ms" }}
          />
        </div>
      </div>
    </div>
  </div>
);

export { NarrationMessage, ThinkingIndicator };