import React from 'react';
import { JobFormData } from './types';
import { UserProfile } from '@/services/profileStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Briefcase, Sparkles } from 'lucide-react';

interface Step3ReviewGenerateProps {
  userProfile: UserProfile;
  jobData: JobFormData;
  onGenerate: () => void;
  onBack: () => void;
}

export const Step3ReviewGenerate: React.FC<Step3ReviewGenerateProps> = ({
  userProfile,
  jobData,
  onGenerate,
  onBack,
}) => {
  return (
    <div className="flex flex-col space-y-4 sm:space-y-6 h-full">
      <div>
        <h3 className="mb-2 text-base sm:text-lg font-semibold">Step 3: Review & Generate</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Review your information before generating the AI-optimized resume
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-4 sm:pt-6 space-y-4">
            {/* Profile Section */}
            <div>
              <div className="flex gap-2 items-center mb-2">
                <User className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm sm:text-base font-semibold">Your Profile</h4>
              </div>
              <div className="pl-6 space-y-2">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Name:</span>
                  <p className="text-sm font-medium">{userProfile.name}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Content Length:</span>
                  <p className="text-xs sm:text-sm">{userProfile.raw_content.length} characters</p>
                </div>
                {userProfile.baseResume && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Base Resume:</span>
                    <p className="text-xs sm:text-sm text-green-600">✓ Ready to use</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Job Section */}
            <div>
              <div className="flex gap-2 items-center mb-2">
                <Briefcase className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm sm:text-base font-semibold">Target Job</h4>
              </div>
              <div className="pl-6 space-y-2">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Position:</span>
                  <p className="text-sm font-medium">{jobData.name}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Company:</span>
                  <p className="text-sm font-medium">{jobData.company}</p>
                </div>
                {jobData.url && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">URL:</span>
                    <p className="text-xs sm:text-sm text-blue-600 truncate break-all">{jobData.url}</p>
                  </div>
                )}
                {jobData.description && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Description:</span>
                    <p className="text-xs sm:text-sm line-clamp-3">{jobData.description}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Content Length:</span>
                  <p className="text-xs sm:text-sm">{jobData.raw_content.length} characters</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What Happens Next Card */}
        <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="mb-2 text-sm sm:text-base font-semibold text-blue-900">What happens next?</h4>
          <ul className="space-y-1 text-xs sm:text-sm text-blue-800">
            <li>• AI will analyze the job requirements</li>
            <li>• Extract ATS-relevant keywords</li>
            <li>• Optimize your summary for this role</li>
            <li>• Enhance your work experience descriptions</li>
            <li>• Tailor your skills to match the job</li>
            <li>• Generate a complete, ATS-optimized resume</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-between pt-4 mt-auto">
          <Button type="button" variant="outline" onClick={onBack} className="w-full sm:w-auto">
            Back
          </Button>
          <Button onClick={onGenerate} className="gap-2 w-full sm:w-auto">
            <Sparkles className="w-4 h-4" />
            Generate Resume
          </Button>
        </div>
      </div>
    </div>
  );
};

