
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface CloneWebsiteWarningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProceed: () => void;
  onCancel: () => void;
}

const CloneWebsiteWarning: React.FC<CloneWebsiteWarningProps> = ({
  open,
  onOpenChange,
  onProceed,
  onCancel,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-border/50 shadow-lg">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-amber-500/10 rounded-full">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            Feature Under Development
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-muted-foreground leading-relaxed">
            This feature is currently under development. While functional, results may not be as expected. 
            Please proceed with caution and report any issues you encounter.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3 pt-6">
          <AlertDialogCancel 
            onClick={onCancel}
            className="hover:bg-muted/50 transition-colors duration-200"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onProceed}
            className="bg-primary hover:bg-primary/90 transition-colors duration-200"
          >
            Use Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CloneWebsiteWarning;
