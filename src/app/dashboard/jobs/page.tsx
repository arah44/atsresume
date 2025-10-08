'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JobStorageService, SavedJob } from '@/services/jobStorage';
import { ResumeStorageService } from '@/services/resumeStorage';
import { ProfileStorageService } from '@/services/profileStorage';
import { TargetJobJson, GenerationStatus } from '@/types';
import { TargetJobForm } from '@/components/resumeGenerator/forms/TargetJobForm';
import { BulkJobImport } from '@/components/resumeGenerator/BulkJobImport';
import { generateResumeAction } from '@/app/actions/resumeGeneration';
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
import { Plus, Briefcase, Trash2, Edit, Clock, Building2, ExternalLink, MoreVertical, FileText, Link2, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface JobGenerationState {
  jobId: string;
  status: GenerationStatus;
  progress: number;
  currentStep: string;
}

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<SavedJob | null>(null);
  const [generatingJobs, setGeneratingJobs] = useState<Map<string, JobGenerationState>>(new Map());

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = () => {
    const savedJobs = JobStorageService.getAllJobs();
    setJobs(savedJobs);
    setLoading(false);
  };

  const handleCreate = (data: TargetJobJson) => {
    const id = JobStorageService.saveJob(data);
    toast.success('Job saved successfully');
    setShowCreateDialog(false);
    loadJobs();
  };

  const handleUpdate = (data: TargetJobJson) => {
    if (!editingJob) return;

    const success = JobStorageService.updateJob(editingJob.id, data);
    if (success) {
      toast.success('Job updated successfully');
      setEditingJob(null);
      loadJobs();
    } else {
      toast.error('Failed to update job');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      const success = JobStorageService.deleteJob(id);
      if (success) {
        toast.success('Job deleted successfully');
        loadJobs();
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

  const findResumeForJob = (job: SavedJob): string | null => {
    const savedResumes = ResumeStorageService.getSavedResumesList();
    for (const resumeInfo of savedResumes) {
      const resume = ResumeStorageService.loadResumeById(resumeInfo.id);
      if (resume?.generationMetadata?.targetJob) {
        const targetJob = resume.generationMetadata.targetJob;
        // Match by name and company
        if (targetJob.name === job.name && targetJob.company === job.company) {
          return resume.id || null;
        }
      }
    }
    return null;
  };

  const handleViewResume = (job: SavedJob) => {
    const resumeId = findResumeForJob(job);
    if (resumeId) {
      router.push(`/resume/${resumeId}`);
    } else {
      toast.error('No resume found for this job. Generate one first!');
    }
  };

  const handleGenerateResume = async (job: SavedJob) => {
    // Check if user has a profile with base resume
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

    // Update generation state
    const updateProgress = (status: GenerationStatus, progress: number, step: string) => {
      setGeneratingJobs(prev => {
        const newMap = new Map(prev);
        newMap.set(job.id, { jobId: job.id, status, progress, currentStep: step });
        return newMap;
      });
    };

    try {
      updateProgress(GenerationStatus.PENDING, 0, 'Initializing...');

      // Step 1: Analyzing job
      updateProgress(GenerationStatus.ANALYZING_JOB, 25, 'Analyzing job requirements...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX

      // Step 2: Extracting keywords
      updateProgress(GenerationStatus.EXTRACTING_KEYWORDS, 50, 'Extracting ATS keywords...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Generating resume
      updateProgress(GenerationStatus.GENERATING_RESUME, 75, 'Generating optimized resume...');

      const targetJob: TargetJobJson = {
        name: job.name,
        company: job.company,
        url: job.url,
        description: job.description,
        raw_content: job.raw_content
      };

      const result = await generateResumeAction({
        baseResume: profile.baseResume,
        targetJob
      });

      // Save the resume
      const resumeId = ResumeStorageService.saveResumeById(result.resume);

      updateProgress(GenerationStatus.COMPLETED, 100, 'Resume generated successfully!');

      toast.success('Resume generated successfully!');

      // Remove from generating state after a short delay
      setTimeout(() => {
        setGeneratingJobs(prev => {
          const newMap = new Map(prev);
          newMap.delete(job.id);
          return newMap;
        });
        loadJobs(); // Refresh to show the resume badge
        router.push(`/resume/${resumeId}`);
      }, 1000);

    } catch (error) {
      console.error('Resume generation failed:', error);
      updateProgress(GenerationStatus.FAILED, 0, 'Generation failed');
      toast.error('Failed to generate resume. Please try again.');

      // Remove from generating state
      setTimeout(() => {
        setGeneratingJobs(prev => {
          const newMap = new Map(prev);
          newMap.delete(job.id);
          return newMap;
        });
      }, 2000);
    }
  };

  const handleBulkImport = (importedJobs: TargetJobJson[]) => {
    let successCount = 0;
    importedJobs.forEach(job => {
      try {
        JobStorageService.saveJob(job);
        successCount++;
      } catch (error) {
        console.error('Failed to save job:', error);
      }
    });

    if (successCount > 0) {
      toast.success(`Successfully added ${successCount} job(s)`);
      setShowBulkImportDialog(false);
      loadJobs();
    }
  };

  const emptyJob: TargetJobJson = {
    name: '',
    url: '',
    company: '',
    description: '',
    raw_content: ''
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 animate-spin border-primary"></div>
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Job Management</h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-muted-foreground">
            Manage your target job postings ({jobs.length} {jobs.length === 1 ? 'job' : 'jobs'})
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <Button
            onClick={() => setShowBulkImportDialog(true)}
            size="default"
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Link2 className="mr-2 h-4 w-4" />
            <span className="sm:inline">Import URLs</span>
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="default"
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Job
          </Button>
        </div>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 md:py-16">
            <Briefcase className="h-12 w-12 md:h-16 md:w-16 mb-4 text-muted-foreground" />
            <h2 className="text-xl md:text-2xl font-semibold mb-2">No Jobs Yet</h2>
            <p className="text-sm md:text-base text-muted-foreground text-center max-w-md mb-6 px-4">
              Add your first target job to start creating tailored resumes
            </p>
            <Button onClick={() => setShowCreateDialog(true)} size="default" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => {
            const hasResume = !!findResumeForJob(job);
            const generationState = generatingJobs.get(job.id);
            const isGenerating = !!generationState;

            return (
              <Card key={job.id} className={isGenerating ? 'border-primary' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex flex-wrap gap-2 items-center">
                        <CardTitle className="text-base md:text-lg truncate">{job.name}</CardTitle>
                        {isGenerating && (
                          <Badge variant="default" className="shrink-0">
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            <span className="text-xs">Generating</span>
                          </Badge>
                        )}
                        {!isGenerating && hasResume && (
                          <Badge variant="secondary" className="shrink-0">
                            <CheckCircle className="mr-1 h-3 w-3" />
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setEditingJob(job)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Job Info
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(job.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pb-3">
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
                      <ExternalLink className="h-3 w-3" />
                      View Posting
                    </a>
                  )}

                  <div className="flex gap-1.5 items-center text-xs md:text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="truncate">{formatDate(job.timestamp)}</span>
                  </div>

                  {/* Generation Progress */}
                  {isGenerating && generationState && (
                    <div className="space-y-2 pt-3 border-t">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs md:text-sm font-medium text-primary line-clamp-1 flex-1">
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
                    >
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="text-sm">Generating...</span>
                    </Button>
                  ) : hasResume ? (
                    <Button
                      variant="default"
                      size="default"
                      className="w-full"
                      onClick={() => handleViewResume(job)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Resume
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="default"
                      className="w-full"
                      onClick={() => handleGenerateResume(job)}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Resume
                    </Button>
                  )}
                </CardFooter>
              </Card>
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

