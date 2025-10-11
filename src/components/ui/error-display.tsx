'use client';

import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertCircle, ChevronDown, ChevronUp, RefreshCw, X } from 'lucide-react';
import { UserFriendlyError } from '@/utils/errorHandling';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  error: UserFriendlyError;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showTechnicalDetails?: boolean;
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  className,
  showTechnicalDetails = true
}: ErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Alert variant="destructive" className={cn('relative', className)}>
      <AlertCircle className="w-4 h-4" />
      
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="space-y-3">
        <div>
          <AlertTitle className="mb-2">{error.title}</AlertTitle>
          <AlertDescription className="text-sm">
            {error.message}
          </AlertDescription>
        </div>

        {/* Suggestion */}
        {error.suggestion && (
          <AlertDescription className="text-sm font-medium border-l-2 border-destructive-foreground/20 pl-3">
            <div className="whitespace-pre-line">{error.suggestion}</div>
          </AlertDescription>
        )}

        {/* Technical Details (Collapsible) */}
        {showTechnicalDetails && error.technicalDetails && (
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-destructive-foreground hover:bg-transparent"
              >
                <span className="flex gap-1 items-center">
                  {showDetails ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      Hide technical details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      Show technical details
                    </>
                  )}
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="p-2 rounded bg-destructive-foreground/10 text-xs font-mono break-words">
                {error.technicalDetails}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Action Buttons */}
        {onRetry && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="h-8 text-xs border-destructive-foreground/20 hover:bg-destructive-foreground/10"
            >
              <RefreshCw className="mr-1.5 w-3 h-3" />
              Try Again
            </Button>
          </div>
        )}
      </div>
    </Alert>
  );
}

