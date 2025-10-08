'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { extractResumeFromPdf } from '@/app/actions/pdfExtraction';
import { validatePdfFile } from '@/utils/pdfValidation';
import { Person } from '@/types';
import { toast } from 'sonner';

interface PdfUploadFieldProps {
  onExtracted: (data: Person) => void;
  disabled?: boolean;
}

export function PdfUploadField({ onExtracted, disabled }: PdfUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<Person | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file
    const validation = validatePdfFile(file.size, file.type);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      toast.error(validation.error);
      return;
    }

    setUploadedFile(file);
    setError(null);
    setUploading(true);
    setProgress(10);

    try {
      // Convert to base64
      const fileData = await fileToBase64(file);
      setProgress(30);

      // Send directly to OpenAI Responses API (handles PDF natively!)
      toast.info('🤖 AI is reading your resume...');
      const result = await extractResumeFromPdf(fileData, file.name);
      setProgress(90);

      if (result.success && result.data) {
        setExtractedData(result.data);
        onExtracted(result.data);
        setProgress(100);
        toast.success('✅ Resume extracted successfully!');
      } else {
        throw new Error(result.error || 'Extraction failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to process PDF';
      setError(errorMsg);
      
      // Show user-friendly toast
      if (errorMsg.includes('API key')) {
        toast.error('OpenAI API key not configured. Please contact support.');
      } else if (errorMsg.includes('scanned') || errorMsg.includes('image-based')) {
        toast.error('PDF appears to be image-based. Please use "Paste Text" instead.');
      } else if (errorMsg.includes('name')) {
        toast.error('Could not find your name. Please try "Paste Text" option.');
      } else {
        toast.error('Failed to process PDF. Please try "Paste Text" option.');
      }
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: disabled || uploading,
    noClick: uploading
  });

  const clearUpload = () => {
    setUploadedFile(null);
    setExtractedData(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="space-y-4">
      {!extractedData ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-accent/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            ) : (
              <Upload className="w-12 h-12 text-muted-foreground" />
            )}
            <p className="text-lg font-medium">
              {uploading
                ? 'Processing resume...'
                : isDragActive
                ? 'Drop your resume here'
                : 'Drag & drop your resume PDF'}
            </p>
            {!uploading && (
              <>
                <p className="text-sm text-muted-foreground">or</p>
                <Button type="button" variant="outline" disabled={disabled}>
                  Choose File
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF files only (max 10MB)
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-green-900 dark:text-green-100">
                Resume extracted successfully
              </span>
              <span className="text-sm text-green-700 dark:text-green-300">
                {extractedData.name} • {uploadedFile?.name}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearUpload}
              className="hover:bg-green-100 dark:hover:bg-green-900/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-xs text-center text-muted-foreground">
            {progress < 30
              ? 'Reading PDF file...'
              : progress < 90
              ? 'Extracting data with AI...'
              : 'Almost done...'}
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p className="font-semibold">Failed to extract resume</p>
            <p className="text-sm">{error}</p>
            <div className="mt-3 rounded-md bg-destructive/10 p-3">
              <p className="text-sm font-medium mb-1">💡 What to do:</p>
              <p className="text-sm">
                Switch to <strong>&quot;Paste Text&quot;</strong> mode above and manually paste your resume content.
                This always works and gives you full control over what&apos;s included.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearUpload}
              className="mt-2"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * Convert File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:application/pdf;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}

