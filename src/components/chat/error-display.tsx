import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import React, { useState } from "react";

// Error display
const GenerationError = ({
  error,
  onRetry,
}: {
  error: { message: string; code?: string };
  onRetry: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col items-start">
      {/* Compact error indicator */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-pulse" />
          <AlertCircle className="w-3.5 h-3.5 text-gray-900 dark:text-gray-100" />
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
            Error
          </span>
          {error.code && (
            <span className="text-xs text-gray-600 dark:text-gray-400">
              ({error.code})
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {onRetry && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onRetry();
              }}
              className="h-5 w-5 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            >
              <RefreshCw className="w-2.5 h-2.5 text-gray-700 dark:text-gray-300" />
            </Button>
          )}
          <div className="w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-700 dark:text-gray-300 transition-transform duration-200" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-700 dark:text-gray-300 transition-transform duration-200" />
            )}
          </div>
        </div>
      </div>
      
      {/* Expanded error details */}
      {isExpanded && (
        <div className="mt-2 max-w-sm animate-in slide-in-from-top-1 duration-200">
          <div className="relative">
            {/* Triangle pointer */}
            <div className="absolute -top-2 left-4 transform w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-300 dark:border-b-gray-600" />
            
            {/* Error message container */}
            <div className="relative bg-white dark:bg-black border border-gray-300 dark:border-gray-600 p-3 shadow-sm">
              <div className="text-xs text-gray-900 dark:text-gray-100 font-mono leading-relaxed break-words">
                {error.message}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { GenerationError };