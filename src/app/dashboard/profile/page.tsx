'use client';

import { useState, useEffect } from 'react';
import { ProfileStorageService, UserProfile } from '@/services/profileStorage';
import { Person } from '@/types';
import { PersonForm } from '@/components/resumeGenerator/forms/PersonForm';
import { generateBaseResumeAction } from '@/app/actions/resumeGeneration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { User, Clock, Loader2, FileText, Edit, RefreshCw, Eye } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [generatingBaseResume, setGeneratingBaseResume] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const savedProfile = ProfileStorageService.getProfile();
    setProfile(savedProfile);
    setLoading(false);

    // If no profile exists, start in editing mode
    if (!savedProfile) {
      setIsEditing(true);
    }
  };

  const handleSaveOrUpdate = async (data: Person) => {
    setGeneratingBaseResume(true);

    try {
      console.log('📝 Starting profile save/update...');
      console.log('Input data:', { name: data.name, raw_content_length: data.raw_content.length });

      // Step 1: Generate base resume from profile data
      toast.info('Generating base resume...');
      console.log('🔄 Calling generateBaseResumeAction...');

      const baseResume = await generateBaseResumeAction(data);

      console.log('✅ Base resume generated:', {
        name: baseResume.name,
        position: baseResume.position,
        workExperience: baseResume.workExperience?.length,
        skills: baseResume.skills?.length
      });

      // Step 2: Save profile with embedded base resume
      const profileWithResume = {
        ...data,
        baseResume,
        metadata: {
          lastUpdated: Date.now(),
          version: (profile?.metadata?.version || 0) + 1
        }
      };

      console.log('💾 Saving profile with base resume...');
      ProfileStorageService.saveProfile(profileWithResume);

      // Verify it was saved correctly
      const savedProfile = ProfileStorageService.getProfile();
      console.log('🔍 Verification - Loaded profile:', {
        name: savedProfile?.name,
        hasBaseResume: !!savedProfile?.baseResume,
        hasMetadata: !!savedProfile?.metadata
      });

      if (!savedProfile?.baseResume) {
        throw new Error('Profile saved but base resume is missing! Check saveProfile method.');
      }

      toast.success('✅ Profile and base resume saved successfully!');
      setIsEditing(false);
      loadProfile();
    } catch (error) {
      console.error('❌ FAILED to save profile with base resume:', error);
      toast.error(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGeneratingBaseResume(false);
    }
  };

  const handleRegenerateBaseResume = async () => {
    if (!profile) return;

    setGeneratingBaseResume(true);

    try {
      toast.info('Regenerating base resume...');

      const baseResume = await generateBaseResumeAction({
        name: profile.name,
        raw_content: profile.raw_content
      });

      ProfileStorageService.updateProfile({ baseResume });

      toast.success('Base resume regenerated successfully!');
      loadProfile();
    } catch (error) {
      console.error('❌ FAILED to regenerate base resume:', error);
      toast.error(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGeneratingBaseResume(false);
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

  const emptyPerson: Person = {
    name: '',
    raw_content: ''
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 animate-spin border-primary"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your profile and base resume
          </p>
        </div>
        {profile && !isEditing && (
          <Button onClick={() => setIsEditing(true)} size="lg">
            <Edit className="mr-2 w-4 h-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* No Profile State */}
      {!profile && !isEditing ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col justify-center items-center py-16">
            <User className="mb-4 w-16 h-16 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-semibold">No Profile Yet</h2>
            <p className="mb-6 max-w-md text-center text-muted-foreground">
              Create your profile to generate a base resume for building tailored resumes
            </p>
            <Button onClick={() => setIsEditing(true)} size="lg">
              <User className="mr-2 w-4 h-4" />
              Create Profile
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Edit/Create Form */}
      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>{profile ? 'Edit Profile' : 'Create Profile'}</CardTitle>
            <CardDescription>
              {generatingBaseResume
                ? 'Generating base resume from your profile...'
                : 'Your profile information will be used to generate a base resume'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatingBaseResume ? (
              <div className="flex flex-col justify-center items-center py-12 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <div className="space-y-2 text-center">
                  <p className="font-medium">Generating your base resume...</p>
                  <p className="text-sm text-muted-foreground">
                    This may take a moment as we extract and structure your information
                  </p>
                </div>
              </div>
            ) : (
              <PersonForm
                initialData={profile ? { name: profile.name, raw_content: profile.raw_content } : emptyPerson}
                onSubmit={handleSaveOrUpdate}
                {...(profile ? { onCancel: () => setIsEditing(false) } : {})}
              />
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Profile Display */}
      {profile && !isEditing ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{profile.name}</CardTitle>
                  <CardDescription className="flex gap-2 items-center mt-2">
                    <Clock className="w-4 h-4" />
                    <span>Last updated: {formatDate(profile.metadata?.lastUpdated || profile.timestamp)}</span>
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  Version {profile.metadata?.version || 1}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Profile Content</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {profile.raw_content}
                </p>
              </div>
              {profile.metadata?.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{profile.metadata.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Base Resume Display */}
          {profile.baseResume ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex gap-2 items-center">
                      <FileText className="w-5 h-5" />
                      Base Resume
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Your base resume generated from your profile
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                    >
                      <Link href="/resume/base">
                        <Eye className="mr-2 w-4 h-4" />
                        View in Builder
                      </Link>
                    </Button>
                    <Button
                      onClick={handleRegenerateBaseResume}
                      disabled={generatingBaseResume}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className={`mr-2 w-4 h-4 ${generatingBaseResume ? 'animate-spin' : ''}`} />
                      Regenerate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <div className="text-2xl font-bold">{profile.baseResume.workExperience?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Work Experience</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <div className="text-2xl font-bold">{profile.baseResume.skills?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Skills</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <div className="text-2xl font-bold">{profile.baseResume.education?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Education</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Target Position</h4>
                  <p className="text-sm">{profile.baseResume.position}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Professional Summary</h4>
                  <p className="text-sm text-muted-foreground">{profile.baseResume.summary}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertDescription>
                No base resume found. Click &quot;Regenerate&quot; above to create one from your profile.
              </AlertDescription>
            </Alert>
          )}
        </>
      ) : null}
    </div>
  );
}

