import { AlertCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';

interface ErrorAlertProps {
  title: string;
  message: string;
  suggestion?: string;
  technicalDetails?: string;
  onDismiss?: () => void;
}

export function ErrorAlert({
  title,
  message,
  suggestion,
  technicalDetails,
  onDismiss,
}: ErrorAlertProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Alert variant="destructive" className="relative">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="pr-8">{title}</AlertTitle>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-6 w-6 p-0"
          onClick={onDismiss}
        >
          <XCircle className="h-4 w-4" />
        </Button>
      )}
      <AlertDescription className="mt-2 space-y-3">
        <p>{message}</p>

        {suggestion && (
          <div className="rounded-md bg-background/50 p-3 text-sm">
            <p className="font-semibold mb-1">💡 What to do:</p>
            <p className="whitespace-pre-line">{suggestion}</p>
          </div>
        )}

        {technicalDetails && (
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 h-7 text-xs"
              >
                {showDetails ? 'Hide' : 'Show'} technical details
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">
                <pre className="whitespace-pre-wrap break-words">
                  {technicalDetails}
                </pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </AlertDescription>
    </Alert>
  );
}

