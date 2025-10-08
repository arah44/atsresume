import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { JobFormData } from './types';
import { SavedJob } from '@/services/jobStorage';
import { JobDataParser } from '@/services/jobDataParser';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AITextarea } from '@/components/ui/ai-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Database, Link2, Sparkles } from 'lucide-react';

interface Step2JobSelectionProps {
  form: UseFormReturn<JobFormData>;
  savedJobs: SavedJob[];
  selectedJobId: string;
  onSelectJob: (jobId: string) => void;
  onSubmit: (data: JobFormData) => void;
  onBack: () => void;
}

export const Step2JobSelection: React.FC<Step2JobSelectionProps> = ({
  form,
  savedJobs,
  selectedJobId,
  onSelectJob,
  onSubmit,
  onBack,
}) => {
  const [jobUrl, setJobUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [rawJobContent, setRawJobContent] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  // Import job from URL using the scrape API
  const handleImportJobFromUrl = async () => {
    if (!jobUrl.trim()) {
      toast.error('Please enter a job URL');
      return;
    }

    setIsImporting(true);
    try {
      const response = await fetch('/api/scrape', {
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

          setRawJobContent(scrapedContent);

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

  const handleParseJobData = async () => {
    if (!rawJobContent.trim()) return;

    setIsParsing(true);
    try {
      const parsed = JobDataParser.parseRawJobData(rawJobContent);

      form.setValue('name', parsed.name || '');
      form.setValue('company', parsed.company || '');
      form.setValue('description', parsed.description || '');
      form.setValue('raw_content', parsed.raw_content || rawJobContent);

      toast.success('Job data parsed successfully!');
    } catch (error) {
      console.error('Failed to parse job data:', error);
      toast.error('Failed to parse job data. Please check the format.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleLoadJob = (jobId: string) => {
    const job = savedJobs.find(j => j.id === jobId);
    if (job) {
      form.setValue('name', job.name);
      form.setValue('company', job.company);
      form.setValue('url', job.url || '');
      form.setValue('description', job.description);
      form.setValue('raw_content', job.raw_content);
      setRawJobContent(job.raw_content);
      onSelectJob(jobId);
      toast.success('Job loaded!');
    }
  };

  return (
    <div className="flex flex-col space-y-4 sm:space-y-6 h-full">
      <div>
        <h3 className="mb-2 text-base sm:text-lg font-semibold">Step 2: Target Job</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Import from URL, load a saved job, or paste the complete job description
        </p>
      </div>

      {/* Import Job from URL - Primary Method */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-4 space-y-3">
          <label className="flex gap-2 items-center text-sm font-semibold text-purple-900">
            <Link2 className="w-4 h-4 text-purple-600" />
            Import Job from URL
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
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

      {/* Load Saved Job */}
      {savedJobs.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4 space-y-2">
            <label className="flex gap-2 items-center text-sm font-semibold text-blue-900">
              <Database className="w-4 h-4 text-blue-600" />
              Load Saved Job ({savedJobs.length} available)
            </label>
            <Select value={selectedJobId} onValueChange={handleLoadJob}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select a job to load..." />
              </SelectTrigger>
              <SelectContent>
                {savedJobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{job.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {job.company} • {new Date(job.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* AI Parse Job Posting */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">Quick Parse Job Posting</label>
          <p className="mb-2 text-xs text-muted-foreground">
            Review the imported content or paste job posting here to auto-extract details
          </p>
        </div>
        <AITextarea
          placeholder="Paste the complete job posting here... ✨ AI-powered parsing"
          className="min-h-[120px] sm:min-h-[150px]"
          value={rawJobContent}
          onChange={(e) => setRawJobContent(e.target.value)}
          showBeam={rawJobContent.length > 0}
          beamColor="#8b5cf6"
          beamColorTo="#06b6d4"
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            onClick={handleParseJobData}
            disabled={!rawJobContent.trim() || isParsing}
            size="sm"
            variant="secondary"
            className="w-full sm:w-auto"
          >
            {isParsing ? (
              <>
                <Loader2 className="mr-2 w-3 h-3 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 w-3 h-3" />
                Parse Job Data
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setRawJobContent('')}
            size="sm"
            className="w-full sm:w-auto"
          >
            Clear
          </Button>
        </div>
      </div>

      <Separator />

      {/* Manual Job Form (Collapsible) */}
      <Accordion type="single" collapsible className="border rounded-lg">
        <AccordionItem value="manual-form" className="border-none">
          <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
            Manual Job Details (Optional)
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          placeholder="Brief job description..."
                          className="min-h-[80px]"
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
                      <FormLabel>Full Job Posting Content</FormLabel>
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
              </form>
            </Form>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex flex-col sm:flex-row gap-2 justify-between pt-4 mt-auto">
        <Button type="button" variant="outline" onClick={onBack} className="w-full sm:w-auto">
          Back
        </Button>
        <Button onClick={form.handleSubmit(onSubmit)} className="w-full sm:w-auto">
          Next: Review
        </Button>
      </div>
    </div>
  );
};

