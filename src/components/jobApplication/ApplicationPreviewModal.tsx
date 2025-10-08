'use client';

import { useState } from 'react';
import { ApplicationPreview } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Send,
  X,
  Eye,
  Loader2
} from 'lucide-react';

interface ApplicationPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: ApplicationPreview | null;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ApplicationPreviewModal({
  open,
  onOpenChange,
  preview,
  onConfirm,
  onCancel,
  isSubmitting = false
}: ApplicationPreviewModalProps) {
  const [showScreenshot, setShowScreenshot] = useState(false);

  if (!preview) {
    return null;
  }

  const getConfidenceBadge = (confidence: 'high' | 'medium' | 'low') => {
    const variants = {
      high: { variant: 'default' as const, icon: CheckCircle, text: 'High Confidence' },
      medium: { variant: 'secondary' as const, icon: AlertTriangle, text: 'Medium Confidence' },
      low: { variant: 'destructive' as const, icon: XCircle, text: 'Low Confidence' }
    };

    const config = variants[confidence];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="text-xs">
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const handleConfirm = () => {
    if (!isSubmitting) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Review Application Before Submitting
          </DialogTitle>
          <DialogDescription>
            Please review the filled form data below. Make sure all information is correct before submitting.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4">
            {/* Alert for low confidence fields */}
            {preview.fields.some(f => f.confidence === 'low') && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Some fields have low confidence. Please review them carefully.
                </AlertDescription>
              </Alert>
            )}

            {/* Form Fields */}
            <div className="space-y-3">
              {preview.fields.map((field, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    field.confidence === 'low'
                      ? 'border-destructive/50 bg-destructive/5'
                      : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{field.label}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Type: {field.field_type}
                      </p>
                    </div>
                    {getConfidenceBadge(field.confidence)}
                  </div>
                  <div className="mt-2 p-2 bg-background rounded border">
                    <p className="text-sm break-words">
                      {typeof field.value === 'boolean'
                        ? field.value ? 'Yes' : 'No'
                        : Array.isArray(field.value)
                        ? field.value.join(', ')
                        : field.value || <span className="text-muted-foreground italic">(empty)</span>
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Screenshot Preview */}
            {preview.screenshot && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowScreenshot(!showScreenshot)}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showScreenshot ? 'Hide' : 'Show'} Form Screenshot
                  </Button>

                  {showScreenshot && (
                    <div className="border rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`data:image/png;base64,${preview.screenshot}`}
                        alt="Form Preview"
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Confirm & Submit
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

