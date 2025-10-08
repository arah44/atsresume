'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Person, TargetJobJson, GenerationStatus, Resume } from '@/types';
import { generateResumeAction, generateBaseResumeAction } from '@/app/actions/resumeGeneration';
import { ResumeStorageService } from '@/services/resumeStorage';
import { ProfileStorageService, UserProfile } from '@/services/profileStorage';
import { JobStorageService, SavedJob } from '@/services/jobStorage';
import { JobDataParser } from '@/services/jobDataParser';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AITextarea } from '@/components/ui/ai-textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, User, Briefcase, FileCheck, Sparkles, Upload, CheckCircle2, XCircle, Database } from 'lucide-react';
import { ResumeGenerationLoadingState } from '@/components/resumeGenerator/ResumeGenerationLoadingState';

// Step 1: Person data schema
const personSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  raw_content: z.string().min(50, 'Profile content must be at least 50 characters')
});

// Step 2: Job data schema
const jobSchema = z.object({
  name: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  raw_content: z.string().min(10, 'Raw content must be at least 10 characters')
});

type PersonFormData = z.infer<typeof personSchema>;
type JobFormData = z.infer<typeof jobSchema>;

interface CreateResumeWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateResumeWizard: React.FC<CreateResumeWizardProps> = ({ open, onOpenChange }) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [personData, setPersonData] = useState<PersonFormData | null>(null);
  const [jobData, setJobData] = useState<JobFormData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>(GenerationStatus.PENDING);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [rawJobContent, setRawJobContent] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  const personForm = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      name: '',
      raw_content: ''
    }
  });

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

  // Load user profile and jobs when dialog opens
  useEffect(() => {
    if (open) {
      const profile = ProfileStorageService.getProfile();
      const jobs = JobStorageService.getAllJobs();
      setUserProfile(profile);
      setSavedJobs(jobs);

      // Auto-load profile data if available
      if (profile) {
        personForm.setValue('name', profile.name);
        personForm.setValue('raw_content', profile.raw_content);
      }
    }
  }, [open, personForm]);

  const handleLoadProfile = () => {
    if (userProfile) {
      personForm.setValue('name', userProfile.name);
      personForm.setValue('raw_content', userProfile.raw_content);
      toast.success('Profile loaded!');
    }
  };

  const handleLoadJob = (jobId: string) => {
    const job = savedJobs.find(j => j.id === jobId);
    if (job) {
      jobForm.setValue('name', job.name);
      jobForm.setValue('company', job.company);
      jobForm.setValue('url', job.url || '');
      jobForm.setValue('description', job.description);
      jobForm.setValue('raw_content', job.raw_content);
      setSelectedJobId(jobId);
      toast.success('Job loaded!');
    }
  };

  const handlePersonSubmit = (data: PersonFormData) => {
    setPersonData(data);
    setStep(2);
  };

  const handleJobSubmit = (data: JobFormData) => {
    setJobData(data);
    setStep(3);
  };

  const handleParseJobData = async () => {
    if (!rawJobContent.trim()) return;

    setIsParsing(true);
    try {
      const parsed = JobDataParser.parseRawJobData(rawJobContent);

      jobForm.setValue('name', parsed.name || '');
      jobForm.setValue('company', parsed.company || '');
      jobForm.setValue('description', parsed.description || '');
      jobForm.setValue('raw_content', parsed.raw_content || rawJobContent);

      toast.success('Job data parsed successfully!');
    } catch (error) {
      console.error('Failed to parse job data:', error);
      toast.error('Failed to parse job data. Please check the format.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'person' | 'job') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const jsonData = JSON.parse(content);

        if (type === 'person') {
          if (jsonData.name && jsonData.raw_content) {
            personForm.setValue('name', jsonData.name);
            personForm.setValue('raw_content', jsonData.raw_content);
            toast.success('Person data loaded from file!');
          } else {
            toast.error('Invalid person data format');
          }
        } else {
          if (jsonData.name && jsonData.company && jsonData.raw_content) {
            jobForm.setValue('name', jsonData.name);
            jobForm.setValue('company', jsonData.company);
            jobForm.setValue('url', jsonData.url || '');
            jobForm.setValue('description', jsonData.description || '');
            jobForm.setValue('raw_content', jsonData.raw_content);
            toast.success('Job data loaded from file!');
          } else {
            toast.error('Invalid job data format');
          }
        }
      } catch (error) {
        toast.error('Failed to parse file. Please ensure it\'s valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (!personData || !jobData) return;

    setIsGenerating(true);
    setGenerationStatus(GenerationStatus.PENDING);
    setGenerationProgress(0);

    try {
      const person: Person = {
        name: personData.name,
        raw_content: personData.raw_content
      };

      const targetJob: TargetJobJson = {
        name: jobData.name,
        company: jobData.company,
        url: jobData.url || '',
        description: jobData.description,
        raw_content: jobData.raw_content
      };

      // Update progress for UI feedback
      const updateProgress = (status: GenerationStatus, progress: number, text: string) => {
        setGenerationStatus(status);
        setGenerationProgress(progress);
        setCurrentStepText(text);
      };

      // Step 1: Get base resume
      let baseResume: Resume;

      if (userProfile?.baseResume) {
        // Use existing base resume from user profile
        updateProgress(GenerationStatus.PENDING, 5, 'Loading base resume from your profile...');
        baseResume = userProfile.baseResume;
        toast.success(`Using your base resume`);
      } else if (userProfile) {
        // Profile exists but no base resume - generate and save it
        updateProgress(GenerationStatus.PENDING, 10, 'Generating base resume...');
        baseResume = await generateBaseResumeAction(person);

        // Save to profile for future use
        ProfileStorageService.updateProfile({
          baseResume,
          metadata: {
            lastUpdated: Date.now()
          }
        });
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

      // Save the job-specific resume
      const resumeId = ResumeStorageService.saveResumeById(result.resume);

      toast.success('Job-specific resume created successfully!');

      // Close dialog and redirect
      setTimeout(() => {
        onOpenChange(false);
        router.push(`/resume/${resumeId}`);
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
      setPersonData(null);
      setJobData(null);
      personForm.reset();
      jobForm.reset();
      setRawJobContent('');
    }
  };

  const handleBack = () => {
    if (step > 1 && !isGenerating) {
      setStep(step - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex flex-col max-w-4xl max-h-[95vh] w-[95vw] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex gap-2 items-center text-2xl">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Create AI-Optimized Resume
          </DialogTitle>
          <DialogDescription>
            Follow the steps to create a professional, ATS-optimized resume
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        {!isGenerating && (
          <div className="flex gap-2 justify-center items-center px-6 py-4 border-b bg-muted/30">
            <StepIndicator step={1} currentStep={step} label="Profile" icon={<User className="w-4 h-4" />} />
            <div className="w-12 h-px bg-border" />
            <StepIndicator step={2} currentStep={step} label="Job" icon={<Briefcase className="w-4 h-4" />} />
            <div className="w-12 h-px bg-border" />
            <StepIndicator step={3} currentStep={step} label="Review" icon={<FileCheck className="w-4 h-4" />} />
          </div>
        )}

        {/* Step Content */}
        <div className="overflow-y-auto flex-1 px-6 py-6">
          {!isGenerating ? (
            <>
              {step === 1 && (
                <div className="flex flex-col space-y-6 h-full">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Step 1: Your Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Load a saved profile, enter your information, or upload a JSON file
                  </p>
                </div>

                {/* Show User Profile Status */}
                {userProfile && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex gap-2 items-center text-sm font-semibold text-blue-900">
                          <User className="w-4 h-4 text-blue-600" />
                          Your Profile
                        </label>
                        {userProfile.baseResume && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Base Resume Ready
                          </Badge>
                        )}
                      </div>

                      <div className="bg-white/60 rounded-md p-3 border border-blue-300">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-blue-900">{userProfile.name}</span>
                          </div>
                          {userProfile.baseResume ? (
                            <p className="text-xs text-blue-700">
                              Your profile includes a base resume. We&apos;ll use it to create your job-specific resume faster.
                            </p>
                          ) : (
                            <p className="text-xs text-blue-700">
                              A base resume will be generated from your profile data.
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleLoadProfile}
                        className="w-full bg-white"
                      >
                        <User className="w-3 h-3 mr-2" />
                        Reload Profile Data
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Form {...personForm}>
                  <form onSubmit={personForm.handleSubmit(handlePersonSubmit)} className="space-y-4">
                    <FormField
                      control={personForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={personForm.control}
                      name="raw_content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile / Resume Content</FormLabel>
                          <FormDescription>
                            Paste your resume, LinkedIn profile, or any professional background information
                          </FormDescription>
                          <FormControl>
                            <AITextarea
                              placeholder="Enter your professional background, work history, skills, education, etc..."
                              className="min-h-[200px]"
                              {...field}
                              showBeam={!!(field.value && field.value.length > 0)}
                              beamColor="#6366f1"
                              beamColorTo="#8b5cf6"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2 items-center">
                      <Separator className="flex-1" />
                      <span className="text-xs text-muted-foreground">OR</span>
                      <Separator className="flex-1" />
                    </div>

                    <div>
                      <label className="flex gap-2 justify-center items-center px-4 py-3 rounded-lg border-2 border-dashed transition-colors cursor-pointer hover:bg-accent">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm font-medium">Upload Person JSON File</span>
                        <input
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'person')}
                        />
                      </label>
                    </div>

                    <div className="flex gap-2 justify-end pt-4 mt-auto">
                      <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        Next: Job Details
                      </Button>
                    </div>
                  </form>
                </Form>
                </div>
              )}

            {step === 2 && (
              <div className="flex flex-col space-y-6 h-full">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Step 2: Target Job</h3>
                  <p className="text-sm text-muted-foreground">
                    Load a saved job, enter the job posting details, or paste the complete job description
                  </p>
                </div>

                {/* Load Saved Job */}
                {savedJobs.length > 0 && (
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="pt-4 space-y-2">
                      <label className="flex gap-2 items-center text-sm font-semibold text-purple-900">
                        <Database className="w-4 h-4 text-purple-600" />
                        Load Saved Job ({savedJobs.length} available)
                      </label>
                      <Select value={selectedJobId} onValueChange={handleLoadJob}>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select a job to load..." />
                        </SelectTrigger>
                        <SelectContent>
                          {savedJobs.map((job) => (
                            <SelectItem key={job.id} value={job.id}>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{job.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {job.company} • {new Date(job.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Quick Parse Job Posting</label>
                    <p className="mb-2 text-xs text-muted-foreground">
                      Paste the complete job posting here to auto-extract details
                    </p>
                    <AITextarea
                      placeholder="Paste the complete job posting here... ✨ AI-powered parsing"
                      className="min-h-[120px]"
                      value={rawJobContent}
                      onChange={(e) => setRawJobContent(e.target.value)}
                      showBeam={rawJobContent.length > 0}
                      beamColor="#8b5cf6"
                      beamColorTo="#06b6d4"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        onClick={handleParseJobData}
                        disabled={!rawJobContent.trim() || isParsing}
                        size="sm"
                        variant="secondary"
                      >
                        {isParsing ? (
                          <>
                            <Loader2 className="mr-2 w-3 h-3 animate-spin" />
                            Parsing...
                          </>
                        ) : (
                          'Parse Job Data'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setRawJobContent('')}
                        size="sm"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <Form {...jobForm}>
                    <form onSubmit={jobForm.handleSubmit(handleJobSubmit)} className="space-y-4">
                      <FormField
                        control={jobForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Senior Software Engineer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={jobForm.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Google" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={jobForm.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://company.com/jobs/123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={jobForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Brief job description..."
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={jobForm.control}
                        name="raw_content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Job Posting Content</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Complete raw job posting content..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-2 items-center">
                        <Separator className="flex-1" />
                        <span className="text-xs text-muted-foreground">OR</span>
                        <Separator className="flex-1" />
                      </div>

                      <div>
                        <label className="flex gap-2 justify-center items-center px-4 py-3 rounded-lg border-2 border-dashed transition-colors cursor-pointer hover:bg-accent">
                          <Upload className="w-4 h-4" />
                          <span className="text-sm font-medium">Upload Job JSON File</span>
                          <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'job')}
                          />
                        </label>
                      </div>

                      <div className="flex gap-2 justify-between pt-4 mt-auto">
                        <Button type="button" variant="outline" onClick={handleBack}>
                          Back
                        </Button>
                        <Button type="submit">
                          Next: Review
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </div>
            )}

            {step === 3 && personData && jobData && (
              <div className="flex flex-col space-y-6 h-full">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Step 3: Review & Generate</h3>
                  <p className="text-sm text-muted-foreground">
                    Review your information before generating the AI-optimized resume
                  </p>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <div className="flex gap-2 items-center mb-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <h4 className="font-semibold">Your Profile</h4>
                        </div>
                        <div className="pl-6 space-y-2">
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Name:</span>
                            <p className="text-sm font-medium">{personData.name}</p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Content Length:</span>
                            <p className="text-sm">{personData.raw_content.length} characters</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <div className="flex gap-2 items-center mb-2">
                          <Briefcase className="w-4 h-4 text-purple-600" />
                          <h4 className="font-semibold">Target Job</h4>
                        </div>
                        <div className="pl-6 space-y-2">
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Position:</span>
                            <p className="text-sm font-medium">{jobData.name}</p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Company:</span>
                            <p className="text-sm font-medium">{jobData.company}</p>
                          </div>
                          {jobData.url && (
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">URL:</span>
                              <p className="text-sm text-blue-600 truncate">{jobData.url}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Description:</span>
                            <p className="text-sm line-clamp-3">{jobData.description}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="mb-2 font-semibold text-blue-900">What happens next?</h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• AI will analyze the job requirements</li>
                      <li>• Extract ATS-relevant keywords</li>
                      <li>• Optimize your summary for this role</li>
                      <li>• Enhance your work experience descriptions</li>
                      <li>• Tailor your skills to match the job</li>
                      <li>• Generate a complete, ATS-optimized resume</li>
                    </ul>
                  </div>

                  <div className="flex gap-2 justify-between pt-4 mt-auto">
                    <Button type="button" variant="outline" onClick={handleBack}>
                      Back
                    </Button>
                    <Button onClick={handleGenerate} className="gap-2">
                      <Sparkles className="w-4 h-4" />
                      Generate Resume
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <ResumeGenerationLoadingState
            status={generationStatus}
            progress={generationProgress}
            currentStep={currentStepText}
          />
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Step Indicator Component
const StepIndicator: React.FC<{
  step: number;
  currentStep: number;
  label: string;
  icon: React.ReactNode;
}> = ({ step, currentStep, label, icon }) => {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;

  return (
    <div className="flex flex-col gap-1 items-center">
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
          isActive
            ? 'bg-primary text-primary-foreground border-primary'
            : isCompleted
            ? 'text-white bg-green-500 border-green-500'
            : 'bg-muted text-muted-foreground border-border'
        }`}
      >
        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : icon}
      </div>
      <span
        className={`text-xs font-medium ${
          isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
        }`}
      >
        {label}
      </span>
    </div>
  );
};

