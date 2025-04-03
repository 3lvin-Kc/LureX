
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
  onAccept?: () => void; // Added this optional prop
}

const CloneWebsiteWarning = ({
  open,
  onOpenChange,
  onProceed,
  onCancel,
  onAccept, // Include it in the destructured props
}: CloneWebsiteWarningProps) => {
  // Call onAccept when proceeding if it's provided
  const handleProceed = () => {
    onProceed();
    if (onAccept) {
      onAccept();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <AlertDialogTitle>Beta Feature Warning</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>
              The Website Cloner feature is currently in beta and may not work as expected for all websites.
              Some websites with advanced security measures or complex designs may not clone properly.
            </p>
            <p className="font-medium">
              For more reliable results, we recommend using the "New Page" button to create a custom 
              phishing page using HTML, CSS, and JavaScript.
            </p>
            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-800 mt-2">
              <p className="text-amber-800 dark:text-amber-300 text-sm">
                Do you still want to proceed with the Website Cloner?
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Use New Page Instead</AlertDialogCancel>
          <AlertDialogAction onClick={handleProceed}>Proceed with Cloner</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CloneWebsiteWarning;
