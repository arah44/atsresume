import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface StepIndicatorProps {
  step: number;
  currentStep: number;
  label: string;
  icon: React.ReactNode;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ step, currentStep, label, icon }) => {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;

  return (
    <div className="flex flex-col gap-1 items-center">
      <div
        className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-colors ${
          isActive
            ? 'bg-primary text-primary-foreground border-primary'
            : isCompleted
            ? 'text-white bg-green-500 border-green-500'
            : 'bg-muted text-muted-foreground border-border'
        }`}
      >
        {isCompleted ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : icon}
      </div>
      <span
        className={`text-xs font-medium hidden sm:block ${
          isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
        }`}
      >
        {label}
      </span>
    </div>
  );
};

