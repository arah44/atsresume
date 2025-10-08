'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Link2, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { TargetJobJson } from '@/types';

interface BulkJobImportProps {
  onJobsImported: (jobs: TargetJobJson[]) => void;
  onCancel: () => void;
}

interface ScrapedJob {
  url: string;
  success: boolean;
  job?: TargetJobJson;
  error?: string;
}

export function BulkJobImport({ onJobsImported, onCancel }: BulkJobImportProps) {
  const [urls, setUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScrapedJob[]>([]);

  const handleImport = async () => {
    // Parse URLs from textarea (one per line)
    const urlList = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urlList.length === 0) {
      toast.error('Please enter at least one URL');
      return;
    }

    if (urlList.length > 10) {
      toast.error('Maximum 10 URLs allowed at a time');
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: urlList }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to scrape URLs');
      }

      const data = await response.json();
      setResults(data.results);

      // Filter successful jobs
      const successfulJobs = data.results
        .filter((r: ScrapedJob) => r.success && r.job)
        .map((r: ScrapedJob) => r.job!);

      if (successfulJobs.length > 0) {
        toast.success(`Successfully imported ${successfulJobs.length} job(s)`);
        onJobsImported(successfulJobs);
      } else {
        toast.error('No jobs could be imported');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import jobs');
    } finally {
      setLoading(false);
    }
  };

  const parseCount = urls.split('\n').filter(url => url.trim().length > 0).length;

  return (
    <div className="space-y-4">
      <CardHeader className="px-0">
        <CardTitle>Bulk Import Jobs</CardTitle>
        <CardDescription>
          Paste job posting URLs (one per line, max 10)
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 space-y-4">
        {/* URL Input */}
        <div className="space-y-2">
          <Textarea
            placeholder="https://linkedin.com/jobs/view/123&#x0a;https://indeed.com/viewjob?jk=456&#x0a;https://example.com/careers/job/789"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            rows={8}
            disabled={loading}
            className="font-mono text-sm"
          />
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>{parseCount} URL{parseCount !== 1 ? 's' : ''} detected</span>
            {parseCount > 10 && (
              <span className="text-destructive">Maximum 10 URLs allowed</span>
            )}
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Import Results</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {results.map((result, index) => (
                <Alert
                  key={index}
                  variant={result.success ? 'default' : 'destructive'}
                  className="py-2"
                >
                  <div className="flex items-start gap-2">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      {result.success ? (
                        <div>
                          <p className="font-semibold text-sm">{result.job?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {result.job?.company} • {result.url}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-semibold">Failed</p>
                          <p className="text-xs truncate">{result.url}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {result.error}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Info Alert */}
        {!loading && results.length === 0 && (
          <Alert>
            <Link2 className="w-4 h-4" />
            <AlertDescription className="ml-2">
              Supported job boards: LinkedIn, Indeed, Glassdoor, Monster, ZipRecruiter,
              Dice, Wellfound, Greenhouse, Lever, and most career pages.
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={loading || parseCount === 0 || parseCount > 10}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 w-4 h-4" />
                Import {parseCount > 0 ? `${parseCount} Job${parseCount !== 1 ? 's' : ''}` : 'Jobs'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </div>
  );
}

