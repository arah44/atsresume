import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Person } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Separator } from '../../ui/separator';
import { PdfUploadField } from '../../form/components/PdfUploadField';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';
import { ChevronDown, ChevronUp, Upload, FileText } from 'lucide-react';

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
}

export const PersonForm: React.FC<PersonFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [uploadMode, setUploadMode] = useState<'pdf' | 'text'>('pdf');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const form = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: initialData
  });

  const handleSubmit = (data: PersonFormData) => {
    onSubmit(data);
  };

  const handlePdfExtracted = (data: Person) => {
    form.setValue('name', data.name);
    form.setValue('raw_content', data.raw_content);
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      {...field}
                      className="text-base sm:text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Simple Upload Section */}
            <div className="space-y-3">
              <FormLabel className="flex gap-2 items-center">
                <Upload className="w-4 h-4" />
                Upload Resume
              </FormLabel>
              <PdfUploadField
                onExtracted={handlePdfExtracted}
                disabled={isLoading}
              />
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
                  variant="ghost"
                  size="sm"
                  className="flex gap-2 items-center px-3 py-2 w-full h-auto sm:w-auto"
                >
                  <FileText className="w-4 h-4" />
                  <span>Advanced Options</span>
                  {showAdvanced ? (
                    <ChevronUp className="ml-1 w-4 h-4" />
                  ) : (
                    <ChevronDown className="ml-1 w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="pt-2 space-y-4">
                <Separator />

                {/* Input Mode Toggle */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <FormLabel className="text-sm font-medium">Input Method</FormLabel>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={uploadMode === 'pdf' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUploadMode('pdf')}
                      className="flex-1 sm:flex-none"
                    >
                      <Upload className="mr-2 w-4 h-4" />
                      Upload PDF
                    </Button>
                    <Button
                      type="button"
                      variant={uploadMode === 'text' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUploadMode('text')}
                      className="flex-1 sm:flex-none"
                    >
                      <FileText className="mr-2 w-4 h-4" />
                      Paste Text
                    </Button>
                  </div>
                </div>

                {/* Content Editor */}
                {uploadMode === 'text' ? (
                  <FormField
                    control={form.control}
                    name="raw_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resume Content</FormLabel>
                        <FormDescription className="text-xs sm:text-sm">
                          Tip: Open your PDF, select all (Ctrl/Cmd+A), copy, and paste here
                        </FormDescription>
                        <FormControl>
                          <Textarea
                            placeholder="Paste your complete resume content here..."
                            className="min-h-[250px] sm:min-h-[300px] text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="raw_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extracted Content (Editable)</FormLabel>
                        <FormDescription className="text-xs sm:text-sm">
                          Review and edit the extracted content from your PDF
                        </FormDescription>
                        <FormControl>
                          <Textarea
                            placeholder="Resume content will appear here after upload..."
                            className="min-h-[200px] sm:min-h-[250px] text-sm font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="w-full sm:w-auto sm:flex-1"
              >
                {isLoading ? 'Processing...' : 'Generate Base Resume'}
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