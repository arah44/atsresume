'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { JobStorageService, SavedJob } from '@/services/jobStorage';
import { ResumeStorageService } from '@/services/resumeStorage';
import { ProfileStorageService } from '@/services/profileStorage';
import { ApplicationStorageService } from '@/services/applicationStorage';
import { TargetJobJson, GenerationStatus, ApplicationPreview, ApplicationDetail } from '@/types';
import { generateResumeAction } from '@/app/actions/resumeGeneration';
import {
  initAutoApplyAction,
  fillUnknownFieldsAction,
  submitApplicationAction
} from '@/app/actions/jobApplication';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ApplicationProgress } from '@/components/jobApplication/ApplicationProgress';
import { ApplicationPreviewModal } from '@/components/jobApplication/ApplicationPreviewModal';
import { NewQuestionDialog } from '@/components/jobApplication/NewQuestionDialog';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  ExternalLink,
  FileText,
  Sparkles,
  Trash2,
  Edit,
  Loader2,
  CheckCircle,
  Send,
  Globe,
  Briefcase,
  AlertCircle,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface JobGenerationState {
  status: GenerationStatus;
  progress: number;
  currentStep: string;
}

type AutoApplyStep =
  | 'navigating'
  | 'analyzing'
  | 'filling'
  | 'preview'
  | 'awaiting_confirmation'
  | 'submitting'
  | 'completed'
  | 'failed';

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<SavedJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [generationState, setGenerationState] = useState<JobGenerationState | null>(null);

  // Auto-apply states
  const [autoApplyStep, setAutoApplyStep] = useState<AutoApplyStep | null>(null);
  const [autoApplyError, setAutoApplyError] = useState<string | null>(null);
  const [applicationPreview, setApplicationPreview] = useState<ApplicationPreview | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [unknownQuestions, setUnknownQuestions] = useState<Array<{ question: string; field_type: string }>>([]);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const loadJobDetails = () => {
      const savedJob = JobStorageService.getJobById(jobId);

      if (!savedJob) {
        toast.error('Job not found');
        router.push('/dashboard/jobs');
        return;
      }

      setJob(savedJob);

      // Check if resume exists for this job
      const foundResumeId = findResumeForJob(savedJob);
      setResumeId(foundResumeId);

      // Check if already applied
      const applied = ApplicationStorageService.hasApplied(savedJob.id);
      setHasApplied(applied);

      setLoading(false);
    };

    loadJobDetails();
  }, [jobId, router]);

  const findResumeForJob = (job: SavedJob): string | null => {
    const savedResumes = ResumeStorageService.getSavedResumesList();
    for (const resumeInfo of savedResumes) {
      const resume = ResumeStorageService.loadResumeById(resumeInfo.id);
      if (resume?.generationMetadata?.targetJob) {
        const targetJob = resume.generationMetadata.targetJob;
        if (targetJob.name === job.name && targetJob.company === job.company) {
          return resume.id || null;
        }
      }
    }
    return null;
  };

  const handleGenerateResume = async () => {
    if (!job) return;

    const profile = ProfileStorageService.getProfile();

    if (!profile) {
      toast.error('Please create your profile first');
      router.push('/dashboard/profile');
      return;
    }

    if (!profile.baseResume) {
      toast.error('Please generate a base resume from your profile first');
      router.push('/dashboard/profile');
      return;
    }

    const updateProgress = (status: GenerationStatus, progress: number, step: string) => {
      setGenerationState({ status, progress, currentStep: step });
    };

    try {
      updateProgress(GenerationStatus.PENDING, 0, 'Initializing...');
      await new Promise(resolve => setTimeout(resolve, 500));

      updateProgress(GenerationStatus.ANALYZING_JOB, 25, 'Analyzing job requirements...');
      await new Promise(resolve => setTimeout(resolve, 500));

      updateProgress(GenerationStatus.EXTRACTING_KEYWORDS, 50, 'Extracting ATS keywords...');
      await new Promise(resolve => setTimeout(resolve, 500));

      updateProgress(GenerationStatus.GENERATING_RESUME, 75, 'Generating optimized resume...');

      const targetJob: TargetJobJson = {
        name: job.name,
        company: job.company,
        url: job.url,
        description: job.description,
        raw_content: job.raw_content,
        apply_url: job.apply_url,
        is_easy_apply: job.is_easy_apply,
        remote_allowed: job.remote_allowed
      };

      const result = await generateResumeAction({
        baseResume: profile.baseResume,
        targetJob
      });

      const newResumeId = ResumeStorageService.saveResumeById(result.resume);
      setResumeId(newResumeId);

      updateProgress(GenerationStatus.COMPLETED, 100, 'Resume generated successfully!');
      toast.success('Resume generated successfully!');

      setTimeout(() => {
        setGenerationState(null);
        router.push(`/resume/${newResumeId}`);
      }, 1000);

    } catch (error) {
      console.error('Resume generation failed:', error);
      updateProgress(GenerationStatus.FAILED, 0, 'Generation failed');
      toast.error('Failed to generate resume. Please try again.');

      setTimeout(() => {
        setGenerationState(null);
      }, 2000);
    }
  };

  const handleAutoApply = async () => {
    if (!job) return;

    const profile = ProfileStorageService.getProfile();

    if (!profile) {
      toast.error('Please create your profile first');
      router.push('/dashboard/profile');
      return;
    }

    if (!profile.baseResume) {
      toast.error('Please generate a base resume from your profile first');
      router.push('/dashboard/profile');
      return;
    }

    if (!resumeId) {
      toast.error('Please generate a tailored resume for this job first');
      return;
    }

    if (!job.apply_url) {
      toast.error('No application URL available for this job');
      return;
    }

    // Load the generated resume
    const resume = ResumeStorageService.loadResumeById(resumeId);
    if (!resume) {
      toast.error('Resume not found');
      return;
    }

    try {
      // Save application as pending
      const application = ApplicationStorageService.saveApplication({
        job_id: job.id,
        status: 'pending',
        filled_data: {}
      });

      setAutoApplyStep('navigating');
      setAutoApplyError(null);

      // Step 1: Initialize and navigate
      const initResult = await initAutoApplyAction(job.apply_url, {
        profile,
        resume
      });

      if (!initResult.success) {
        if (initResult.unknownQuestions && initResult.unknownQuestions.length > 0) {
          // Need user input for unknown questions
          setUnknownQuestions(initResult.unknownQuestions);
          setShowQuestionDialog(true);
          setAutoApplyStep('filling');
          ApplicationStorageService.updateApplication(application.id, { status: 'filling' });
          return;
        }

        throw new Error(initResult.error || 'Failed to initialize application');
      }

      // Step 2: Get preview
      setAutoApplyStep('preview');
      ApplicationStorageService.updateApplication(application.id, { status: 'preview' });

      const previewResult = await fillUnknownFieldsAction(job.apply_url, {
        profile,
        resume
      }, []);

      if (!previewResult.success || !previewResult.preview) {
        throw new Error(previewResult.error || 'Failed to generate preview');
      }

      // Show preview modal
      setApplicationPreview(previewResult.preview);
      setShowPreviewModal(true);
      setAutoApplyStep('awaiting_confirmation');

      // Store preview data
      ApplicationStorageService.updateApplication(application.id, {
        preview_data: previewResult.preview
      });

    } catch (error) {
      console.error('Auto-apply failed:', error);
      setAutoApplyStep('failed');
      setAutoApplyError(error instanceof Error ? error.message : 'Unknown error');
      toast.error('Auto-apply failed. Please try manual application.');

      // Mark as failed
      const apps = ApplicationStorageService.getApplicationsByJobId(job.id);
      if (apps.length > 0) {
        ApplicationStorageService.updateApplication(apps[apps.length - 1].id, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  };

  const handleUnknownQuestionsSubmit = async (answers: ApplicationDetail[]) => {
    if (!job) return;

    const profile = ProfileStorageService.getProfile();
    if (!profile) return;

    const resume = resumeId ? ResumeStorageService.loadResumeById(resumeId) : null;
    if (!resume) return;

    try {
      // Save answers to profile
      const updatedProfile = {
        ...profile,
        additional_details: [
          ...(profile.additional_details || []),
          ...answers
        ]
      };
      ProfileStorageService.saveProfile(updatedProfile);

      setShowQuestionDialog(false);
      setAutoApplyStep('filling');

      // Fill fields with answers and get preview
      const previewResult = await fillUnknownFieldsAction(job.apply_url!, {
        profile: updatedProfile,
        resume
      }, answers);

      if (!previewResult.success || !previewResult.preview) {
        throw new Error(previewResult.error || 'Failed to generate preview');
      }

      setApplicationPreview(previewResult.preview);
      setShowPreviewModal(true);
      setAutoApplyStep('awaiting_confirmation');

      toast.success('Answers saved to your profile');
    } catch (error) {
      console.error('Failed to process answers:', error);
      toast.error('Failed to process your answers');
      setAutoApplyStep('failed');
      setAutoApplyError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleSubmitApplication = async () => {
    if (!job || !applicationPreview) return;

    const profile = ProfileStorageService.getProfile();
    if (!profile) return;

    const resume = resumeId ? ResumeStorageService.loadResumeById(resumeId) : null;
    if (!resume) return;

    setIsSubmitting(true);
    setAutoApplyStep('submitting');
    setShowPreviewModal(false);

    try {
      const result = await submitApplicationAction(job.apply_url!, {
        profile,
        resume
      }, profile.additional_details);

      if (result.success) {
        setAutoApplyStep('completed');
        toast.success('Application submitted successfully!');

        // Update application status
        const apps = ApplicationStorageService.getApplicationsByJobId(job.id);
        if (apps.length > 0) {
          ApplicationStorageService.updateApplication(apps[apps.length - 1].id, {
            status: 'submitted',
            submitted_at: Date.now()
          });
        }

        setHasApplied(true);

        // Reset after delay
        setTimeout(() => {
          setAutoApplyStep(null);
          setApplicationPreview(null);
        }, 3000);
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      setAutoApplyStep('failed');
      setAutoApplyError(error instanceof Error ? error.message : 'Submission failed');
      toast.error('Failed to submit application');

      // Update application status
      const apps = ApplicationStorageService.getApplicationsByJobId(job.id);
      if (apps.length > 0) {
        ApplicationStorageService.updateApplication(apps[apps.length - 1].id, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Submission failed'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAutoApply = () => {
    setShowPreviewModal(false);
    setAutoApplyStep(null);
    setApplicationPreview(null);
    setAutoApplyError(null);
    toast.info('Auto-apply cancelled');
  };

  const handleDelete = () => {
    if (!job) return;

    if (confirm('Are you sure you want to delete this job?')) {
      const success = JobStorageService.deleteJob(job.id);
      if (success) {
        toast.success('Job deleted successfully');
        router.push('/dashboard/jobs');
      } else {
        toast.error('Failed to delete job');
      }
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 animate-spin border-primary"></div>
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Job not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isGenerating = !!generationState;
  const hasResume = !!resumeId;
  const isAutoApplying = !!autoApplyStep && autoApplyStep !== 'completed' && autoApplyStep !== 'failed';

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6 max-w-5xl">
      {/* Auto-Apply Progress */}
      {autoApplyStep && autoApplyStep !== 'awaiting_confirmation' && (
        <ApplicationProgress
          currentStep={autoApplyStep}
          error={autoApplyError || undefined}
        />
      )}

      {/* Question Dialog */}
      <NewQuestionDialog
        open={showQuestionDialog}
        onOpenChange={setShowQuestionDialog}
        questions={unknownQuestions}
        onSubmit={handleUnknownQuestionsSubmit}
      />

      {/* Preview Modal */}
      <ApplicationPreviewModal
        open={showPreviewModal}
        onOpenChange={setShowPreviewModal}
        preview={applicationPreview}
        onConfirm={handleSubmitApplication}
        onCancel={handleCancelAutoApply}
        isSubmitting={isSubmitting}
      />
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard/jobs')}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">
            Job Details
          </h1>
        </div>
      </div>

      {/* Job Header Card */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-1">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl md:text-2xl break-words">
                    {job.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <CardDescription className="text-base truncate">
                      {job.company}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex gap-2 shrink-0">
              {isGenerating && (
                <Badge variant="default" className="shrink-0">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Generating
                </Badge>
              )}
              {!isGenerating && hasResume && (
                <Badge variant="secondary" className="shrink-0">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Resume Ready
                </Badge>
              )}
              {hasApplied && (
                <Badge variant="default" className="shrink-0 bg-green-600">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Applied
                </Badge>
              )}
              {isAutoApplying && (
                <Badge variant="default" className="shrink-0">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Auto-Applying
                </Badge>
              )}
            </div>
          </div>

          {/* Job Meta Information */}
          <div className="flex flex-wrap gap-3 md:gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="truncate">{formatDate(job.timestamp)}</span>
            </div>
            {job.remote_allowed && (
              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 shrink-0" />
                <span>Remote Allowed</span>
              </div>
            )}
            {job.is_easy_apply && (
              <Badge variant="outline" className="shrink-0">
                Easy Apply
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Control Panel - Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Control Panel</CardTitle>
          <CardDescription>Manage your application for this job</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Generation Progress */}
          {isGenerating && generationState && (
            <Alert className="bg-primary/5 border-primary/20">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{generationState.currentStep}</span>
                    <span className="text-sm text-muted-foreground">{generationState.progress}%</span>
                  </div>
                  <Progress value={generationState.progress} className="h-2" />
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Generate/View Resume Button */}
            {isGenerating ? (
              <Button
                variant="outline"
                size="lg"
                disabled
                className="w-full"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Resume...
              </Button>
            ) : hasResume ? (
              <Button
                variant="default"
                size="lg"
                className="w-full"
                onClick={() => router.push(`/resume/${resumeId}`)}
              >
                <FileText className="mr-2 h-4 w-4" />
                View Resume
              </Button>
            ) : (
              <Button
                variant="default"
                size="lg"
                className="w-full"
                onClick={handleGenerateResume}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Resume
              </Button>
            )}

            {/* Auto-Apply Button */}
            {hasResume && job.apply_url && !hasApplied && (
              <Button
                variant="default"
                size="lg"
                className="w-full"
                onClick={handleAutoApply}
                disabled={isAutoApplying || isGenerating}
              >
                <Zap className="mr-2 h-4 w-4" />
                Auto-Apply
              </Button>
            )}

            {/* Apply Manually Button */}
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => {
                if (job.apply_url) {
                  window.open(job.apply_url, '_blank');
                } else if (job.url) {
                  window.open(job.url, '_blank');
                } else {
                  toast.error('No application URL available');
                }
              }}
              disabled={!job.apply_url && !job.url}
            >
              <Send className="mr-2 h-4 w-4" />
              {hasApplied ? 'Applied' : 'Apply Manually'}
            </Button>
          </div>

          <Separator />

          {/* Secondary Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="default"
              className="w-full"
              onClick={() => router.push(`/dashboard/jobs?edit=${job.id}`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>

            {job.url && (
              <Button
                variant="outline"
                size="default"
                className="w-full"
                onClick={() => window.open(job.url, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Posting
              </Button>
            )}

            <Button
              variant="outline"
              size="default"
              className="w-full text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
              {job.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Raw Content (Collapsed by Default) */}
      {job.raw_content && job.raw_content !== job.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Details</CardTitle>
            <CardDescription>Full job posting content</CardDescription>
          </CardHeader>
          <CardContent>
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Show full content
              </summary>
              <div className="mt-4 prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap text-xs md:text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                  {job.raw_content}
                </pre>
              </div>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

