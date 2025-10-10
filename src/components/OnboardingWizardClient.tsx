'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '@/services/repositories';
import { OnboardingWizard } from '@/components/dialogs/OnboardingWizard';
import { useRouter } from 'next/navigation';

interface OnboardingWizardClientProps {
  initialProfile: UserProfile | null;
}

export function OnboardingWizardClient({  initialProfile }: OnboardingWizardClientProps) {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding wizard if no profile exists
  useEffect(() => {
    if (!initialProfile) {
      setShowOnboarding(true);
    }
  }, [initialProfile]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    router.refresh();
  };

  return (
    <>
      <OnboardingWizard
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </>
  );
}

