'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ResumeStorageService } from '@/services/resumeStorage';
import { ProfileStorageService } from '@/services/profileStorage';
import { Resume } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Trash2, Copy, Download, Plus, FileText, Clock, Hash, User, Briefcase, Target, Eye } from 'lucide-react';
import { CreateResumeWizard } from '@/components/resumeGenerator/CreateResumeWizard';

interface DashboardResume {
  id: string;
  name: string;
  position: string;
  timestamp: number;
  type: 'base' | 'job-specific';
  profileId?: string;
  profileName?: string;
  targetCompany?: string;
  resume?: Resume;
}

export default function DashboardPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<DashboardResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    loadAllResumes();
  }, []);

  const loadAllResumes = () => {
    const allResumes: DashboardResume[] = [];

    // Load base resume from user profile
    const userProfile = ProfileStorageService.getProfile();
    if (userProfile?.baseResume) {
      allResumes.push({
        id: 'user-base-resume',
        name: userProfile.baseResume.name,
        position: userProfile.baseResume.position,
        timestamp: userProfile.timestamp,
        type: 'base',
        profileName: userProfile.name,
        resume: userProfile.baseResume
      });
    }

    // Load job-specific resumes from storage
    const savedResumes = ResumeStorageService.getSavedResumesList();
    savedResumes.forEach(resumeInfo => {
      const resume = ResumeStorageService.loadResumeById(resumeInfo.id);
      if (resume) {
        allResumes.push({
          id: resumeInfo.id,
          name: resumeInfo.name,
          position: resumeInfo.position,
          timestamp: resumeInfo.timestamp,
          type: 'job-specific',
          targetCompany: resume.generationMetadata?.targetJob?.company,
          resume
        });
      }
    });

    // Sort by timestamp (newest first)
    allResumes.sort((a, b) => b.timestamp - a.timestamp);

    setResumes(allResumes);
    setLoading(false);
  };

  const handleDeleteResume = (dashboardResume: DashboardResume, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation

    const message = dashboardResume.type === 'base'
      ? 'Delete this base resume? This will remove it from your profile.'
      : 'Delete this job-specific resume?';

    if (confirm(message)) {
      if (dashboardResume.type === 'base') {
        // Remove base resume from user profile
        ProfileStorageService.updateProfile({
          baseResume: undefined
        });
        toast.success('Base resume removed from your profile');
      } else {
        // Delete job-specific resume
        ResumeStorageService.deleteResumeById(dashboardResume.id);
        toast.success('Resume deleted successfully');
      }
      loadAllResumes(); // Refresh list
    }
  };

  const handleViewResume = (dashboardResume: DashboardResume) => {
    if (dashboardResume.type === 'base') {
      // View base resume in builder
      router.push('/resume/base');
    } else {
      // Job-specific resumes have their own page
      router.push(`/resume/${dashboardResume.id}`);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 animate-spin border-primary"></div>
          <p className="text-muted-foreground">Loading resumes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Resumes</h1>
          <p className="mt-2 text-muted-foreground">
            {resumes.length} total • {resumes.filter(r => r.type === 'base').length > 0 ? '1 base resume' : 'No base resume'} • {resumes.filter(r => r.type === 'job-specific').length} job-specific
          </p>
        </div>
        <Button onClick={() => setWizardOpen(true)} size="lg">
          <Plus className="mr-2 w-4 h-4" />
          Create New Resume
        </Button>
      </div>

      {/* Resume List */}
      {resumes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col justify-center items-center py-16">
            <FileText className="mb-4 w-16 h-16 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-semibold">
              No Resumes Yet
            </h2>
            <p className="mb-6 max-w-md text-center text-muted-foreground">
              Get started by creating your first AI-optimized resume
            </p>
            <Button onClick={() => setWizardOpen(true)} size="lg">
              <Plus className="mr-2 w-4 h-4" />
              Create Your First Resume
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Card
              key={resume.id}
              className="transition-shadow cursor-pointer hover:shadow-lg"
              onClick={() => handleViewResume(resume)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex gap-2 items-start">
                      <CardTitle className="truncate">
                        {resume.name}
                      </CardTitle>
                      {resume.type === 'base' ? (
                        <Badge variant="secondary" className="shrink-0">
                          <User className="w-3 h-3 mr-1" />
                          Base
                        </Badge>
                      ) : (
                        <Badge variant="default" className="shrink-0">
                          <Target className="w-3 h-3 mr-1" />
                          Job
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {resume.position}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteResume(resume, e)}
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

                {resume.type === 'base' && resume.profileName && (
                  <div className="flex gap-2 items-center text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Profile: <span className="font-medium text-foreground">{resume.profileName}</span></span>
                  </div>
                )}

                {resume.type === 'job-specific' && resume.targetCompany && (
                  <div className="flex gap-2 items-center text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Target: <span className="font-medium text-foreground">{resume.targetCompany}</span></span>
                  </div>
                )}

                {resume.resume && (
                  <div className="pt-2 border-t">
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{resume.resume.workExperience?.length || 0} jobs</span>
                      <span>•</span>
                      <span>{resume.resume.skills?.length || 0} skills</span>
                      <span>•</span>
                      <span>{resume.resume.education?.length || 0} education</span>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="gap-2">
                {resume.type === 'job-specific' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = ResumeStorageService.getResumeUrl(resume.id);
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
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (resume.resume) {
                          const json = JSON.stringify(resume.resume, null, 2);
                          const blob = new Blob([json], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `${resume.name.replace(/\s+/g, '_')}_resume.json`;
                          link.click();
                          toast.success('Resume downloaded!');
                        }
                      }}
                    >
                      <Download className="mr-2 w-3 h-3" />
                      Download
                    </Button>
                  </>
                )}
                {resume.type === 'base' && (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/resume/base');
                      }}
                    >
                      <Eye className="mr-2 w-3 h-3" />
                      View in Builder
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/dashboard/profile');
                      }}
                    >
                      <User className="mr-2 w-3 h-3" />
                      View Profile
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Resume Wizard */}
      <CreateResumeWizard
        open={wizardOpen}
        onOpenChange={(open) => {
          setWizardOpen(open);
          if (!open) {
            // Refresh resumes when wizard closes
            loadAllResumes();
          }
        }}
      />
    </div>
  );
}
