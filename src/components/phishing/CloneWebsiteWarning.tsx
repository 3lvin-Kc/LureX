
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Feature Under Development
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            ⚠️ This feature is still under development. Results may not be as expected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onProceed}>
            Use Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CloneWebsiteWarning;
