'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '@/services/repositories';
import { OnboardingWizard } from '@/components/dialogs/OnboardingWizard';
import { useRouter } from 'next/navigation';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  initialProfile: UserProfile | null;
}

export function DashboardLayoutClient({ children, initialProfile }: DashboardLayoutClientProps) {
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
      {children}
      <OnboardingWizard
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </>
  );
}

