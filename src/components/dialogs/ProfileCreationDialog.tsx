'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProfileCreationForm } from '@/components/forms/ProfileCreationForm';

interface ProfileCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProfileCreationDialog({
  open,
  onOpenChange,
  onSuccess
}: ProfileCreationDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Your Profile</DialogTitle>
          <DialogDescription>
            Upload your resume or paste your content to get started
          </DialogDescription>
        </DialogHeader>
        <ProfileCreationForm
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
          showCard={false}
        />
      </DialogContent>
    </Dialog>
  );
}

