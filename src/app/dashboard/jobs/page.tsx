'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JobStorageService, SavedJob } from '@/services/jobStorage';
import { TargetJobJson } from '@/types';
import { TargetJobForm } from '@/components/resumeGenerator/forms/TargetJobForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Briefcase, Trash2, Edit, CheckCircle, Clock, Building2, ExternalLink } from 'lucide-react';

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<SavedJob | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = () => {
    const savedJobs = JobStorageService.getAllJobs();
    setJobs(savedJobs);
    setLoading(false);

    // Check which job is currently active
    if (typeof window !== 'undefined') {
      const currentJob = localStorage.getItem('atsresume_target_job');
      if (currentJob) {
        const job = JSON.parse(currentJob);
        const active = savedJobs.find(j => j.name === job.name && j.company === job.company);
        if (active) setCurrentJobId(active.id);
      }
    }
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
        if (currentJobId === id) setCurrentJobId(null);
        loadJobs();
      } else {
        toast.error('Failed to delete job');
      }
    }
  };

  const handleSetCurrent = (id: string) => {
    JobStorageService.setCurrentJob(id);
    setCurrentJobId(id);
    toast.success('Job set as target');
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

  const emptyJob: TargetJobJson = {
    name: '',
    url: '',
    company: '',
    description: '',
    raw_content: ''
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your target job postings ({jobs.length} {jobs.length === 1 ? 'job' : 'jobs'})
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Job
        </Button>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Jobs Yet</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Add your first target job to start creating tailored resumes
            </p>
            <Button onClick={() => setShowCreateDialog(true)} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className={`${
                currentJobId === job.id ? 'border-primary border-2' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CardTitle className="truncate">{job.name}</CardTitle>
                      {currentJobId === job.id && (
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <CardDescription className="truncate">
                        {job.company}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {job.description}
                </p>
                
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Posting
                  </a>
                )}
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(job.timestamp)}</span>
                </div>
              </CardContent>

              <CardFooter className="gap-2 flex-col sm:flex-row">
                <Button
                  variant={currentJobId === job.id ? "default" : "outline"}
                  size="sm"
                  className="w-full sm:flex-1"
                  onClick={() => handleSetCurrent(job.id)}
                  disabled={currentJobId === job.id}
                >
                  <CheckCircle className="mr-2 h-3 w-3" />
                  {currentJobId === job.id ? 'Target Job' : 'Set as Target'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setEditingJob(job)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => handleDelete(job.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
    </div>
  );
}

