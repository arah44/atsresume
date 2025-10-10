'use client';

import { useState, useEffect } from 'react';
import { Person } from '@/types';
import { PersonForm } from '@/components/forms/PersonForm';
import { saveProfileAction } from '@/app/actions/profileActions';
import { parseErrorMessage, UserFriendlyError } from '@/utils/errorHandling';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ErrorDisplay } from '@/components/ui/error-display';

interface ProfileCreationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showCard?: boolean;
}

export function ProfileCreationForm({
  onSuccess,
  onCancel,
  showCard = true
}: ProfileCreationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<UserFriendlyError | null>(null);

  const handleSubmit = (data: Person) => {
    console.log('📝 handleSubmit called with data:', data);

    // Clear any previous errors
    setError(null);
    setIsSubmitting(true);

    // Call server action asynchronously
    saveProfileAction(data)
      .then((result) => {
        if (!result.success) {
          throw new Error(result.error || 'Failed to save profile');
        }

        toast.success('✅ Profile and base resume saved successfully!');

        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
      })
      .catch((err) => {
        console.error('❌ FAILED to save profile:', err);
        const parsedError = parseErrorMessage(err);
        setError(parsedError);
        toast.error(parsedError.message);
      })
      .finally(() => {
        console.log('🏁 Setting isSubmitting to false');
        setIsSubmitting(false);
      });
  };

  const handleRetry = () => {
    setError(null);
    // Form will remain filled, user can fix issues and resubmit
  };

  const emptyPerson: Person = {
    name: '',
    raw_content: ''
  };

  if (isSubmitting) {
    return (
      <div className="flex flex-col justify-center items-center py-12 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <div className="space-y-2 text-center">
          <p className="font-medium">Generating your base resume...</p>
          <p className="text-sm text-muted-foreground">
            This may take a moment as we extract and structure your information
          </p>
        </div>
      </div>
    );
  }

  return (
    <PersonForm
      initialData={emptyPerson}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isLoading={isSubmitting}
      externalError={error}
      onClearExternalError={() => setError(null)}
    />
  );
}

