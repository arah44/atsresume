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
  const [baseResume, setBaseResume] = useState<DashboardResume | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    loadAllResumes();
  }, []);

  const loadAllResumes = () => {
    // Load base resume from user profile
    const userProfile = ProfileStorageService.getProfile();
    if (userProfile?.baseResume) {
      setBaseResume({
        id: 'user-base-resume',
        name: userProfile.baseResume.name,
        position: userProfile.baseResume.position,
        timestamp: userProfile.timestamp,
        type: 'base',
        profileName: userProfile.name,
        resume: userProfile.baseResume
      });
    } else {
      setBaseResume(null);
    }

    // Load job-specific resumes from storage
    const jobSpecificResumes: DashboardResume[] = [];
    const savedResumes = ResumeStorageService.getSavedResumesList();
    savedResumes.forEach(resumeInfo => {
      const resume = ResumeStorageService.loadResumeById(resumeInfo.id);
      if (resume) {
        jobSpecificResumes.push({
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
    jobSpecificResumes.sort((a, b) => b.timestamp - a.timestamp);

    setResumes(jobSpecificResumes);
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

  return (
    <div className="container p-4 sm:p-6 mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Resumes</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            {baseResume ? '1 base resume' : 'No base resume'} • {resumes.length} job-specific
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
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Base Resume</h2>
            <Badge variant="secondary">
              <User className="w-3 h-3 mr-1" />
              Master Template
            </Badge>
          </div>
          <Card
            className="transition-shadow cursor-pointer hover:shadow-lg border-primary/20"
            onClick={() => handleViewResume(baseResume)}
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
                  onClick={(e) => handleDeleteResume(baseResume, e)}
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

              {baseResume.resume && (
                <div className="pt-2 border-t">
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{baseResume.resume.workExperience?.length || 0} jobs</span>
                    <span>•</span>
                    <span>{baseResume.resume.skills?.length || 0} skills</span>
                    <span>•</span>
                    <span>{baseResume.resume.education?.length || 0} education</span>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="default"
                size="sm"
                className="flex-1 w-full"
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
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Job-Specific Resumes</h2>
            {resumes.length > 0 && (
              <Badge variant="outline">{resumes.length}</Badge>
            )}
          </div>
        </div>

        {resumes.length === 0 ? (
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
                        <Badge variant="default" className="shrink-0">
                          <Target className="w-3 h-3 mr-1" />
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

                  {resume.targetCompany && (
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

                <CardFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 w-full"
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
                    className="flex-1 w-full"
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
            // Refresh resumes when wizard closes
            loadAllResumes();
          }
        }}
      />
    </div>
  );
}
