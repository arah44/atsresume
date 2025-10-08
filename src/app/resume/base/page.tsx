'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Resume } from '@/types';
import { ProfileStorageService } from '@/services/profileStorage';
import Builder from '@/components/builder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Home, User, Info } from 'lucide-react';
import Link from 'next/link';

export default function BaseResumePage() {
  const router = useRouter();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load base resume from user profile
  useEffect(() => {
    const profile = ProfileStorageService.getProfile();

    if (!profile) {
      setError('No profile found. Please create your profile first.');
      setLoading(false);
      return;
    }

    if (!profile.baseResume) {
      setError('No base resume found. Please generate a base resume from your profile.');
      setLoading(false);
      return;
    }

    // Set the resume in localStorage so Builder can load it
    localStorage.setItem('atsresume_resume', JSON.stringify(profile.baseResume));
    localStorage.setItem('atsresume_editing_base', 'true');

    setResume(profile.baseResume);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 animate-spin border-primary"></div>
          <p className="text-muted-foreground">Loading base resume...</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="p-8 max-w-md text-center">
          <CardHeader>
            <h1 className="text-2xl font-bold text-red-600">Base Resume Not Found</h1>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-gray-600">
              {error || 'Your base resume could not be loaded.'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => router.push('/dashboard/profile')} variant="default">
                <User className="mr-2 w-4 h-4" />
                Go to Profile
              </Button>
              <Button onClick={() => router.push('/dashboard')} variant="outline">
                <Home className="mr-2 w-4 h-4" />
                Dashboard
              </Button>
            </div>
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

            <div className="flex gap-2 items-center">
              <Button variant="outline" asChild>
                <Link href="/dashboard/profile" className="gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </Button>
              <Badge variant="secondary" className="gap-1">
                <FileText className="w-3 h-3" />
                Base Resume
              </Badge>
            </div>

            <div className="container px-4 mx-auto">
              <TabsList className="justify-start h-14 w-fit exclude-print">
                <TabsTrigger value="resume" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Resume Editor
                </TabsTrigger>
                <TabsTrigger value="info" className="gap-2">
                  <Info className="w-4 h-4" />
                  Base Resume Info
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
              <h1 className="text-3xl font-bold tracking-tight">Base Resume Information</h1>
              <p className="mt-2 text-muted-foreground">
                This is your base resume generated from your profile
              </p>
            </div>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Resume Details</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
                  <p className="text-lg">{resume.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Position</h3>
                  <p className="text-lg">{resume.position}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Summary</h3>
                  <p>{resume.summary}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <div className="text-2xl font-bold">{resume.workExperience?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Work Experience</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <div className="text-2xl font-bold">{resume.skills?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Skills</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <div className="text-2xl font-bold">{resume.education?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Education</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

