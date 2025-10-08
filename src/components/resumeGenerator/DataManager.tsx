'use client';
import React, { useState, useEffect } from 'react';
import { DataManagerService, DataManagerState } from '../../services/dataManagerService';
import { PersonForm } from './forms/PersonForm';
import { TargetJobForm } from './forms/TargetJobForm';
import { Person, TargetJobJson, ResumeGenerationInput } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';

interface DataManagerProps {
  onGenerateResume: (input: ResumeGenerationInput) => void;
  isGenerating: boolean;
}

export const DataManager: React.FC<DataManagerProps> = ({
  onGenerateResume,
  isGenerating
}) => {
  const [dataManager] = useState(() => new DataManagerService());
  const [state, setState] = useState<DataManagerState>(dataManager.getState());
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showTargetJobForm, setShowTargetJobForm] = useState(false);

  useEffect(() => {
    const unsubscribe = dataManager.subscribe(setState);
    return unsubscribe;
  }, [dataManager]);

  const handlePersonSubmit = (personData: Person) => {
    dataManager.setPerson(personData);
    setShowPersonForm(false);
  };

  const handleTargetJobSubmit = (targetJobData: TargetJobJson) => {
    dataManager.setTargetJob(targetJobData);
    setShowTargetJobForm(false);
  };

  const handleGenerateResume = () => {
    const input = dataManager.createGenerationInput();
    if (input) {
      onGenerateResume(input);
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      dataManager.clearAllData();
    }
  };

  const validation = dataManager.canGenerateResume();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Data Management</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClearAll}
            disabled={isGenerating}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Base Resume Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Base Resume
            <Badge variant={state.baseResume ? "default" : "secondary"}>
              {state.baseResume ? "Available" : "Not Found"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {state.baseResume ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your base resume will be used to generate tailored resumes for specific jobs.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-lg font-semibold">{state.baseResume.workExperience?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Work Exp.</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{state.baseResume.skills?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Skills</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{state.baseResume.education?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Education</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                No base resume found. Please create your profile first in the Profile page.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Person Data Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Person Data
            <Badge variant={state.person.name ? "default" : "secondary"}>
              {state.person.name ? "Complete" : "Incomplete"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showPersonForm ? (
            <PersonForm
              initialData={state.person}
              onSubmit={handlePersonSubmit}
              onCancel={() => setShowPersonForm(false)}
              isLoading={isGenerating}
            />
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Name</h4>
                <p className="text-sm text-muted-foreground">
                  {state.person.name || 'Not provided'}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Raw Content</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {state.person.raw_content || 'Not provided'}
                </p>
              </div>
              <Button
                onClick={() => setShowPersonForm(true)}
                disabled={isGenerating}
              >
                {state.person.name ? 'Edit Person Data' : 'Add Person Data'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Target Job Data Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Target Job Data
            <Badge variant={state.targetJob.name ? "default" : "secondary"}>
              {state.targetJob.name ? "Complete" : "Incomplete"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showTargetJobForm ? (
            <TargetJobForm
              initialData={state.targetJob}
              onSubmit={handleTargetJobSubmit}
              onCancel={() => setShowTargetJobForm(false)}
              isLoading={isGenerating}
            />
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Job Title</h4>
                <p className="text-sm text-muted-foreground">
                  {state.targetJob.name || 'Not provided'}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Company</h4>
                <p className="text-sm text-muted-foreground">
                  {state.targetJob.company || 'Not provided'}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {state.targetJob.description || 'Not provided'}
                </p>
              </div>
              <Button
                onClick={() => setShowTargetJobForm(true)}
                disabled={isGenerating}
              >
                {state.targetJob.name ? 'Edit Target Job' : 'Add Target Job'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Resume Section */}
      {state.resume && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Current Resume
              <Badge variant="default">Available</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <h4 className="font-medium">Name</h4>
                <p className="text-sm text-muted-foreground">{state.resume.name}</p>
              </div>
              <div>
                <h4 className="font-medium">Target Position</h4>
                <p className="text-sm text-muted-foreground">{state.resume.position}</p>
              </div>
              <div>
                <h4 className="font-medium">Summary</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {state.resume.summary}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Generate Resume Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleGenerateResume}
          disabled={!validation.canGenerate || isGenerating}
          size="lg"
          className="min-w-[200px]"
        >
          {isGenerating ? 'Generating...' : 'Generate Resume'}
        </Button>
      </div>

      {/* Validation Errors */}
      {!validation.canGenerate && (
        <Alert>
          <AlertDescription>
            <strong>Cannot generate resume:</strong>
            <ul className="mt-2 list-disc list-inside">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};