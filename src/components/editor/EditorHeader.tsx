import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/auth/UserMenu";

import { 
  Download, 
  Github, 
  Play, 
  Code2, 
  Smartphone,
  MoreHorizontal,
  Settings,
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditorHeaderProps {
  projectName: string;
  onDownload: () => void;
  currentProject?: any;
}

export const EditorHeader = ({ 
  projectName, 
  onDownload,
  currentProject
}: EditorHeaderProps) => {
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const handlePreview = () => {
    setIsPreviewLoading(true);
    setTimeout(() => setIsPreviewLoading(false), 2000);
  };

  return (
    <header className="glass-panel border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-14 px-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
         
          <div className="flex flex-col">
            <h1 className="font-semibold text-sm leading-none">{projectName}</h1>
            <span className="text-xs text-muted-foreground">Flutter Project</span>
          </div>
        </div>
        
      </div>

      <div className="flex items-center gap-1">
        {/* Action Buttons */}
        <Tooltip>
          <TooltipTrigger asChild>
           
          </TooltipTrigger>
         
        </Tooltip>

        <UserMenu />
      </div>
    </header>
  );
};
