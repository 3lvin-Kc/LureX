import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, WifiOff, RefreshCw } from "lucide-react";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Connection status with timer
const ConnectionStatus = ({
  status,
  onReconnect,
}: {
  status: "disconnected" | "connecting" | "connected";
  onReconnect: () => void;
}) => {
  const [connectTime, setConnectTime] = useState(0);

  useEffect(() => {
    if (status === "connecting") {
      setConnectTime(0);
      const interval = setInterval(() => {
        setConnectTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setConnectTime(0);
    }
  }, [status]);

  if (status === "connected") return null;

  return (
    <div className="flex flex-col items-start">
      {/* Compact connection indicator */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={onReconnect}
      >
        <div className="flex items-center gap-1.5">
          {status === "connecting" ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
              <Loader2 className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400 animate-spin" />
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                Connecting... ({connectTime}s)
              </span>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white" />
              <WifiOff className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                Disconnected
              </span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onReconnect();
            }}
            className="h-5 w-5 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
          >
            <RefreshCw className="w-2.5 h-2.5 text-gray-700 dark:text-gray-300" />
          </Button>
        </div>
      </div>
      
      {/* Expanded details */}
      {status === "disconnected" && (
        <div className="mt-2 max-w-sm animate-in slide-in-from-top-1 duration-200">
          <div className="relative">
            {/* Triangle pointer */}
            <div className="absolute -top-2 left-4 transform w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-300 dark:border-b-gray-600" />
            
            {/* Details container */}
            <div className="relative bg-white dark:bg-black border border-gray-300 dark:border-gray-600 p-3 shadow-sm">
              <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                Backend may be offline. Click retry to reconnect.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Generation complete - removed for cleaner UI
const GenerationComplete = () => null;

export { ConnectionStatus, GenerationComplete };