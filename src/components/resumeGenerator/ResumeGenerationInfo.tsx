'use client';

import { Resume } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Info, Briefcase, FileText, Sparkles, Calendar, Building2, User, TrendingUp } from 'lucide-react';

interface ResumeGenerationInfoProps {
  resume: Resume;
}

export function ResumeGenerationInfo({ resume }: ResumeGenerationInfoProps) {
  const metadata = resume.generationMetadata;

  if (!metadata) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Info className="h-4 w-4" />
            <p className="text-sm">No generation metadata available for this resume</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Generation Details</CardTitle>
          </div>
          <Badge variant="secondary">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(metadata.generatedAt)}
          </Badge>
        </div>
        <CardDescription>
          Information about how this resume was generated
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Target Job Info */}
        {metadata.targetJob && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold">Target Position</h4>
            </div>
            <div className="ml-6 space-y-2">
              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{metadata.targetJob.name}</p>
                  <p className="text-sm text-muted-foreground">{metadata.targetJob.company}</p>
                </div>
              </div>
              {metadata.targetJob.url && (
                <a
                  href={metadata.targetJob.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline ml-7"
                >
                  View Job Posting →
                </a>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Base Resume Info */}
        {metadata.baseResume && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold">Source Profile</h4>
            </div>
            <div className="ml-6 space-y-2">
              <p className="text-sm">
                <span className="font-medium">{metadata.baseResume.name}</span>
              </p>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>{metadata.baseResume.workExperience?.length || 0} jobs</span>
                <span>•</span>
                <span>{metadata.baseResume.skills?.length || 0} skill categories</span>
                <span>•</span>
                <span>{metadata.baseResume.education?.length || 0} education entries</span>
              </div>
            </div>
          </div>
        )}

        {/* Generation Steps (Collapsible) */}
        {metadata.steps && (
          <>
            <Separator />
            <Accordion type="multiple" className="w-full">
              {/* Job Analysis */}
              {metadata.steps.jobAnalysis && (
                <AccordionItem value="job-analysis">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Step 1: Job Analysis</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    {metadata.steps.jobAnalysis.technicalSkills?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Technical Skills Required</p>
                        <div className="flex flex-wrap gap-1">
                          {metadata.steps.jobAnalysis.technicalSkills.map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {metadata.steps.jobAnalysis.softSkills?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Soft Skills Required</p>
                        <div className="flex flex-wrap gap-1">
                          {metadata.steps.jobAnalysis.softSkills.map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {metadata.steps.jobAnalysis.keyResponsibilities?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Key Responsibilities</p>
                        <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                          {metadata.steps.jobAnalysis.keyResponsibilities.slice(0, 5).map((resp, idx) => (
                            <li key={idx}>{resp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Keywords */}
              {metadata.steps.keywordsExtracted && metadata.steps.keywordsExtracted.length > 0 && (
                <AccordionItem value="keywords">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Step 2: ATS Keywords ({metadata.steps.keywordsExtracted.length})</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pt-2">
                    <div className="flex flex-wrap gap-1">
                      {metadata.steps.keywordsExtracted.map((keyword, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Summary Optimization */}
              {metadata.steps.summaryOptimized && (
                <AccordionItem value="summary">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Step 3: Summary Optimization</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    {metadata.steps.originalSummary && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Original</p>
                        <p className="text-sm bg-muted/50 p-3 rounded-md">
                          {metadata.steps.originalSummary}
                        </p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-green-600">Optimized</p>
                      <p className="text-sm bg-green-50 dark:bg-green-950/20 p-3 rounded-md border border-green-200 dark:border-green-800">
                        {metadata.steps.summaryOptimized}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Work Experience Enhancement */}
              {metadata.steps.enhancedWorkExperience && (
                <AccordionItem value="work-experience">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Step 4: Work Experience Enhancement ({metadata.steps.enhancedWorkExperience.length})</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    {metadata.steps.enhancedWorkExperience.map((exp, idx) => (
                      <div key={idx} className="border rounded-md p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{exp.position}</p>
                            <p className="text-xs text-muted-foreground">{exp.company}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {exp.startYear} - {exp.endYear}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{exp.description}</p>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Skills Optimization */}
              {metadata.steps.optimizedSkills && (
                <AccordionItem value="skills">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">Step 5: Skills Optimization</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {metadata.steps.optimizedSkills.map((category, idx) => (
                        <div key={idx} className="border rounded-md p-3 space-y-2">
                          <p className="font-medium text-sm">{category.title}</p>
                          <div className="flex flex-wrap gap-1">
                            {category.skills.map((skill, skillIdx) => (
                              <Badge key={skillIdx} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </>
        )}
      </CardContent>
    </Card>
  );
}

