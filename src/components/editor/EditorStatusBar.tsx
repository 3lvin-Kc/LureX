
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Globe,
  Wifi,
  HardDrive
} from "lucide-react";

interface EditorStatusBarProps {
  selectedFile: string;
  fileCount: number;
}

export const EditorStatusBar = ({ selectedFile, fileCount }: EditorStatusBarProps) => {
  return (
    <div className="h-6 bg-background/95 backdrop-blur border-t flex items-center justify-between px-4 text-xs">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3 h-3 text-success" />
          <span className="text-muted-foreground">Ready</span>
        </div>
        <div className="flex items-center gap-1">
          <HardDrive className="w-3 h-3 text-muted-foreground" />
          <span>{fileCount} files</span>
        </div>
       
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Wifi className="w-3 h-3 text-success" />
          <span className="text-muted-foreground">Connected</span>
        </div>
        <Badge variant="outline" className="h-5 text-xs">
          <Zap className="w-3 h-3 mr-1" />
          Flutter
        </Badge>
      </div>
    </div>
  );
};
