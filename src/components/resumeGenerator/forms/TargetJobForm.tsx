import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TargetJobJson } from '../../../types';
import { JobDataParser } from '../../../services/jobDataParser';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { AITextarea } from '../../ui/ai-textarea';
import { Button } from '../../ui/button';
import { Separator } from '../../ui/separator';

const targetJobSchema = z.object({
  name: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  raw_content: z.string().min(10, 'Raw content must be at least 10 characters')
});

type TargetJobFormData = z.infer<typeof targetJobSchema>;

interface TargetJobFormProps {
  initialData: TargetJobJson;
  onSubmit: (data: TargetJobJson) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TargetJobForm: React.FC<TargetJobFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [rawContent, setRawContent] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const form = useForm<TargetJobFormData>({
    resolver: zodResolver(targetJobSchema),
    defaultValues: initialData
  });

  const handleSubmit = (data: TargetJobFormData) => {
    onSubmit({
      ...data,
      url: data.url || ''
    });
  };

  const handleParseRawData = async () => {
    if (!rawContent.trim()) return;

    setIsParsing(true);
    try {
      const parsed = JobDataParser.parseRawJobData(rawContent);
      const suggestions = JobDataParser.getSuggestions(parsed);

      // Update form with parsed data
      form.setValue('name', parsed.name || '');
      form.setValue('company', parsed.company || '');
      form.setValue('description', parsed.description || '');
      form.setValue('raw_content', parsed.raw_content || '');

      setSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to parse raw data:', error);
      setSuggestions(['Failed to parse raw data. Please check the format.']);
    } finally {
      setIsParsing(false);
    }
  };

  const handleLoadSample = () => {
    const sampleContent = `Senior Software Engineer - Google
Location: Mountain View, CA
Type: Full-time

We are looking for a Senior Software Engineer to join our team...

Requirements:
- 5+ years of software development experience
- Strong knowledge of JavaScript, React, Node.js
- Experience with cloud platforms (AWS, GCP)
- Bachelor's degree in Computer Science or related field

Responsibilities:
- Design and develop scalable web applications
- Collaborate with cross-functional teams
- Mentor junior developers
- Participate in code reviews

Benefits:
- Competitive salary
- Health insurance
- 401k matching
- Flexible work arrangements`;

    setRawContent(sampleContent);
  };

  const handleClear = () => {
    setRawContent('');
    setSuggestions([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Target Job Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Raw Data Input Section */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Raw Job Posting Data</label>
            <p className="text-sm text-muted-foreground">
              Paste the complete job posting here to auto-parse the details
            </p>
          </div>

          <AITextarea
            placeholder="Paste the complete job posting here... ✨ AI-powered parsing"
            className="min-h-[150px]"
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            showBeam={rawContent.length > 0}
            beamColor="#8b5cf6"
            beamColorTo="#06b6d4"
            beamDuration={12}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleParseRawData}
              disabled={!rawContent.trim() || isParsing}
              size="sm"
            >
              {isParsing ? 'Parsing...' : 'Parse Raw Data'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleLoadSample}
              size="sm"
            >
              Load Sample
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              size="sm"
            >
              Clear
            </Button>
          </div>

          {suggestions.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
              <h4 className="mb-2 text-sm font-medium text-blue-900">Parsing Suggestions:</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Separator />

        {/* Structured Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Senior Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Google" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://company.com/jobs/123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the job description..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="raw_content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raw Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Complete raw job posting content..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Target Job'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};