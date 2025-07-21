
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, ExternalLink, ChevronRight, RefreshCw } from "lucide-react";

interface CloneErrorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorMessage: string;
  onTryAgain: () => void;
  onUseAnotherUrl: () => void;
}

const CloneErrorModal = ({
  open,
  onOpenChange,
  errorMessage,
  onTryAgain,
  onUseAnotherUrl,
}: CloneErrorModalProps) => {
  // Simplify error message for user display
  const simplifiedError = React.useMemo(() => {
    // Default message
    let userMessage = "Failed to clone website. Please try again or use a different URL.";
    
    // Check specific error patterns
    if (errorMessage.includes("Unable to access")) {
      userMessage = "Unable to access this website. It might be blocking automated access or unavailable.";
    } else if (errorMessage.includes("timeout")) {
      userMessage = "Connection timed out. The website might be slow or unavailable.";
    } else if (errorMessage.includes("CORS") || errorMessage.includes("cross-origin")) {
      userMessage = "This website has security restrictions that prevent cloning.";
    } else if (errorMessage.includes("content is too small")) {
      userMessage = "The website returned invalid or incomplete content.";
    }
    
    return userMessage;
  }, [errorMessage]);
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertCircle className="h-5 w-5" />
            <AlertDialogTitle>Cloning Failed</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base text-foreground">
            {simplifiedError}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="bg-muted/50 p-4 rounded-md text-sm my-2">
          <h4 className="font-medium mb-2">Suggestions:</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <span>Try a different website that doesn't have strict security measures</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <span>Use the site's main page URL instead of a login or subdirectory page</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <span>Check if the website is accessible in your browser before cloning</span>
            </li>
          </ul>
          
          <div className="mt-4 pt-2 border-t border-border text-xs text-muted-foreground">
            <details className="group">
              <summary className="cursor-pointer hover:text-foreground inline-flex items-center">
                <span>Technical details</span>
              </summary>
              <p className="mt-2 pl-4 border-l-2 border-muted">
                {errorMessage}
              </p>
            </details>
          </div>
        </div>
        
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogAction
            onClick={onUseAnotherUrl}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Try Different URL
          </AlertDialogAction>
          
          <AlertDialogAction
            onClick={onTryAgain}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CloneErrorModal;
