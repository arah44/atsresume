'use client';

import { useState } from 'react';
import { UserProfile } from '@/services/repositories';
import { Person, Resume } from '@/types';
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
  baseResume?: Resume | null;
}

export function ProfileClientPage({ initialProfile, baseResume }: ProfileClientPageProps) {
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
    <div className="container p-4 mx-auto space-y-6 max-w-5xl sm:p-6 sm:space-y-8">
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
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Your Profile</h1>
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



      {/* Edit/Create Form */}
      {isEditing ? (
        <Card>

            <ProfileCreationForm
              onSuccess={handleProfileCreated}
              onCancel={profile ? () => setIsEditing(false) : undefined}
            />
        </Card>
      ) : null}

      {/* Profile Display */}
      {profile && !isEditing ? (
        <>
          {/* Base Resume Display */}
          {baseResume ? (
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                  <div className="min-w-0">
                    <CardTitle className="flex gap-2 items-center text-lg sm:text-xl">
                      <FileText className="w-5 h-5" />
                      Base Resume
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm">
                      Your base resume generated from your profile
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 w-full sm:flex-row sm:w-auto">
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Link href={profile.baseResumeId ? `/resume/${profile.baseResumeId}` : '/resume/base'}>
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                  <div className="p-4 text-center rounded-lg bg-secondary/50">
                    <div className="text-2xl font-bold">{baseResume.workExperience?.length || 0}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Work Experience</div>
                  </div>
                  <div className="p-4 text-center rounded-lg bg-secondary/50">
                    <div className="text-2xl font-bold">{baseResume.skills?.length || 0}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Skills</div>
                  </div>
                  <div className="p-4 text-center rounded-lg bg-secondary/50">
                    <div className="text-2xl font-bold">{baseResume.education?.length || 0}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Education</div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium sm:text-base">Target Position</h4>
                  <p className="text-sm">{baseResume.position}</p>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium sm:text-base">Professional Summary</h4>
                  <p className="text-sm text-muted-foreground">{baseResume.summary}</p>
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
                <h4 className="mb-2 font-medium">Profile Content</h4>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {profile.raw_content}
                </p>
              </div>
              {profile.metadata?.notes && (
                <div>
                  <h4 className="mb-2 font-medium">Notes</h4>
                  <p className="text-sm text-muted-foreground">{profile.metadata.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Details / Saved Answers */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
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
                  <Plus className="mr-2 w-4 h-4" />
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
                      className="flex gap-4 justify-between items-start p-3 rounded-lg border transition-colors bg-muted/30 hover:bg-muted/50 group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="mb-1 text-sm font-medium">{detail.question}</p>
                        <p className="text-sm break-words text-muted-foreground">
                          {typeof detail.answer === 'boolean'
                            ? detail.answer ? 'Yes' : 'No'
                            : detail.answer}
                        </p>
                        <div className="flex gap-2 items-center mt-2">
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
                        className="opacity-0 transition-opacity shrink-0 group-hover:opacity-100"
                        title="Remove this answer"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <HelpCircle className="mx-auto mb-3 w-12 h-12 text-muted-foreground/50" />
                  <p className="mb-4 text-sm text-muted-foreground">
                    No saved answers yet. Add details manually or they&apos;ll be saved automatically when you use auto-apply.
                  </p>
                  <Button
                    onClick={() => setShowAddDetailDialog(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="mr-2 w-4 h-4" />
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

