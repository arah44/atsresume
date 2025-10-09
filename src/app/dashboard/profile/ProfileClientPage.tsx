'use client';

import { useState } from 'react';
import { UserProfile } from '@/services/repositories';
import { Person } from '@/types';
import { ProfileCreationForm } from '@/components/forms/ProfileCreationForm';
import { updateProfileAction, regenerateBaseResumeAction } from '@/app/actions/profileActions';
import { AddDetailDialog } from '@/components/profile/AddDetailDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ErrorAlert } from '@/components/ui/error-alert';
import { parseErrorMessage } from '@/utils/errorHandling';
import { toast } from 'sonner';
import { User, Clock, FileText, Edit, RefreshCw, Eye, X, HelpCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProfileClientPageProps {
  initialProfile: UserProfile | null;
}

export function ProfileClientPage({ initialProfile }: ProfileClientPageProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [isEditing, setIsEditing] = useState(!initialProfile); // Start editing if no profile
  const [error, setError] = useState<ReturnType<typeof parseErrorMessage> | null>(null);
  const [showAddDetailDialog, setShowAddDetailDialog] = useState(false);
  const [generatingBaseResume, setGeneratingBaseResume] = useState(false);

  const handleProfileCreated = () => {
    setIsEditing(false);
    router.refresh();
  };

  const handleRegenerateBaseResume = async () => {
    if (!profile) return;

    setGeneratingBaseResume(true);
    setError(null);

    try {
      toast.info('Regenerating base resume...');

      const result = await regenerateBaseResumeAction();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to regenerate base resume');
      }

      toast.success('Base resume regenerated successfully!');
      setError(null);
      
      // Refresh to get updated data
      router.refresh();
    } catch (err) {
      console.error('❌ FAILED to regenerate base resume:', err);
      const parsedError = parseErrorMessage(err);
      setError(parsedError);
      toast.error(parsedError.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setGeneratingBaseResume(false);
    }
  };

  const handleRemoveDetail = async (index: number) => {
    if (!profile) return;

    const updatedDetails = profile.additional_details?.filter((_, i) => i !== index) || [];

    const result = await updateProfileAction({
      additional_details: updatedDetails
    });

    if (result.success) {
      toast.success('Detail removed successfully');
      router.refresh();
    } else {
      toast.error('Failed to remove detail');
    }
  };

  const handleAddDetail = async (detail: any) => {
    if (!profile) return;

    const updatedDetails = [...(profile.additional_details || []), detail];

    const result = await updateProfileAction({
      additional_details: updatedDetails
    });

    if (result.success) {
      toast.success('Detail added successfully');
      router.refresh();
    } else {
      toast.error('Failed to add detail');
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

  return (
    <div className="container p-4 sm:p-6 mx-auto space-y-6 sm:space-y-8 max-w-5xl">
      {/* Error Alert */}
      {error && (
        <ErrorAlert
          title={error.title}
          message={error.message}
          suggestion={error.suggestion}
          technicalDetails={error.technicalDetails}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Manage your profile and base resume
          </p>
        </div>
        {profile && !isEditing && (
          <Button onClick={() => setIsEditing(true)} size="lg" className="w-full sm:w-auto">
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
              Your profile information will be used to generate a base resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileCreationForm
              onSuccess={handleProfileCreated}
              onCancel={profile ? () => setIsEditing(false) : undefined}
            />
          </CardContent>
        </Card>
      ) : null}

      {/* Profile Display */}
      {profile && !isEditing ? (
        <>
          {/* Base Resume Display */}
          {profile.baseResume ? (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-start">
                  <div className="min-w-0">
                    <CardTitle className="flex gap-2 items-center text-lg sm:text-xl">
                      <FileText className="w-5 h-5" />
                      Base Resume
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm">
                      Your base resume generated from your profile
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="w-full sm:w-auto"
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
                      className="w-full sm:w-auto"
                    >
                      <RefreshCw className={`mr-2 w-4 h-4 ${generatingBaseResume ? 'animate-spin' : ''}`} />
                      Regenerate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <div className="text-2xl font-bold">{profile.baseResume.workExperience?.length || 0}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Work Experience</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <div className="text-2xl font-bold">{profile.baseResume.skills?.length || 0}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Skills</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <div className="text-2xl font-bold">{profile.baseResume.education?.length || 0}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Education</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-sm sm:text-base">Target Position</h4>
                  <p className="text-sm">{profile.baseResume.position}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-sm sm:text-base">Professional Summary</h4>
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

          {/* Profile Content Card */}
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

          {/* Additional Details / Saved Answers */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-start">
                <div className="flex gap-2 items-start">
                  <HelpCircle className="w-5 h-5 mt-0.5" />
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Saved Application Answers</CardTitle>
                    <CardDescription className="mt-1">
                      Answers saved from job applications. These will be auto-filled in future applications.
                    </CardDescription>
                  </div>
                </div>
                <Button
                  onClick={() => setShowAddDetailDialog(true)}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Detail
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {profile.additional_details && profile.additional_details.length > 0 ? (
                <div className="space-y-2">
                  {profile.additional_details.map((detail, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-1">{detail.question}</p>
                        <p className="text-sm text-muted-foreground break-words">
                          {typeof detail.answer === 'boolean'
                            ? detail.answer ? 'Yes' : 'No'
                            : detail.answer}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {detail.field_type || 'text'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(detail.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDetail(index)}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove this answer"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No saved answers yet. Add details manually or they&apos;ll be saved automatically when you use auto-apply.
                  </p>
                  <Button
                    onClick={() => setShowAddDetailDialog(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Detail
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Detail Dialog */}
          <AddDetailDialog
            open={showAddDetailDialog}
            onOpenChange={setShowAddDetailDialog}
            onAdd={handleAddDetail}
          />
        </>
      ) : null}
    </div>
  );
}

