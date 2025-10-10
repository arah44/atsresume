'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, SavedJob } from '@/services/repositories';
import { deleteResumeAction } from '@/app/actions/resumeActions';
import { updateProfileAction } from '@/app/actions/profileActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash2, Copy, Download, Plus, Clock, User, Briefcase, Target, Eye } from 'lucide-react';
import { CreateResumeWizard } from '@/components/dialogs/CreateResumeWizard';
import Link from 'next/link';

interface DashboardResume {
  id: string;
  name: string;
  position: string;
  timestamp: number;
}

interface DashboardClientPageProps {
  initialProfile: UserProfile | null;
  initialResumesList: DashboardResume[];
  initialJobs: SavedJob[];
}

export function DashboardClientPage({
  initialProfile,
  initialResumesList,
  initialJobs
}: DashboardClientPageProps) {
  const router = useRouter();
  const [wizardOpen, setWizardOpen] = useState(false);

  const handleDeleteResume = async (resumeId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (resumeId === initialProfile?.baseResumeId) {
      // Remove base resume from profile
      if (confirm('Delete this base resume? This will remove it from your profile.')) {
        await updateProfileAction({ baseResumeId: undefined });
        toast.success('Base resume removed from your profile');
        router.refresh();
      }
    } else {
      // Delete job-specific resume
      if (confirm('Delete this job-specific resume?')) {
        const result = await deleteResumeAction(resumeId);
        if (result.success) {
          toast.success('Resume deleted successfully');
          router.refresh();
        } else {
          toast.error('Failed to delete resume');
        }
      }
    }
  };

  const handleViewResume = (resumeId: string) => {
    if (resumeId === 'base-resume') {
      router.push('/resume/base');
    } else {
      router.push(`/resume/${resumeId}`);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const baseResume = initialProfile?.baseResumeId ? {
    id: initialProfile.baseResumeId,
    name: initialProfile.name,
    position: 'Base Resume',
    timestamp: initialProfile.timestamp,
    type: 'base' as const,
    profileName: initialProfile.name,
    resume: null // Will be fetched separately
  } : null;

  return (
    <div className="container p-4 mx-auto space-y-6 sm:p-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Resumes</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            {baseResume ? '1 base resume' : 'No base resume'} • {initialResumesList.length} job-specific
          </p>
        </div>
        <Button onClick={() => setWizardOpen(true)} size="lg" className="w-full sm:w-auto">
          <Plus className="mr-2 w-4 h-4" />
          Create New Resume
        </Button>
      </div>

      {/* Base Resume Section */}
      {baseResume && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <h2 className="text-xl font-semibold">Base Resume</h2>
            <Badge variant="secondary">
              <User className="mr-1 w-3 h-3" />
              Master Template
            </Badge>
          </div>
          <Card
            className="transition-shadow cursor-pointer hover:shadow-lg border-primary/20"
            onClick={() => handleViewResume(baseResume.id)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2 min-w-0">
                  <CardTitle className="text-2xl truncate">
                    {baseResume.name}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {baseResume.position}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDeleteResume(baseResume.id, e)}
                  className="w-8 h-8 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex gap-2 items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{formatDate(baseResume.timestamp)}</span>
              </div>

              {baseResume.profileName && (
                <div className="flex gap-2 items-center text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Profile: <span className="font-medium text-foreground">{baseResume.profileName}</span></span>
                </div>
              )}

              <div className="pt-2 border-t">
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>Base template</span>
                  <span>•</span>
                  <span>Master resume</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-2 sm:flex-row">
              <Button
                variant="default"
                className="flex-1 w-full"
                asChild
              >
                <Link href="/resume/base">
                  <Eye className="mr-2 w-3 h-3" />
                  View in Builder
                </Link>
              </Button>
              <Button
                variant="outline"
                className="flex-1 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push('/dashboard/profile');
                }}
              >
                <User className="mr-2 w-3 h-3" />
                View Profile
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Job-Specific Resumes Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <h2 className="text-xl font-semibold">Job-Specific Resumes</h2>
            {initialResumesList.length > 0 && (
              <Badge variant="outline">{initialResumesList.length}</Badge>
            )}
          </div>
        </div>

        {initialResumesList.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col justify-center items-center py-16">
              <Target className="mb-4 w-16 h-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">
                No Job-Specific Resumes Yet
              </h3>
              <p className="mb-6 max-w-md text-center text-muted-foreground">
                Create tailored resumes optimized for specific job postings
              </p>
              <Button onClick={() => setWizardOpen(true)} size="lg">
                <Plus className="mr-2 w-4 h-4" />
                Create Job-Specific Resume
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {initialResumesList.map((resume) => (
              <Card
                key={resume.id}
                className="transition-shadow cursor-pointer hover:shadow-lg"
                onClick={() => handleViewResume(resume.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex gap-2 items-start">
                        <CardTitle className="truncate">
                          {resume.name}
                        </CardTitle>
                        <Badge variant="default" className="shrink-0">
                          <Target className="mr-1 w-3 h-3" />
                          Job
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {resume.position}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteResume(resume.id, e)}
                      className="w-8 h-8 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex gap-2 items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(resume.timestamp)}</span>
                  </div>
                </CardContent>

                <CardFooter className="flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = `${window.location.origin}/resume/${resume.id}`;
                      navigator.clipboard.writeText(url);
                      toast.success('Link copied to clipboard!');
                    }}
                  >
                    <Copy className="mr-2 w-3 h-3" />
                    Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Download would require fetching full resume data
                      toast.info('Opening resume...');
                      router.push(`/resume/${resume.id}`);
                    }}
                  >
                    <Download className="mr-2 w-3 h-3" />
                    View
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Resume Wizard */}
      <CreateResumeWizard
        open={wizardOpen}
        onOpenChange={(open) => {
          setWizardOpen(open);
          if (!open) {
            // Refresh to get updated data
            router.refresh();
          }
        }}
        initialProfile={initialProfile}
        initialJobs={initialJobs}
      />
    </div>
  );
}

