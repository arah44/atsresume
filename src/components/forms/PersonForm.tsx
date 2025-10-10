import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Person } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PdfUploadField } from '@/components/form/components/PdfUploadField';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Upload, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ErrorDisplay } from '@/components/ui/error-display';
import { UserFriendlyError } from '@/utils/errorHandling';

const personSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  raw_content: z.string().min(10, 'Raw content must be at least 10 characters')
});

type PersonFormData = z.infer<typeof personSchema>;

interface PersonFormProps {
  initialData: Person;
  onSubmit: (data: Person) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  externalError?: UserFriendlyError | null;
  onClearExternalError?: () => void;
}

export const PersonForm: React.FC<PersonFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  externalError,
  onClearExternalError
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const form = useForm<PersonFormData>({
    resolver: async (data, context, options) => {
      // Use safeParse to avoid throwing errors
      const result = personSchema.safeParse(data);

      if (!result.success) {
        console.log('❌ Client validation failed:', result.error.issues);

        // Convert Zod errors to React Hook Form format
        const fieldErrors: Record<string, { type: string; message: string }> = {};

        result.error.issues.forEach((issue) => {
          const fieldName = issue.path[0]?.toString();
          if (fieldName) {
            fieldErrors[fieldName] = {
              type: issue.code,
              message: issue.message
            };
          }
        });

        console.log('🔴 Converted field errors:', fieldErrors);

        return {
          values: {},
          errors: fieldErrors
        };
      }

      console.log('✅ Client validation passed');
      return {
        values: result.data,
        errors: {}
      };
    },
    defaultValues: initialData,
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  });

  // Access errors from formState to ensure proper tracking
  const { errors, isSubmitted, isSubmitting } = form.formState;
  const errorCount = Object.keys(errors).length;

  // Debug: Log when errors change
  useEffect(() => {
    if (errorCount > 0) {
      console.log('🔴 Form has errors:', { errorCount, errors, isSubmitted });
    }
  }, [errorCount, errors, isSubmitted]);

  // Auto-expand advanced section if raw_content has an error
  useEffect(() => {
    if (errors.raw_content && isSubmitted) {
      setShowAdvanced(true);
    }
  }, [errors.raw_content, isSubmitted]);

  // Scroll to first error after validation fails
  useEffect(() => {
    if (isSubmitted && errorCount > 0) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        setTimeout(() => {
          const element = document.getElementsByName(firstErrorField)[0];
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [isSubmitted, errorCount, errors]);

  // Handle form submission - keep it simple, parent handles async
  const onFormSubmit = (data: PersonFormData) => {
    console.log('✅ Form validated, calling onSubmit:', data);
    onSubmit(data);
  };

  const handlePdfExtracted = (data: Person) => {
    form.setValue('name', data.name, { shouldValidate: true });
    form.setValue('raw_content', data.raw_content, { shouldValidate: true });
    // Auto-expand advanced section when PDF is extracted so user can review
    setShowAdvanced(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Profile</CardTitle>
        <CardDescription>
          Upload your resume PDF or paste your content below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
            {/* External Error Display (Server/API errors) */}
            {externalError && (
              <ErrorDisplay
                error={externalError}
                onDismiss={onClearExternalError}
                className="mb-4"
              />
            )}

            {/* Validation Error Alert - Shows after form submission if errors exist */}
            {errorCount > 0 && isSubmitted && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="w-4 h-4" />
                <AlertTitle>Please fix the following errors:</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    {errors.name && (
                      <li>{errors.name.message}</li>
                    )}
                    {errors.raw_content && (
                      <li>{errors.raw_content.message}. Please upload a PDF or paste your resume content in the Advanced Options section.</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1 items-center">
                    Full Name
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., John Smith"
                      {...field}
                      className="text-base sm:text-sm"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Enter your full name as it appears on your resume
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Simple Upload Section */}
            <div className="space-y-3">
              <FormLabel className="flex gap-2 items-center">
                <Upload className="w-4 h-4" />
                Upload Resume
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormDescription className="-mt-1 text-xs">
                Upload your resume PDF to automatically extract your information
              </FormDescription>
              <PdfUploadField
                onExtracted={handlePdfExtracted}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Don&apos;t have a PDF? Use the <span className="font-medium">Advanced Options</span> below to paste your content directly
              </p>
            </div>

            {/* Advanced Section - Collapsible */}
            <Collapsible
              open={showAdvanced}
              onOpenChange={setShowAdvanced}
              className="space-y-3"
            >
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant={errors.raw_content ? "destructive" : "ghost"}
                  size="sm"
                  className="flex gap-2 items-center px-3 py-2 w-full h-auto sm:w-auto"
                >
                  <FileText className="w-4 h-4" />
                  <span>Advanced Options</span>
                  {errors.raw_content && (
                    <AlertCircle className="w-4 h-4 text-destructive-foreground" />
                  )}
                  {showAdvanced ? (
                    <ChevronUp className="ml-1 w-4 h-4" />
                  ) : (
                    <ChevronDown className="ml-1 w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="pt-2 space-y-4">
                <Separator />

                {/* Content Editor - Single field, dynamic labels */}
                <FormField
                  control={form.control}
                  name="raw_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex gap-1 items-center">
                        Text Content
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormDescription className="text-xs sm:text-sm">
                        Tip: Open your PDF, select all (Ctrl/Cmd+A), copy, and paste here (minimum 10 characters)
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your complete resume content here..."
                          className={`font-mono text-sm min-h-[250px] sm:min-h-[300px]`}
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <FormMessage />
                        <span>{field.value?.length || 0} characters</span>
                      </div>
                    </FormItem>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button
                type="submit"
                disabled={isLoading || isSubmitting}
                size="lg"
                className="w-full sm:w-auto sm:flex-1"
              >
                {isLoading || isSubmitting ? 'Processing...' : 'Generate Base Resume'}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={onCancel}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

