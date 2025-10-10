'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ProfileCreationForm } from '@/components/forms/ProfileCreationForm';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

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

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[96vh]">
          {step === 'welcome' ? (
            <div className="overflow-y-auto">
              <DrawerHeader className="text-center">
                <div className="sr-only">
                  <DrawerTitle>Welcome to Jobsly</DrawerTitle>
                  <DrawerDescription>Get started with your profile</DrawerDescription>
                </div>
              </DrawerHeader>
              <div className="px-4 pb-4">
                <WelcomeContent
                  handleGetStarted={handleGetStarted}
                  handleSkip={handleSkip}
                />
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto">
              <DrawerHeader className="text-left">
                <DrawerTitle>Create Your Profile</DrawerTitle>
                <DrawerDescription>
                  Upload your resume or paste your content to generate your base resume
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-4 pb-4">
                <ProfileCreationForm
                  onSuccess={handleSuccess}
                  onCancel={handleSkip}
                  showCard={false}
                />
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-sm md:max-w-4xl md:max-h-[90vh] overflow-y-auto">
        {step === 'welcome' ? (
          <WelcomeContent
            handleGetStarted={handleGetStarted}
            handleSkip={handleSkip}
          />
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

function WelcomeContent({
  handleGetStarted,
  handleSkip
}: {
  handleGetStarted: () => void;
  handleSkip: () => void;
}) {
  return (
    <div className="py-6 space-y-6">
      {/* Welcome Message */}
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10">
            <FileText className="w-16 h-16 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">
            Create Your First Profile
          </h3>
          <p className="mx-auto max-w-lg text-muted-foreground">
            To get started, we&apos;ll need to create your profile. This will generate a base resume
            that you can then tailor later for specific job applications.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="hidden grid-cols-3 gap-4">
        <Feature
          title="Upload Resume"
          description="Upload your existing resume PDF for quick setup"
          icon={<FileText className="w-8 h-8 text-primary" />}
        />
        <Feature
          title="AI Extraction"
          description="Our AI extracts and structures your information"
          icon={<Sparkles className="w-8 h-8 text-primary" />}
          classNames="hidden"
        />
        <Feature
          title="Tailored Resumes"
          description="Generate job-specific resumes in seconds"
          icon={<Rocket className="w-8 h-8 text-primary" />}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 justify-center pt-4 sm:flex-row">
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
  );
}

function Feature({ title, description, icon, classNames }: { title: string, description: string, icon: React.ReactNode, classNames?: string }) {
  return (<>
    <div className={cn("p-4 space-y-2 text-center rounded-lg border", classNames)}>
      <div className="flex justify-center">
        {icon}
      </div>
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  </>
  );
}