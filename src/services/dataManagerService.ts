import { Person, TargetJobJson, Resume, ResumeGenerationInput } from '../types';
import { validatePersonData, validateTargetJobData, createDefaultPerson, createDefaultTargetJob } from '../utils/dataTransformation';

export interface DataManagerState {
  person: Person;
  targetJob: TargetJobJson;
  baseResume: Resume | null;
  resume: Resume | null;
  isGenerating: boolean;
  error: string | null;
}

/**
 * Data Manager Service
 * Client-side state management for resume generation workflow
 *
 * Note: This is a pure state manager. For persistence, use server actions:
 * - saveProfileAction() for profile/baseResume
 * - saveJobAction() for jobs
 * - saveResumeAction() for resumes
 */
export class DataManagerService {
  private state: DataManagerState;
  private listeners: Set<(state: DataManagerState) => void> = new Set();

  constructor(initialState?: Partial<DataManagerState>) {
    this.state = {
      person: initialState?.person || createDefaultPerson(),
      targetJob: initialState?.targetJob || createDefaultTargetJob(),
      baseResume: initialState?.baseResume || null,
      resume: initialState?.resume || null,
      isGenerating: initialState?.isGenerating || false,
      error: initialState?.error || null
    };
  }

  /**
   * Observer pattern for state updates
   */
  subscribe(listener: (state: DataManagerState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  private updateState(updates: Partial<DataManagerState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Person management
   */
  updatePerson(updates: Partial<Person>): void {
    const updatedPerson = { ...this.state.person, ...updates };
    this.updateState({ person: updatedPerson });
  }

  setPerson(person: Person): void {
    if (!validatePersonData(person)) {
      this.updateState({ error: 'Invalid person data' });
      return;
    }
    this.updateState({ person, error: null });
  }

  /**
   * Target job management
   */
  updateTargetJob(updates: Partial<TargetJobJson>): void {
    const updatedTargetJob = { ...this.state.targetJob, ...updates };
    this.updateState({ targetJob: updatedTargetJob });
  }

  setTargetJob(targetJob: TargetJobJson): void {
    if (!validateTargetJobData(targetJob)) {
      this.updateState({ error: 'Invalid target job data' });
      return;
    }
    this.updateState({ targetJob, error: null });
  }

  /**
   * Base resume management
   */
  setBaseResume(baseResume: Resume | null): void {
    this.updateState({ baseResume });
  }

  /**
   * Resume management
   */
  setResume(resume: Resume | null): void {
    this.updateState({ resume });
  }

  /**
   * Generation state
   */
  setGenerating(isGenerating: boolean): void {
    this.updateState({ isGenerating });
  }

  setError(error: string | null): void {
    this.updateState({ error });
  }

  /**
   * Data validation
   */
  canGenerateResume(): { canGenerate: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.state.baseResume) {
      errors.push('Base resume is required. Please create your profile first.');
    }

    if (!validateTargetJobData(this.state.targetJob)) {
      errors.push('Target job data is invalid');
    }

    return {
      canGenerate: errors.length === 0,
      errors
    };
  }

  /**
   * Generation input creation
   */
  createGenerationInput(): ResumeGenerationInput | null {
    const validation = this.canGenerateResume();
    if (!validation.canGenerate) {
      this.setError(validation.errors.join(', '));
      return null;
    }

    if (!this.state.baseResume) {
      this.setError('Base resume is required');
      return null;
    }

    return {
      baseResume: this.state.baseResume,
      targetJob: this.state.targetJob
    };
  }

  /**
   * Clear all client-side state
   * Note: This does NOT delete from MongoDB
   * Use deleteProfileAction, deleteJobAction, etc. for persistence
   */
  clearAllData(): void {
    this.state = {
      person: createDefaultPerson(),
      targetJob: createDefaultTargetJob(),
      baseResume: null,
      resume: null,
      isGenerating: false,
      error: null
    };
    this.notifyListeners();
  }

  /**
   * Getters
   */
  getState(): DataManagerState {
    return { ...this.state };
  }

  getPerson(): Person {
    return { ...this.state.person };
  }

  getTargetJob(): TargetJobJson {
    return { ...this.state.targetJob };
  }

  getBaseResume(): Resume | null {
    return this.state.baseResume ? { ...this.state.baseResume } : null;
  }

  getResume(): Resume | null {
    return this.state.resume ? { ...this.state.resume } : null;
  }

  getIsGenerating(): boolean {
    return this.state.isGenerating;
  }

  getError(): string | null {
    return this.state.error;
  }
}
