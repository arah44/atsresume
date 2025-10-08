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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Resume Content</FormLabel>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={uploadMode === 'pdf' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUploadMode('pdf')}
                  >
                    Upload PDF
                  </Button>
                  <Button
                    type="button"
                    variant={uploadMode === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUploadMode('text')}
                  >
                    Paste Text
                  </Button>
                </div>
              </div>

              {uploadMode === 'pdf' ? (
                <div className="space-y-4">
                  <PdfUploadField
                    onExtracted={handlePdfExtracted}
                    disabled={isLoading}
                  />
                  <Separator className="my-4" />
                  <FormField
                    control={form.control}
                    name="raw_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extracted Content (Editable)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Resume content will appear here after upload..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="raw_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormDescription>
                        Tip: Open your PDF, select all (Ctrl/Cmd+A), copy, and paste here
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your complete resume content here..."
                          className="min-h-[300px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? 'Processing...' : 'Generate Base Resume'}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" size="lg" onClick={onCancel}>
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