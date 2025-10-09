'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProfileCreationForm } from '@/components/forms/ProfileCreationForm';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText, Rocket } from 'lucide-react';

interface OnboardingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function OnboardingWizard({
  open,
  onOpenChange,
  onComplete
}: OnboardingWizardProps) {
  const [step, setStep] = useState<'welcome' | 'create-profile'>('welcome');

  const handleGetStarted = () => {
    setStep('create-profile');
  };

  const handleSuccess = () => {
    onOpenChange(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {step === 'welcome' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Welcome to ATS Resume Builder!
              </DialogTitle>
              <DialogDescription className="text-base">
                Let&apos;s get you started with creating your professional resume
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              {/* Welcome Message */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <FileText className="w-16 h-16 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    Create Your First Profile
                  </h3>
                  <p className="text-muted-foreground max-w-lg mx-auto">
                    To get started, we&apos;ll need to create your profile. This will generate a base resume
                    that you can then tailor for specific job applications.
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg text-center space-y-2">
                  <div className="flex justify-center">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-medium">Upload Resume</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload your existing resume PDF for quick setup
                  </p>
                </div>
                <div className="p-4 border rounded-lg text-center space-y-2">
                  <div className="flex justify-center">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-medium">AI Extraction</h4>
                  <p className="text-sm text-muted-foreground">
                    Our AI extracts and structures your information
                  </p>
                </div>
                <div className="p-4 border rounded-lg text-center space-y-2">
                  <div className="flex justify-center">
                    <Rocket className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-medium">Tailored Resumes</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate job-specific resumes in seconds
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="sm:px-8"
                >
                  <Sparkles className="mr-2 w-4 h-4" />
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleSkip}
                  className="sm:px-8"
                >
                  Skip for Now
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create Your Profile</DialogTitle>
              <DialogDescription>
                Upload your resume or paste your content to generate your base resume
              </DialogDescription>
            </DialogHeader>
            <ProfileCreationForm
              onSuccess={handleSuccess}
              onCancel={handleSkip}
              showCard={false}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

