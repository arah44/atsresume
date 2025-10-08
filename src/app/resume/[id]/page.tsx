'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Resume } from '@/types';
import { ResumeStorageService } from '@/services/resumeStorage';
import { isValidResumeId } from '@/utils/resumeHash';
import Builder from '@/components/builder';
import { ResumeGenerationInfo } from '@/components/resumeGenerator/ResumeGenerationInfo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Home, Info } from 'lucide-react';
import Link from 'next/link';

export default function ResumePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load resume from storage
  useEffect(() => {
    if (!id) {
      setError('No resume ID provided');
      setLoading(false);
      return;
    }

    // Special case: 'base-resume' is always valid
    const isBaseResume = id === 'base-resume';

    if (!isBaseResume && !isValidResumeId(id)) {
      setError('Invalid resume ID format');
      setLoading(false);
      return;
    }

    const loadedResume = ResumeStorageService.loadResumeById(id);

    if (!loadedResume) {
      setError('Resume not found');
      setLoading(false);
      return;
    }

    // Set the resume in localStorage so Builder can load it
    localStorage.setItem('atsresume_resume', JSON.stringify(loadedResume));
    localStorage.setItem('atsresume_editing_id', id);

    // Mark if we're editing the base resume
    if (isBaseResume) {
      localStorage.setItem('atsresume_editing_base', 'true');
    } else {
      localStorage.removeItem('atsresume_editing_base');
    }

    console.log('📝 Loaded resume:', id, isBaseResume ? '(BASE RESUME)' : '');
    setResume(loadedResume);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="resume-not-found">
        <Card className="p-8 max-w-md text-center">
          <CardHeader>
            <h1 className="text-2xl font-bold text-red-600">Resume Not Found</h1>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-gray-600">
              {error || 'The resume you are looking for does not exist or has been deleted.'}
            </p>
            <Button onClick={() => router.push('/')}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="resume" className="w-full">
        <div className="flex sticky top-0 z-10 items-center px-8 border-b bg-background exclude-print">
          <div className="container flex justify-between items-center px-4 mx-auto">

          <Button variant="outline" asChild>
            <Link href="/dashboard" className="gap-2">
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
          </Button>

          <div className="container px-4 mx-auto">
            <TabsList className="justify-start h-14 w-fit exclude-print">

              {/* link to return to dashboard */}

              <TabsTrigger value="resume" className="gap-2">
                <FileText className="w-4 h-4" />
                Resume Editor
              </TabsTrigger>
              <TabsTrigger value="info" className="gap-2">
                <Info className="w-4 h-4" />
                Generation Info
                {resume.generationMetadata && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {resume.generationMetadata.targetJob?.company}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
                </div>

        <TabsContent value="resume" className="mt-0">
          <Builder initialResume={resume} />
        </TabsContent>

        <TabsContent value="info" className="p-6 mt-0">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">Resume Generation Details</h1>
              <p className="mt-2 text-muted-foreground">
                View the inputs and steps used to generate this resume
              </p>
            </div>
            <ResumeGenerationInfo resume={resume} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

