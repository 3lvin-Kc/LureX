import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SocialMediaTemplateEditorProps {
  open: boolean;
  onClose: () => void;
}

export const SocialMediaTemplateEditor: React.FC<SocialMediaTemplateEditorProps> = ({
  open,
  onClose
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Social Media Template Editor</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Template editor will be implemented here</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};