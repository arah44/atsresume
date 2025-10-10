'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SavedJob, SavedResume } from '@/services/repositories';
import { TargetJobJson, GenerationStatus } from '@/types';
import { TargetJobForm } from '@/components/resumeGenerator/forms/TargetJobForm';
import { BulkJobImport } from '@/components/resumeGenerator/BulkJobImport';
import { generateResumeAction } from '@/app/actions/resumeGeneration';
import { saveJobAction, updateJobAction, deleteJobAction } from '@/app/actions/jobActions';
import { saveResumeAction } from '@/app/actions/resumeActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { Plus, Briefcase, Trash2, Edit, Clock, Building2, ExternalLink, MoreVertical, FileText, Link2, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface JobGenerationState {
  jobId: string;
  status: GenerationStatus;
  progress: number;
  currentStep: string;
}

interface JobsClientPageProps {
  initialJobs: SavedJob[];
  hasProfile: boolean;
  hasBaseResume: boolean;
}

export function JobsClientPage({ initialJobs, hasProfile, hasBaseResume }: JobsClientPageProps) {
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<SavedJob | null>(null);
  const [generatingJobs, setGeneratingJobs] = useState<Map<string, JobGenerationState>>(new Map());

  const handleCreate = async (data: TargetJobJson) => {
    const result = await saveJobAction(data);
    if (result.success) {
      toast.success('Job saved successfully');
      setShowCreateDialog(false);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to save job');
    }
  };

  const handleUpdate = async (data: TargetJobJson) => {
    if (!editingJob) return;

    const result = await updateJobAction(editingJob.id, data);
    if (result.success) {
      toast.success('Job updated successfully');
      setEditingJob(null);
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to update job');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      const result = await deleteJobAction(id);
      if (result.success) {
        toast.success('Job deleted successfully');
        router.refresh();
      } else {
        toast.error('Failed to delete job');
      }
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const findResumeForJob = (job: SavedJob): boolean => {
    // This would need to be passed from server or fetched
    // For now, we'll use the generation metadata approach
    return false; // Simplified - will be enhanced with proper server-side check
  };

  const handleGenerateResume = async (job: SavedJob) => {
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
      setGeneratingJobs(prev => {
        const newMap = new Map(prev);
        newMap.set(job.id, { jobId: job.id, status, progress, currentStep: step });
        return newMap;
      });
    };

    try {
      updateProgress(GenerationStatus.PENDING, 0, 'Initializing...');
      await new Promise(resolve => setTimeout(resolve, 500));

      updateProgress(GenerationStatus.ANALYZING_JOB, 25, 'Analyzing job requirements...');
      await new Promise(resolve => setTimeout(resolve, 500));

      updateProgress(GenerationStatus.EXTRACTING_KEYWORDS, 50, 'Extracting ATS keywords...');
      await new Promise(resolve => setTimeout(resolve, 500));

      updateProgress(GenerationStatus.GENERATING_RESUME, 75, 'Generating optimized resume...');

      // Note: generateResumeAction will fetch the profile's baseResume from MongoDB
      const result = await generateResumeAction({
        baseResume: { name: '', position: '' } as any, // Will be fetched server-side
        targetJob: {
          name: job.name,
          company: job.company,
          url: job.url,
          description: job.description,
          raw_content: job.raw_content,
          apply_url: job.apply_url,
          is_easy_apply: job.is_easy_apply,
          remote_allowed: job.remote_allowed
        }
      });

      // Save the resume using server action with jobId
      const saveResult = await saveResumeAction(result.resume, job.id);

      updateProgress(GenerationStatus.COMPLETED, 100, 'Resume generated successfully!');
      toast.success('Resume generated successfully!');

      setTimeout(() => {
        setGeneratingJobs(prev => {
          const newMap = new Map(prev);
          newMap.delete(job.id);
          return newMap;
        });

        if (saveResult.success && saveResult.id) {
          router.push(`/resume/${saveResult.id}`);
        }
      }, 1000);

    } catch (error) {
      console.error('Resume generation failed:', error);
      updateProgress(GenerationStatus.FAILED, 0, 'Generation failed');
      toast.error('Failed to generate resume. Please try again.');

      setTimeout(() => {
        setGeneratingJobs(prev => {
          const newMap = new Map(prev);
          newMap.delete(job.id);
          return newMap;
        });
      }, 2000);
    }
  };

  const handleBulkImport = async (importedJobs: TargetJobJson[]) => {
    let successCount = 0;

    for (const job of importedJobs) {
      try {
        const result = await saveJobAction(job);
        if (result.success) {
          successCount++;
        }
      } catch (error) {
        console.error('Failed to save job:', error);
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully added ${successCount} job(s)`);
      setShowBulkImportDialog(false);
      router.refresh();
    }
  };

  const emptyJob: TargetJobJson = {
    name: '',
    url: '',
    company: '',
    description: '',
    raw_content: ''
  };

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Job Management</h1>
          <p className="mt-1 text-sm md:mt-2 md:text-base text-muted-foreground">
            Manage your target job postings ({initialJobs.length} {initialJobs.length === 1 ? 'job' : 'jobs'})
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <Button
            onClick={() => setShowBulkImportDialog(true)}
            size="default"
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Link2 className="mr-2 w-4 h-4" />
            <span className="sm:inline">Import URLs</span>
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="default"
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 w-4 h-4" />
            Add Job
          </Button>
        </div>
      </div>

      {/* Jobs List */}
      {initialJobs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col justify-center items-center py-12 md:py-16">
            <Briefcase className="mb-4 w-12 h-12 md:h-16 md:w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold md:text-2xl">No Jobs Yet</h2>
            <p className="px-4 mb-6 max-w-md text-sm text-center md:text-base text-muted-foreground">
              Add your first target job to start creating tailored resumes
            </p>
            <Button onClick={() => setShowCreateDialog(true)} size="default" className="w-full sm:w-auto">
              <Plus className="mr-2 w-4 h-4" />
              Add Your First Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {initialJobs.map((job) => {
            const hasResume = findResumeForJob(job);
            const generationState = generatingJobs.get(job.id);
            const isGenerating = !!generationState;

            return (
              <Link key={job.id} href={`/dashboard/jobs/${job.id}`} className="block">
                <Card
                  className={`cursor-pointer transition-all hover:shadow-md ${isGenerating ? 'border-primary' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex gap-2 justify-between items-start">
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex flex-wrap gap-2 items-center">
                          <CardTitle className="text-base truncate md:text-lg">{job.name}</CardTitle>
                          {isGenerating && (
                            <Badge variant="default" className="shrink-0">
                              <Loader2 className="mr-1 w-3 h-3 animate-spin" />
                              <span className="text-xs">Generating</span>
                            </Badge>
                          )}
                          {!isGenerating && hasResume && (
                            <Badge variant="secondary" className="shrink-0">
                              <CheckCircle className="mr-1 w-3 h-3" />
                              <span className="text-xs">Ready</span>
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1.5 items-center">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <CardDescription className="text-sm truncate">
                            {job.company}
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild disabled={isGenerating}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 shrink-0"
                            onClick={(e) => e.preventDefault()}
                          >
                            <MoreVertical className="w-4 h-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.preventDefault()}>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => { e.preventDefault(); setEditingJob(job); }}>
                            <Edit className="mr-2 w-4 h-4" />
                            Edit Job Info
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => { e.preventDefault(); handleDelete(job.id); }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 w-4 h-4" />
                            Delete Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-3 space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>

                    {job.url && (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-1.5 items-center text-sm text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Posting
                      </a>
                    )}

                    <div className="flex gap-1.5 items-center text-xs md:text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="truncate">{formatDate(job.timestamp)}</span>
                    </div>

                    {/* Generation Progress */}
                    {isGenerating && generationState && (
                      <div className="pt-3 space-y-2 border-t">
                        <div className="flex gap-2 justify-between items-center">
                          <span className="flex-1 text-xs font-medium md:text-sm text-primary line-clamp-1">
                            {generationState.currentStep}
                          </span>
                          <span className="text-xs md:text-sm text-muted-foreground shrink-0">
                            {generationState.progress}%
                          </span>
                        </div>
                        <Progress value={generationState.progress} className="h-2" />
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-3">
                    {isGenerating ? (
                      <Button
                        variant="outline"
                        size="default"
                        className="w-full"
                        disabled
                        onClick={(e) => e.preventDefault()}
                      >
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        <span className="text-sm">Generating...</span>
                      </Button>
                    ) : hasResume ? (
                      <Button
                        variant="default"
                        size="default"
                        className="w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          // Navigate to job details page which will show resume
                          router.push(`/dashboard/jobs/${job.id}`);
                        }}
                      >
                        <FileText className="mr-2 w-4 h-4" />
                        View Resume
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="default"
                        className="w-full"
                        onClick={(e) => { e.preventDefault(); handleGenerateResume(job); }}
                      >
                        <Sparkles className="mr-2 w-4 h-4" />
                        Generate Resume
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Job</DialogTitle>
            <DialogDescription>
              Add a new target job posting to your collection
            </DialogDescription>
          </DialogHeader>
          <TargetJobForm
            initialData={emptyJob}
            onSubmit={handleCreate}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingJob} onOpenChange={(open) => !open && setEditingJob(null)}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>
              Update job posting information
            </DialogDescription>
          </DialogHeader>
          {editingJob && (
            <TargetJobForm
              initialData={{
                name: editingJob.name,
                url: editingJob.url,
                company: editingJob.company,
                description: editingJob.description,
                raw_content: editingJob.raw_content
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingJob(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={showBulkImportDialog} onOpenChange={setShowBulkImportDialog}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
          <BulkJobImport
            onJobsImported={handleBulkImport}
            onCancel={() => setShowBulkImportDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

