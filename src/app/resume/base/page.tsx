'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileStorageService } from '@/services/profileStorage';

/**
 * Simple redirect page for /resume/base
 * Loads the base resume from profile and redirects to /resume/[id]
 */
export default function BaseResumePage() {
  const router = useRouter();

  useEffect(() => {
    const profile = ProfileStorageService.getProfile();

    if (!profile) {
      // No profile, redirect to profile creation
      router.push('/dashboard/profile');
      return;
    }

    if (!profile.baseResume) {
      // No base resume, redirect to profile to generate one
      router.push('/dashboard/profile');
      return;
    }

    // Ensure base resume has a consistent ID
    const BASE_RESUME_ID = 'base-resume';
    const baseResumeWithId = {
      ...profile.baseResume,
      id: profile.baseResume.id || BASE_RESUME_ID
    };

    // Update profile if ID was added
    if (!profile.baseResume.id) {
      ProfileStorageService.updateProfile({
        baseResume: baseResumeWithId
      });
    }

    // Redirect to the actual resume page with the base resume ID
    console.log('🔄 Redirecting to /resume/' + baseResumeWithId.id);
    router.push(`/resume/${baseResumeWithId.id}`);
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="space-y-4 text-center">
        <div className="mx-auto w-12 h-12 rounded-full border-b-2 animate-spin border-primary"></div>
        <p className="text-muted-foreground">Loading base resume...</p>
      </div>
    </div>
  );
}

