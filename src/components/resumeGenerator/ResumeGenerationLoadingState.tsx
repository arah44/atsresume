'use client';

import React from 'react';
import { GenerationStatus } from '@/types';
import { Loader2, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ResumeGenerationLoadingStateProps {
  status: GenerationStatus;
  progress: number;
  currentStep: string;
}

export const ResumeGenerationLoadingState: React.FC<ResumeGenerationLoadingStateProps> = ({
  status,
  progress,
  currentStep
}) => {
  const steps = [
    { status: GenerationStatus.ANALYZING_JOB, label: 'Analyzing Job Requirements', emoji: '📊' },
    { status: GenerationStatus.EXTRACTING_KEYWORDS, label: 'Extracting ATS Keywords', emoji: '🔑' },
    { status: GenerationStatus.GENERATING_RESUME, label: 'Generating Optimized Resume', emoji: '📄' }
  ];

  const getStepState = (stepStatus: GenerationStatus) => {
    const statusOrder = Object.values(GenerationStatus);
    const currentIndex = statusOrder.indexOf(status);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const isCompleted = status === GenerationStatus.COMPLETED;
  const isFailed = status === GenerationStatus.FAILED;

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-8 h-full">
      {/* Main Status */}
      <div className="text-center space-y-4">
        {isCompleted ? (
          <>
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-600">Resume Generated Successfully!</h3>
              <p className="text-sm text-muted-foreground mt-1">Redirecting to your resume...</p>
            </div>
          </>
        ) : isFailed ? (
          <>
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-red-600">Generation Failed</h3>
              <p className="text-sm text-muted-foreground mt-1">Please try again</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <Loader2 className="h-16 w-16 text-purple-600 animate-spin" />
                <Sparkles className="h-6 w-6 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Generating Your Resume</h3>
              <p className="text-sm text-muted-foreground mt-1">{currentStep}</p>
            </div>
          </>
        )}
      </div>

      {/* Progress Bar */}
      {!isFailed && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                isCompleted
                  ? 'bg-green-500'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Details */}
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm mb-4">Generation Steps</h4>
            {steps.map((step, index) => {
              const state = getStepState(step.status);
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    state === 'active'
                      ? 'bg-purple-50 border border-purple-200'
                      : state === 'completed'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8">
                    {state === 'active' ? (
                      <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                    ) : state === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        state === 'active'
                          ? 'text-purple-900'
                          : state === 'completed'
                          ? 'text-green-900'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.emoji} {step.label}
                    </p>
                  </div>
                  {state === 'completed' && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                      Done
                    </Badge>
                  )}
                  {state === 'active' && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                      In Progress
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Processing Info */}
      {!isCompleted && !isFailed && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            ✨ AI is analyzing and optimizing your resume for ATS compatibility
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This usually takes 30-60 seconds
          </p>
        </div>
      )}
    </div>
  );
};

