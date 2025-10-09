'use client';

import { useState } from 'react';
import { Person } from '@/types';
import { PersonForm } from '@/components/resumeGenerator/forms/PersonForm';
import { saveProfileAction } from '@/app/actions/profileActions';
import { parseErrorMessage } from '@/utils/errorHandling';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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

  const handleSubmit = async (data: Person) => {
    setIsSubmitting(true);

    try {
      console.log('📝 Starting profile creation...');
      
      toast.info('Generating base resume...');
      
      const result = await saveProfileAction(data);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save profile');
      }

      toast.success('✅ Profile and base resume saved successfully!');
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('❌ FAILED to save profile:', err);
      const parsedError = parseErrorMessage(err);
      toast.error(parsedError.message);
    } finally {
      setIsSubmitting(false);
    }
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
    />
  );
}

