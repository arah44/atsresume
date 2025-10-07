'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileStorageService, SavedProfile } from '@/services/profileStorage';
import { Person } from '@/types';
import { PersonForm } from '@/components/resumeGenerator/forms/PersonForm';
import { generateBaseResumeAction } from '@/app/actions/resumeGeneration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, User, Trash2, Edit, CheckCircle, Clock, Loader2, FileText } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProfile, setEditingProfile] = useState<SavedProfile | null>(null);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [generatingBaseResume, setGeneratingBaseResume] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    const savedProfiles = ProfileStorageService.getAllProfiles();
    setProfiles(savedProfiles);
    setLoading(false);

    // Check which profile is currently active
    if (typeof window !== 'undefined') {
      const currentPerson = localStorage.getItem('atsresume_person');
      if (currentPerson) {
        const person = JSON.parse(currentPerson);
        const active = savedProfiles.find(p => p.name === person.name);
        if (active) setCurrentProfileId(active.id);
      }
    }
  };

  const handleCreate = async (data: Person) => {
    setGeneratingBaseResume(true);

    try {
      console.log('📝 Starting profile creation...');
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
          version: 1
        }
      };

      console.log('💾 Saving profile with base resume...');
      console.log('Profile object keys:', Object.keys(profileWithResume));
      console.log('Has baseResume?', 'baseResume' in profileWithResume);
      console.log('Has metadata?', 'metadata' in profileWithResume);

      const profileId = ProfileStorageService.saveProfile(profileWithResume);

      console.log('✅ Profile saved with ID:', profileId);

      // Verify it was saved correctly
      const savedProfile = ProfileStorageService.getProfileById(profileId);
      console.log('🔍 Verification - Loaded profile:', {
        id: savedProfile?.id,
        name: savedProfile?.name,
        hasBaseResume: !!savedProfile?.baseResume,
        hasMetadata: !!savedProfile?.metadata
      });

      if (!savedProfile?.baseResume) {
        throw new Error('Profile saved but base resume is missing! Check saveProfile method.');
      }

      toast.success('✅ Profile and base resume created successfully!');
      setShowCreateDialog(false);
      loadProfiles();
    } catch (error) {
      console.error('❌ FAILED to create profile with base resume:', error);
      toast.error(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error; // Re-throw to see full error
    } finally {
      setGeneratingBaseResume(false);
    }
  };

  const handleUpdate = (data: Person) => {
    if (!editingProfile) return;

    const success = ProfileStorageService.updateProfile(editingProfile.id, data);
    if (success) {
      toast.success('Profile updated successfully');
      setEditingProfile(null);
      loadProfiles();
    } else {
      toast.error('Failed to update profile');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this profile?')) {
      const success = ProfileStorageService.deleteProfile(id);
      if (success) {
        toast.success('Profile deleted successfully');
        if (currentProfileId === id) setCurrentProfileId(null);
        loadProfiles();
      } else {
        toast.error('Failed to delete profile');
      }
    }
  };

  const handleSetCurrent = (id: string) => {
    ProfileStorageService.setCurrentProfile(id);
    setCurrentProfileId(id);
    toast.success('Profile set as active');
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
          <p className="text-muted-foreground">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Management</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your resume profiles ({profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'})
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} size="lg">
          <Plus className="mr-2 w-4 h-4" />
          Create Profile
        </Button>
      </div>

      {/* Profiles List */}
      {profiles.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col justify-center items-center py-16">
            <User className="mb-4 w-16 h-16 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-semibold">No Profiles Yet</h2>
            <p className="mb-6 max-w-md text-center text-muted-foreground">
              Create your first profile to start building tailored resumes
            </p>
            <Button onClick={() => setShowCreateDialog(true)} size="lg">
              <Plus className="mr-2 w-4 h-4" />
              Create Your First Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className={`${
                currentProfileId === profile.id ? 'border-primary border-2' : ''
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex gap-2 items-center">
                      <CardTitle className="truncate">{profile.name}</CardTitle>
                      {currentProfileId === profile.id && (
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {profile.raw_content.substring(0, 100)}...
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex gap-2 items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(profile.timestamp)}</span>
                </div>

                {profile.baseResume ? (
                  <div className="pt-2 space-y-2 border-t">
                    <div className="flex gap-2 items-center">
                      <Badge variant="secondary" className="gap-1">
                        <FileText className="w-3 h-3" />
                        Base Resume
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-foreground">{profile.baseResume.position}</p>
                      <div className="flex gap-3 text-muted-foreground">
                        <span>{profile.baseResume.workExperience?.length || 0} jobs</span>
                        <span>•</span>
                        <span>{profile.baseResume.skills?.length || 0} skills</span>
                        {profile.baseResume.education?.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{profile.baseResume.education.length} education</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t">
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      No Base Resume
                    </Badge>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex-col gap-2 sm:flex-row">
                <Button
                  variant={currentProfileId === profile.id ? "default" : "outline"}
                  size="sm"
                  className="w-full sm:flex-1"
                  onClick={() => handleSetCurrent(profile.id)}
                  disabled={currentProfileId === profile.id}
                >
                  <CheckCircle className="mr-2 w-3 h-3" />
                  {currentProfileId === profile.id ? 'Active' : 'Set Active'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setEditingProfile(profile)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => handleDelete(profile.id)}
                >
                  <Trash2 className="w-3 h-3" />
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
            <DialogTitle>Create New Profile</DialogTitle>
            <DialogDescription>
              {generatingBaseResume
                ? 'Creating profile and generating base resume...'
                : 'Add a new resume profile to your collection. A base resume will be automatically generated.'}
            </DialogDescription>
          </DialogHeader>
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
              initialData={emptyPerson}
              onSubmit={handleCreate}
              onCancel={() => setShowCreateDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingProfile} onOpenChange={(open) => !open && setEditingProfile(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          {editingProfile && (
            <PersonForm
              initialData={{
                name: editingProfile.name,
                raw_content: editingProfile.raw_content
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingProfile(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

