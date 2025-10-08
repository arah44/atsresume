'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Globe,
  Search,
  Edit,
  Eye,
  Send,
  CheckCircle,
  XCircle
} from 'lucide-react';

type ApplicationStep =
  | 'navigating'
  | 'analyzing'
  | 'filling'
  | 'preview'
  | 'awaiting_confirmation'
  | 'submitting'
  | 'completed'
  | 'failed';

interface ApplicationProgressProps {
  currentStep: ApplicationStep;
  error?: string;
}

const STEPS = [
  { key: 'navigating', label: 'Navigating to Application', icon: Globe, progress: 10 },
  { key: 'analyzing', label: 'Analyzing Form Fields', icon: Search, progress: 30 },
  { key: 'filling', label: 'Filling Form Data', icon: Edit, progress: 60 },
  { key: 'preview', label: 'Generating Preview', icon: Eye, progress: 80 },
  { key: 'awaiting_confirmation', label: 'Awaiting Confirmation', icon: CheckCircle, progress: 85 },
  { key: 'submitting', label: 'Submitting Application', icon: Send, progress: 95 },
  { key: 'completed', label: 'Application Submitted', icon: CheckCircle, progress: 100 },
  { key: 'failed', label: 'Application Failed', icon: XCircle, progress: 0 }
] as const;

export function ApplicationProgress({ currentStep, error }: ApplicationProgressProps) {
  const currentStepIndex = STEPS.findIndex(step => step.key === currentStep);
  const currentStepData = STEPS.find(step => step.key === currentStep);
  const Icon = currentStepData?.icon || Loader2;

  const isCompleted = currentStep === 'completed';
  const isFailed = currentStep === 'failed';

  return (
    <Card className={
      isCompleted ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' :
      isFailed ? 'border-destructive/50 bg-destructive/5' :
      'border-primary/50 bg-primary/5'
    }>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {isCompleted ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Application Submitted Successfully
              </>
            ) : isFailed ? (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                Application Failed
              </>
            ) : (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Auto-Applying to Job
              </>
            )}
          </CardTitle>
          {!isFailed && !isCompleted && (
            <Badge variant="secondary">
              {currentStepData?.progress}%
            </Badge>
          )}
        </div>
        <CardDescription>
          {currentStepData?.label}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {!isFailed && (
          <Progress
            value={currentStepData?.progress || 0}
            className="h-2"
          />
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Step List */}
        <div className="space-y-2">
          {STEPS.filter(step => step.key !== 'failed').map((step, index) => {
            const StepIcon = step.icon;
            const isActive = step.key === currentStep;
            const isPast = index < currentStepIndex;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-3 p-2 rounded ${
                  isActive
                    ? 'bg-primary/10 border border-primary/20'
                    : isPast
                    ? 'text-muted-foreground'
                    : 'opacity-50'
                }`}
              >
                <div className={`shrink-0 ${isActive ? 'animate-pulse' : ''}`}>
                  {isPast ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <StepIcon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                  )}
                </div>
                <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

