import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SocialMediaCampaignFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  platforms: any[];
  templates: any[];
}

export const SocialMediaCampaignForm: React.FC<SocialMediaCampaignFormProps> = ({
  open,
  onClose,
  onSubmit,
  platforms,
  templates
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Social Media Campaign</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Campaign form will be implemented here</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};