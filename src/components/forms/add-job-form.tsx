'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { JobFormData, jobSchema } from '@/types';
import { JobDataParser } from '@/lib/scraper/job-scraper/';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AITextarea } from '@/components/ui/ai-textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Link2, Sparkles } from 'lucide-react';

interface AddJobFormProps {
  initialData?: Partial<JobFormData>;
  onSubmit: (data: JobFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  showUrlImport?: boolean;
}

export const AddJobForm: React.FC<AddJobFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  showUrlImport = true
}) => {
  const [jobUrl, setJobUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [rawContent, setRawContent] = useState(initialData?.raw_content || '');
  const [isParsing, setIsParsing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      name: initialData?.name || '',
      company: initialData?.company || '',
      url: initialData?.url || '',
      description: initialData?.description || '',
      raw_content: initialData?.raw_content || '',
      apply_url: initialData?.apply_url || '',
      is_easy_apply: initialData?.is_easy_apply || false,
      remote_allowed: initialData?.remote_allowed || false
    }
  });

  // Import job from URL using the scrape API
  const handleImportJobFromUrl = async () => {
    if (!jobUrl.trim()) {
      toast.error('Please enter a job URL');
      return;
    }

    setIsImporting(true);
    try {
      const response = await fetch('/api/scrape-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls: [jobUrl]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to scrape job');
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];

        if (result.success && result.data) {
          // Populate the raw job content textarea with scraped data
          const scrapedContent = `${result.data.title ? `Title: ${result.data.title}\n\n` : ''}${result.data.company ? `Company: ${result.data.company}\n\n` : ''}${result.data.location ? `Location: ${result.data.location}\n\n` : ''}${result.data.description || result.data.content || ''}`;

          setRawContent(scrapedContent);

          // Also set the URL field
          form.setValue('url', jobUrl);

          toast.success('Job imported successfully! Review and parse the content below.');
        } else {
          toast.error(result.error || 'Failed to import job');
        }
      }
    } catch (error) {
      console.error('Failed to import job:', error);
      toast.error('Failed to import job from URL');
    } finally {
      setIsImporting(false);
    }
  };

  const jobDataParser = new JobDataParser();

  const handleParseRawData = async () => {
    if (!rawContent.trim()) return;

    setIsParsing(true);
    setSuggestions([]);

    try {
      const parsed = await jobDataParser.parseRawJobData(rawContent);
      const newSuggestions = JobDataParser.getSuggestions(parsed);

      // Update form with parsed data
      form.setValue('name', parsed.name || '');
      form.setValue('company', parsed.company || '');
      form.setValue('description', parsed.description || '');
      form.setValue('raw_content', parsed.raw_content || rawContent);

      setSuggestions(newSuggestions);
      toast.success('Job data parsed successfully!');
    } catch (error) {
      console.error('Failed to parse raw data:', error);
      setSuggestions(['Failed to parse raw data. Please check the format.']);
      toast.error('Failed to parse job data');
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

  const handleFormSubmit = (data: JobFormData) => {
    onSubmit({
      ...data,
      url: data.url || '',
      raw_content: rawContent || data.raw_content
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Target Job</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* URL Import Section */}
        {showUrlImport && (
          <>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-4 space-y-3">
                <label className="flex gap-2 items-center text-sm font-semibold text-purple-900">
                  <Link2 className="w-4 h-4 text-purple-600" />
                  Import Job from URL
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder="https://company.com/careers/job-posting"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isImporting) {
                        e.preventDefault();
                        handleImportJobFromUrl();
                      }
                    }}
                    className="flex-1 bg-white"
                    disabled={isImporting}
                  />
                  <Button
                    onClick={handleImportJobFromUrl}
                    disabled={!jobUrl.trim() || isImporting}
                    className="w-full sm:w-auto"
                    type="button"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Link2 className="mr-2 w-4 h-4" />
                        Import
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-purple-700">
                  Paste a job URL to automatically import the job posting details
                </p>
              </CardContent>
            </Card>

            <Separator />
          </>
        )}

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
              variant="secondary"
            >
              {isParsing ? (
                <>
                  <Loader2 className="mr-2 w-3 h-3 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 w-3 h-3" />
                  Parse Raw Data
                </>
              )}
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
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
                  <FormLabel>Job Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief job description..."
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
                      value={rawContent || field.value}
                      onChange={(e) => {
                        setRawContent(e.target.value);
                        field.onChange(e);
                      }}
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
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
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

