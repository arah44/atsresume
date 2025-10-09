'use client';

import { Resume } from '@/types';
import Builder from '@/components/builder';
import { ResumeGenerationInfo } from '@/components/resumeGenerator/ResumeGenerationInfo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Home, Info } from 'lucide-react';
import Link from 'next/link';

interface ResumeClientPageProps {
  resume: Resume;
  isBaseResume: boolean;
}

export function ResumeClientPage({ resume, isBaseResume }: ResumeClientPageProps) {
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

