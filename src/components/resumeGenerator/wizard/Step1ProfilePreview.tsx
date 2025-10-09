import React from 'react';
import Link from 'next/link';
import { UserProfile } from '@/services/repositories';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { User, CheckCircle2, ExternalLink, Edit, AlertCircle } from 'lucide-react';

interface Step1ProfilePreviewProps {
  userProfile: UserProfile | null;
  onNext: () => void;
  onCancel: () => void;
}

export const Step1ProfilePreview: React.FC<Step1ProfilePreviewProps> = ({
  userProfile,
  onNext,
  onCancel,
}) => {
  if (!userProfile) {
    return (
      <div className="flex flex-col space-y-6 h-full">
        <div>
          <h3 className="mb-2 text-lg font-semibold">Step 1: Your Profile</h3>
          <p className="text-sm text-muted-foreground">
            You need a profile to create resumes
          </p>
        </div>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 items-center text-center">
              <AlertCircle className="w-12 h-12 text-orange-600" />
              <div>
                <h4 className="mb-2 font-semibold text-orange-900">No Profile Found</h4>
                <p className="mb-4 text-sm text-orange-800">
                  Please create a profile first to generate resumes.
                </p>
                <Link href="/dashboard/profile" target="_blank">
                  <Button variant="default">
                    <Edit className="mr-2 w-4 h-4" />
                    Create Profile
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 justify-end pt-4 mt-auto">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  const baseResume = userProfile.baseResume;

  return (
    <div className="flex flex-col space-y-4 h-full sm:space-y-6">
      <div>
        <h3 className="mb-2 text-base font-semibold sm:text-lg">Step 1: Your Profile</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Review your profile and base resume before proceeding
        </p>
      </div>

      {/* Profile Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="flex gap-2 items-center text-sm text-blue-900 sm:text-base">
              <User className="w-4 h-4 text-blue-600" />
              Your Profile
            </CardTitle>
            {baseResume && (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle2 className="mr-1 w-3 h-3" />
                Base Resume Ready
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-md border border-blue-300 bg-white/60">
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-blue-700">Name:</span>
                <p className="text-sm font-semibold text-blue-900">{userProfile.name}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-blue-700">Profile Content:</span>
                <p className="text-xs text-blue-800">
                  {userProfile.raw_content.length} characters
                </p>
              </div>
            </div>
          </div>

          {baseResume ? (
            <>
              <p className="text-xs text-blue-700">
                ✓ Your profile includes a base resume. We&apos;ll use it to create your job-specific resume faster.
              </p>

              {/* Base Resume Preview */}
              <Accordion type="single" collapsible className="bg-white rounded-md border border-blue-300">
                <AccordionItem value="preview" className="border-none">
                  <AccordionTrigger className="px-3 py-2 text-xs font-medium text-blue-900 sm:text-sm hover:no-underline">
                    Preview Base Resume
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="space-y-3 text-xs sm:text-sm">
                      {/* Summary */}
                      {baseResume.summary && (
                        <div>
                          <h5 className="mb-1 font-semibold text-blue-900">Summary</h5>
                          <p className="text-blue-800 line-clamp-3">{baseResume.summary}</p>
                        </div>
                      )}

                      {/* Work Experience */}
                      {baseResume.workExperience && baseResume.workExperience.length > 0 && (
                        <div>
                          <h5 className="mb-1 font-semibold text-blue-900">Work Experience</h5>
                          <div className="space-y-2">
                            {baseResume.workExperience.slice(0, 2).map((exp, idx) => (
                              <div key={idx} className="pl-3 border-l-2 border-blue-300">
                                <p className="font-medium text-blue-900">{exp.position}</p>
                                <p className="text-xs text-blue-700">{exp.company} • {exp.startYear} - {exp.endYear}</p>
                              </div>
                            ))}
                            {baseResume.workExperience.length > 2 && (
                              <p className="text-xs italic text-blue-600">
                                +{baseResume.workExperience.length - 2} more...
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      {baseResume.skills && baseResume.skills.length > 0 && (
                        <div>
                          <h5 className="mb-1 font-semibold text-blue-900">Skills</h5>
                          <div className="flex flex-wrap gap-1">
                            {baseResume.skills.slice(0, 3).map((category, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {category.title}
                              </Badge>
                            ))}
                            {baseResume.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{baseResume.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          ) : (
            <p className="text-xs text-blue-700">
              ℹ️ A base resume will be generated from your profile data during the resume creation process.
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/dashboard/profile" target="_blank" className="flex-1">
              <Button variant="outline" size="sm" className="w-full bg-white">
                <Edit className="mr-2 w-3 h-3" />
                Edit Profile
              </Button>
            </Link>
            {baseResume && (
              <Link href="/resume/base" target="_blank" className="flex-1">
                <Button variant="outline" size="sm" className="w-full bg-white">
                  <ExternalLink className="mr-2 w-3 h-3" />
                  Preview Base Resume
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 justify-end pt-4 mt-auto sm:flex-row">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button onClick={onNext} className="w-full sm:w-auto">
          Next: Select Job
        </Button>
      </div>
    </div>
  );
};

