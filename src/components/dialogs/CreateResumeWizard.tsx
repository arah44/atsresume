'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Person, TargetJobJson, GenerationStatus, Resume } from '@/types';
import { generateResumeAction, generateBaseResumeAction } from '@/app/actions/resumeGeneration';
import { saveResumeAction } from '@/app/actions/resumeActions';
import { updateProfileAction } from '@/app/actions/profileActions';
import { UserProfile } from '@/services/repositories/ProfileRepository';
import { SavedJob } from '@/services/repositories/JobRepository';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { toast } from 'sonner';
import { User, Briefcase, FileCheck, Sparkles } from 'lucide-react';
import { ResumeGenerationLoadingState } from '@/components/resumeGenerator/ResumeGenerationLoadingState';
import { StepIndicator } from '@/components/resumeGenerator/wizard/StepIndicator';
import { Step1ProfilePreview } from '@/components/resumeGenerator/wizard/Step1ProfilePreview';
import { Step2JobSelection } from '@/components/resumeGenerator/wizard/Step2JobSelection';
import { Step3ReviewGenerate } from '@/components/resumeGenerator/wizard/Step3ReviewGenerate';
import { jobSchema, JobFormData } from '@/components/resumeGenerator/wizard/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface CreateResumeWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProfile: UserProfile | null;
  initialJobs: SavedJob[];
}

export const CreateResumeWizard: React.FC<CreateResumeWizardProps> = ({
  open,
  onOpenChange,
  initialProfile,
  initialJobs
}) => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [step, setStep] = useState(1);
  const [jobData, setJobData] = useState<JobFormData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>(GenerationStatus.PENDING);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialProfile);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(initialJobs);
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  const jobForm = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      name: '',
      company: '',
      url: '',
      description: '',
      raw_content: ''
    }
  });

  // Update state when props change
  useEffect(() => {
    setUserProfile(initialProfile);
    setSavedJobs(initialJobs);
  }, [initialProfile, initialJobs]);

  const handleJobSubmit = (data: JobFormData) => {
    setJobData(data);
    setStep(3);
  };

  const handleGenerate = async () => {
    if (!userProfile || !jobData) {
      toast.error('Profile or job data is missing');
      return;
    }

    setIsGenerating(true);
    setGenerationStatus(GenerationStatus.PENDING);
    setGenerationProgress(0);

    try {
      const person: Person = {
        name: userProfile.name,
        raw_content: userProfile.raw_content
      };

      const targetJob: TargetJobJson = {
        name: jobData.name,
        company: jobData.company,
        url: jobData.url || '',
        description: jobData.description || '',
        raw_content: jobData.raw_content,
        apply_url: jobData.apply_url,
        is_easy_apply: jobData.is_easy_apply,
        remote_allowed: jobData.remote_allowed
      };

      // Update progress for UI feedback
      const updateProgress = (status: GenerationStatus, progress: number, text: string) => {
        setGenerationStatus(status);
        setGenerationProgress(progress);
        setCurrentStepText(text);
      };

      // Step 1: Get base resume
      let baseResume: Resume;

      if (userProfile?.baseResumeId) {
        // Use existing base resume from repository - fetch via server action
        updateProgress(GenerationStatus.PENDING, 5, 'Loading base resume from your profile...');

        // We'll fetch the base resume via the generation action
        baseResume = { name: '', position: '' } as Resume; // Will be fetched server-side
        toast.success(`Using your base resume`);
      } else if (userProfile) {
        // Profile exists but no base resume - generate and save it
        updateProgress(GenerationStatus.PENDING, 10, 'Generating base resume...');
        baseResume = await generateBaseResumeAction(person);

        // Save to resume repository and update profile with ID
        await updateProfileAction({
          baseResume
        } as any);
        toast.success('Base resume generated and saved to your profile');
      } else {
        // No profile - generate temporary base resume
        updateProgress(GenerationStatus.PENDING, 10, 'Generating temporary base resume...');
        baseResume = await generateBaseResumeAction(person);
        toast.info('Base resume generated (not saved to profile)');
      }

      // Step 2: Generate job-specific optimized resume (3 steps)
      updateProgress(GenerationStatus.ANALYZING_JOB, 25, 'Step 1: Analyzing job requirements...');

      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 300));

      updateProgress(GenerationStatus.EXTRACTING_KEYWORDS, 50, 'Step 2: Extracting ATS keywords...');

      await new Promise(resolve => setTimeout(resolve, 300));

      updateProgress(GenerationStatus.GENERATING_RESUME, 75, 'Step 3: Generating optimized resume (all sections)...');

      const result = await generateResumeAction({
        baseResume,
        targetJob
      });

      updateProgress(GenerationStatus.COMPLETED, 100, 'Resume generated successfully!');

      // Save the job-specific resume using server action with jobId
      const saveResult = await saveResumeAction(result.resume, selectedJobId || undefined);

      if (!saveResult.success || !saveResult.id) {
        throw new Error('Failed to save resume');
      }

      toast.success('Job-specific resume created successfully!');

      // Close dialog and redirect
      setTimeout(() => {
        onOpenChange(false);
        router.push(`/resume/${saveResult.id}`);
      }, 1000);

    } catch (error) {
      console.error('Resume generation failed:', error);
      setGenerationStatus(GenerationStatus.FAILED);
      toast.error('Failed to generate resume. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      onOpenChange(false);
      // Reset state
      setStep(1);
      setJobData(null);
      jobForm.reset();
      setSelectedJobId('');
    }
  };

  const handleBack = () => {
    if (step > 1 && !isGenerating) {
      setStep(step - 1);
    }
  };

  // Shared content components
  const HeaderContent = () => (
    <>
      <div className="flex gap-2 items-center text-xl sm:text-2xl">
        <Sparkles className="w-5 h-5 text-purple-600 sm:w-6 sm:h-6" />
        Create AI-Optimized Resume
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground">
        Follow the steps to create a professional, ATS-optimized resume
      </div>
    </>
  );

  const StepContent = () => (
    <>
      {!isGenerating ? (
        <>
          {step === 1 && (
            <Step1ProfilePreview
              userProfile={userProfile}
              onNext={() => setStep(2)}
              onCancel={handleClose}
            />
          )}

          {step === 2 && (
            <Step2JobSelection
              form={jobForm}
              savedJobs={savedJobs}
              selectedJobId={selectedJobId}
              onSelectJob={setSelectedJobId}
              onSubmit={handleJobSubmit}
              onBack={handleBack}
            />
          )}

          {step === 3 && userProfile && jobData && (
            <Step3ReviewGenerate
              userProfile={userProfile}
              jobData={jobData}
              onGenerate={handleGenerate}
              onBack={handleBack}
            />
          )}
        </>
      ) : (
        <ResumeGenerationLoadingState
          status={generationStatus}
          progress={generationProgress}
          currentStep={currentStepText}
        />
      )}
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent className="max-h-[96vh] flex flex-col">
          <DrawerHeader className="px-4 pt-4 pb-3 border-b">
            <DrawerTitle className="flex gap-2 items-center text-xl">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Create AI-Optimized Resume
            </DrawerTitle>
            <DrawerDescription className="text-xs">
              Follow the steps to create a professional, ATS-optimized resume
            </DrawerDescription>
          </DrawerHeader>

          {/* Progress Indicator */}
          {!isGenerating && (
            <div className="flex gap-2 justify-center items-center px-4 py-3 border-b bg-muted/30">
              <StepIndicator step={1} currentStep={step} label="Profile" icon={<User className="w-4 h-4" />} />
              <div className="w-8 h-px bg-border" />
              <StepIndicator step={2} currentStep={step} label="Job" icon={<Briefcase className="w-4 h-4" />} />
              <div className="w-8 h-px bg-border" />
              <StepIndicator step={3} currentStep={step} label="Review" icon={<FileCheck className="w-4 h-4" />} />
            </div>
          )}

          {/* Step Content */}
          <div className="overflow-y-auto flex-1 px-4 py-4">
            <StepContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex flex-col max-w-4xl lg:max-w-4xl md:max-w-2xl sm:max-w-full max-h-[95vh] w-[95vw] p-0">
        <DialogHeader className="px-4 pt-4 pb-3 border-b sm:px-6 sm:pt-6 sm:pb-4">
          <DialogTitle>
            <HeaderContent />
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        {!isGenerating && (
          <div className="flex gap-2 justify-center items-center px-4 py-3 border-b sm:gap-3 sm:px-6 sm:py-4 bg-muted/30">
            <StepIndicator step={1} currentStep={step} label="Profile" icon={<User className="w-4 h-4" />} />
            <div className="w-8 h-px sm:w-12 bg-border" />
            <StepIndicator step={2} currentStep={step} label="Job" icon={<Briefcase className="w-4 h-4" />} />
            <div className="w-8 h-px sm:w-12 bg-border" />
            <StepIndicator step={3} currentStep={step} label="Review" icon={<FileCheck className="w-4 h-4" />} />
          </div>
        )}

        {/* Step Content */}
        <div className="overflow-y-auto flex-1 px-4 py-4 sm:px-6 sm:py-6">
          <StepContent />
        </div>
      </DialogContent>
    </Dialog>
  );
};

