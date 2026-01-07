import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputFieldProps {
  inputValue: string;
  isConnected: boolean;
  isGenerating: boolean;
  setInputValue: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleSend: () => void;
  handleCancel?: () => void;
}

export const InputField = ({
  inputValue,
  isConnected,
  isGenerating,
  setInputValue,
  handleKeyDown,
  handleSend,
  handleCancel,
}: InputFieldProps) => {
  return (
    <div className="border-t p-4 bg-gradient-to-r from-background to-muted/20">
      <div className="flex gap-2">
        <Input
          placeholder={
            !isConnected
              ? "Connecting to server..."
              : isGenerating
                ? "Generation in progress..."
                : "Describe your Flutter app..."
          }
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isConnected || isGenerating}
          className="flex-1"
        />
        <Button
          size="icon"
          onClick={isGenerating ? handleCancel : handleSend}
          disabled={!isGenerating && (!inputValue.trim() || !isConnected)}
          className={cn(
            "shrink-0 transition-all duration-200",
            isGenerating
              ? "bg-black hover:bg-gray-800 text-white"
              : "bg-black hover:bg-gray-800 text-white"
          )}
        >
          {isGenerating ? (
            <X className="h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isConnected && !isGenerating && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send • Supports social, e-commerce, productivity apps
        </p>
      )}
    </div>
  );
};