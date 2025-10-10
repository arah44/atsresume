'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SavedJob } from '@/services/repositories';
import { TargetJobJson, GenerationStatus, ApplicationPreview, ApplicationDetail } from '@/types';
import { generateResumeAction } from '@/app/actions/resumeGeneration';
import { saveResumeAction } from '@/app/actions/resumeActions';
import { deleteJobAction } from '@/app/actions/jobActions';
import {
  initAutoApplyAction,
  fillUnknownFieldsAction,
  submitApplicationAction
} from '@/app/actions/jobApplication';
import { saveApplicationAction, updateApplicationAction } from '@/app/actions/applicationActions';
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
  Zap
} from 'lucide-react';

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

interface JobDetailsClientPageProps {
  job: SavedJob;
  resumeId: string | null;
  hasProfile: boolean;
  hasBaseResume: boolean;
  hasApplied: boolean;
}

export function JobDetailsClientPage({
  job,
  resumeId: initialResumeId,
  hasProfile,
  hasBaseResume,
  hasApplied: initialHasApplied
}: JobDetailsClientPageProps) {
  const router = useRouter();
  const [resumeId, setResumeId] = useState<string | null>(initialResumeId);
  const [generationState, setGenerationState] = useState<JobGenerationState | null>(null);
  const [hasApplied, setHasApplied] = useState(initialHasApplied);

  // Auto-apply states
  const [autoApplyStep, setAutoApplyStep] = useState<AutoApplyStep | null>(null);
  const [autoApplyError, setAutoApplyError] = useState<string | null>(null);
  const [applicationPreview, setApplicationPreview] = useState<ApplicationPreview | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [unknownQuestions, setUnknownQuestions] = useState<Array<{ question: string; field_type: string }>>([]);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerateResume = async () => {
    if (!hasProfile) {
      toast.error('Please create your profile first');
      router.push('/dashboard/profile');
      return;
    }

    if (!hasBaseResume) {
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

      // Generate resume using server action (fetches baseResume server-side)
      const result = await generateResumeAction({
        baseResume: { name: '', position: '' } as any, // Will be fetched server-side
        targetJob
      });

      // Save resume using server action with jobId
      const saveResult = await saveResumeAction(result.resume, job.id);

      if (saveResult.success && saveResult.id) {
        setResumeId(saveResult.id);
      }

      updateProgress(GenerationStatus.COMPLETED, 100, 'Resume generated successfully!');
      toast.success('Resume generated successfully!');

      setTimeout(() => {
        setGenerationState(null);
        if (saveResult.id) {
          router.push(`/resume/${saveResult.id}`);
        }
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
    if (!hasProfile) {
      toast.error('Please create your profile first');
      router.push('/dashboard/profile');
      return;
    }

    if (!hasBaseResume) {
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

    try {
      // Save application as pending
      const appResult = await saveApplicationAction({
        job_id: job.id,
        status: 'pending',
        filled_data: {}
      });

      setAutoApplyStep('navigating');
      setAutoApplyError(null);

      // Note: Auto-apply would need profile and resume data
      // This will need enhancement to fetch from server
      const initResult = await initAutoApplyAction(job.apply_url, {
        profile: {} as any, // Will be fetched server-side
        resume: {} as any   // Will be fetched server-side
      });

      if (!initResult.success) {
        if (initResult.unknownQuestions && initResult.unknownQuestions.length > 0) {
          setUnknownQuestions(initResult.unknownQuestions);
          setShowQuestionDialog(true);
          setAutoApplyStep('filling');

          if (appResult.id) {
            await updateApplicationAction(appResult.id, { status: 'filling' });
          }
          return;
        }

        throw new Error(initResult.error || 'Failed to initialize application');
      }

      // Continue with preview...
      setAutoApplyStep('preview');

      const previewResult = await fillUnknownFieldsAction(job.apply_url, {
        profile: {} as any,
        resume: {} as any
      }, []);

      if (!previewResult.success || !previewResult.preview) {
        throw new Error(previewResult.error || 'Failed to generate preview');
      }

      setApplicationPreview(previewResult.preview);
      setShowPreviewModal(true);
      setAutoApplyStep('awaiting_confirmation');

      if (appResult.id) {
        await updateApplicationAction(appResult.id, {
          preview_data: previewResult.preview
        });
      }

    } catch (error) {
      console.error('Auto-apply failed:', error);
      setAutoApplyStep('failed');
      setAutoApplyError(error instanceof Error ? error.message : 'Unknown error');
      toast.error('Auto-apply failed. Please try manual application.');
    }
  };

  const handleUnknownQuestionsSubmit = async (answers: ApplicationDetail[]) => {
    // Implementation would go here
    toast.info('This feature needs enhancement with server-side data fetching');
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    setAutoApplyStep('submitting');
    setShowPreviewModal(false);

    try {
      const result = await submitApplicationAction(job.apply_url!, {
        profile: {} as any,
        resume: {} as any
      }, []);

      if (result.success) {
        setAutoApplyStep('completed');
        toast.success('Application submitted successfully!');
        setHasApplied(true);

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

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this job?')) {
      const result = await deleteJobAction(job.id);
      if (result.success) {
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

