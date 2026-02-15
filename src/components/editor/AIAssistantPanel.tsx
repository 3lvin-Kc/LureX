import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AIAssistantPanelProps {
  showAIAssistant: boolean;
}

export const AIAssistantPanel = ({ showAIAssistant }: AIAssistantPanelProps) => {
  const [input, setInput] = useState("");
  
  if (!showAIAssistant) return null;

  const handleSend = () => {
    if (input.trim()) {
      console.log("AI Assistant input:", input);
      setInput("");
    }
  };

  return (
    <div className="w-full h-full flex flex-col min-w-0">
      <div className="h-10 px-3 border-b flex items-center bg-sidebar flex-shrink-0">
        <Loader2 className="w-4 h-4 text-primary mr-2 flex-shrink-0 animate-spin" />
        <span className="text-sm font-medium truncate">AI Assistant</span>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 p-4">
        <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground px-2">
          <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 mb-3 opacity-50 flex-shrink-0 animate-spin" />
          <p className="text-xs sm:text-sm mb-1 font-medium break-words">work in progress</p>
          <p className="text-xs break-words">The backend has been removed, so the AI assistant is no longer available.</p>
        </div>
        
        {/* Input Section */}
        <div className="mt-auto pt-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI to help with your Flutter code..."
              className="min-h-[80px] resize-none text-sm"
              disabled
            />
            <Button 
              size="sm" 
              onClick={handleSend}
              disabled={!input.trim()}
              className="self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            AI assistant is currently disabled
          </p>
        </div>
      </div>
    </div>
  );
};
