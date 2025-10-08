"use client"

import React, { createContext, useState, useCallback, useContext, useEffect } from "react";
import { ResumeContextType, Person, TargetJobJson, Resume, ResumeGenerationInput, Generation, GenerationStatus } from "../types";
import { generateResumeAction } from "../app/actions/resumeGeneration";
import { DataManagerService } from "../services/dataManagerService";
import DefaultResumeData from "../components/utility/DefaultResumeData";
import { ensureResumeId } from "../utils/resumeHash";

// Create the context
const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

// Helper to generate unique IDs
const generateId = () => `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Provider component
export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Data manager service (client-side state management only)
  const [dataManager] = useState(() => new DataManagerService());

  // Legacy resume data (for backward compatibility)
  const [resumeData, setResumeDataInternal] = useState<Resume>(DefaultResumeData);

  // Wrapper to sync resumeData changes to localStorage (for backward compatibility with legacy storage)
  const setResumeData = useCallback((resume: Resume | ((prev: Resume) => Resume)) => {
    setResumeDataInternal(prev => {
      const newResume = typeof resume === 'function' ? resume(prev) : resume;

      // Also sync to legacy localStorage key (atsresume_resume)
      // This ensures changes persist even without explicit save
      try {
        localStorage.setItem('atsresume_resume', JSON.stringify(newResume));
        console.log('🔄 Auto-synced resumeData to localStorage');
      } catch (error) {
        console.error('Failed to sync resumeData to localStorage:', error);
      }

      return newResume;
    });
  }, []);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentGeneration, setCurrentGeneration] = useState<Generation | undefined>(undefined);
  const [generationHistory, setGenerationHistory] = useState<Generation[]>([]);

  // Sync data manager state with context state
  useEffect(() => {
    const unsubscribe = dataManager.subscribe((state) => {
      if (state.resume) {
        setResumeData(state.resume);
      }
    });
    return unsubscribe;
  }, [dataManager]);

  // Helper to update generation state
  const updateGenerationState = useCallback((
    generation: Generation,
    updates: Partial<Generation>
  ): Generation => {
    const updated = { ...generation, ...updates };
    setCurrentGeneration(updated);
    setGenerationHistory(prev =>
      prev.map(g => g.id === generation.id ? updated : g)
    );
    return updated;
  }, []);

  // Generate resume using the new input structure
  const generateResume = useCallback(async (input: ResumeGenerationInput) => {
    const startTime = Date.now();
    const generationId = generateId();

    // Create new generation
    const generation: Generation = {
      id: generationId,
      status: GenerationStatus.PENDING,
      progress: 0,
      currentStep: 'Initializing...',
      input,
      createdAt: new Date(),
      metadata: {
        jobTitle: input.targetJob.name,
        company: input.targetJob.company
      }
    };

    setCurrentGeneration(generation);
    setGenerationHistory(prev => [generation, ...prev]);
    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);
    setCurrentStep('Initializing...');

    try {
      // Step 1: Analyzing job requirements
      let updatedGen = updateGenerationState(generation, {
        status: GenerationStatus.ANALYZING_JOB,
        progress: 25,
        currentStep: 'Analyzing job requirements...'
      });
      setGenerationProgress(25);
      setCurrentStep('Analyzing job requirements...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Allow UI to update

      // Step 2: Extracting keywords
      updatedGen = updateGenerationState(updatedGen, {
        status: GenerationStatus.EXTRACTING_KEYWORDS,
        progress: 50,
        currentStep: 'Extracting ATS keywords...'
      });
      setGenerationProgress(50);
      setCurrentStep('Extracting ATS keywords...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Generate final resume
      updatedGen = updateGenerationState(updatedGen, {
        status: GenerationStatus.GENERATING_RESUME,
        progress: 75,
        currentStep: 'Generating optimized resume...'
      });
      setGenerationProgress(75);
      setCurrentStep('Generating optimized resume...');

      // Call server action directly (respects client-server boundary)
      const result = await generateResumeAction(input);

      // Add unique ID to resume
      const resumeWithId = ensureResumeId(result.resume);

      // Complete
      const duration = Date.now() - startTime;
      updatedGen = updateGenerationState(updatedGen, {
        status: GenerationStatus.COMPLETED,
        progress: 100,
        currentStep: 'Resume generated successfully!',
        result: resumeWithId,
        completedAt: new Date(),
        metadata: {
          jobTitle: updatedGen.metadata?.jobTitle || input.targetJob.name,
          company: updatedGen.metadata?.company || input.targetJob.company,
          duration
        }
      });
      setGenerationProgress(100);
      setCurrentStep('Resume generated successfully!');
      setResumeData(resumeWithId);

      // Update data manager with the new resume (with ID)
      dataManager.setResume(resumeWithId);

      // Clear progress after a delay
      setTimeout(() => {
        setIsGenerating(false);
        setCurrentStep('');
        setGenerationProgress(0);
      }, 1500);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      const duration = Date.now() - startTime;

      updateGenerationState(generation, {
        status: GenerationStatus.FAILED,
        currentStep: 'Generation failed',
        error: errorMessage,
        completedAt: new Date(),
        metadata: {
          jobTitle: generation.metadata?.jobTitle || input.targetJob.name,
          company: generation.metadata?.company || input.targetJob.company,
          duration
        }
      });

      setError(`Resume generation failed: ${errorMessage}`);
      console.error('Resume generation error:', err);
      setIsGenerating(false);
      setCurrentStep('');
      setGenerationProgress(0);
    }
  }, [dataManager, updateGenerationState]);

  // Legacy methods for backward compatibility
  const loadPersonData = useCallback((data: Person) => {
    dataManager.setPerson(data);
  }, [dataManager]);

  const loadTargetJobData = useCallback((data: TargetJobJson) => {
    dataManager.setTargetJob(data);
  }, [dataManager]);

  const validatePersonData = useCallback((data: any): data is Person => {
    return data && typeof data.name === 'string' && typeof data.raw_content === 'string';
  }, []);

  const validateTargetJobData = useCallback((data: any): data is TargetJobJson => {
    return data &&
           typeof data.name === 'string' &&
           typeof data.company === 'string' &&
           typeof data.description === 'string' &&
           typeof data.raw_content === 'string';
  }, []);

  const syncPersonAndTargetJobToResume = useCallback(() => {
    const state = dataManager.getState();
    if (state.baseResume && state.targetJob) {
      const input: ResumeGenerationInput = {
        baseResume: state.baseResume,
        targetJob: state.targetJob
      };
      generateResume(input);
    }
  }, [dataManager, generateResume]);

  const syncResumeToPerson = useCallback(() => {
    // This would extract person data from resume, but with the new architecture
    // person data is separate from resume data
    console.log('syncResumeToPerson: Not applicable in new architecture');
  }, []);

  const createNewPerson = useCallback(() => {
    return dataManager.getPerson();
  }, [dataManager]);

  const createNewTargetJob = useCallback(() => {
    return dataManager.getTargetJob();
  }, [dataManager]);

  const clearAllData = useCallback(() => {
    dataManager.clearAllData();
    setResumeData(DefaultResumeData);
    setError(null);
  }, [dataManager]);

  // Generation history methods
  const getGenerationById = useCallback((id: string): Generation | undefined => {
    return generationHistory.find(g => g.id === id);
  }, [generationHistory]);

  const clearGenerationHistory = useCallback(() => {
    setGenerationHistory([]);
    setCurrentGeneration(undefined);
  }, []);

  // Handler for input changes (backward compatibility)
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      [name]: value
      // Keep existing ID - never regenerate it on changes!
    }));
  }, [setResumeData]);

  // Handler for profile picture upload (backward compatibility)
  const handleProfilePicture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResumeData(prev => ({
          ...prev,
          profilePicture: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const contextValue: ResumeContextType = {
    // Legacy resume data
    resumeData,
    setResumeData,

    // New data management
    personData: dataManager.getPerson(),
    targetJobData: dataManager.getTargetJob(),

    // Generation state
    isGenerating,
    generationProgress,
    currentStep,
    error,
    currentGeneration,
    generationHistory,

    // Methods
    generateResume,
    loadPersonData,
    loadTargetJobData,
    validatePersonData,
    validateTargetJobData,
    syncPersonAndTargetJobToResume,
    syncResumeToPerson,
    createNewPerson,
    createNewTargetJob,
    clearAllData,

    // Generation history methods
    getGenerationById,
    clearGenerationHistory,

    // Backward compatibility handlers
    handleChange,
    handleProfilePicture,

    // Data manager access
    dataManager
  };

  return (
    <ResumeContext.Provider value={contextValue}>
      {children}
    </ResumeContext.Provider>
  );
};

// Hook to use the context
export const useResumeContext = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResumeContext must be used within a ResumeProvider');
  }
  return context;
};