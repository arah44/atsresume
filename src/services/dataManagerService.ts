import { Person, TargetJobJson, Resume, ResumeGenerationInput } from '../types';
import { LocalStorageService } from './localStorage';
import { validatePersonData, validateTargetJobData, createDefaultPerson, createDefaultTargetJob } from '../utils/dataTransformation';

export interface DataManagerState {
  person: Person;
  targetJob: TargetJobJson;
  baseResume: Resume | null;  // Base resume from user profile
  resume: Resume | null;       // Currently generated resume
  isGenerating: boolean;
  error: string | null;
}

export class DataManagerService {
  private state: DataManagerState;
  private listeners: Set<(state: DataManagerState) => void> = new Set();

  constructor() {
    this.state = {
      person: createDefaultPerson(),
      targetJob: createDefaultTargetJob(),
      baseResume: null,
      resume: null,
      isGenerating: false,
      error: null
    };
    this.loadFromStorage();
  }

  // Observer pattern for state updates
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

  // Person management
  updatePerson(updates: Partial<Person>): void {
    const updatedPerson = { ...this.state.person, ...updates };
    this.updateState({ person: updatedPerson });
    this.saveToStorage();
  }

  setPerson(person: Person): void {
    if (!validatePersonData(person)) {
      this.updateState({ error: 'Invalid person data' });
      return;
    }
    this.updateState({ person, error: null });
    this.saveToStorage();
  }

  // Target job management
  updateTargetJob(updates: Partial<TargetJobJson>): void {
    const updatedTargetJob = { ...this.state.targetJob, ...updates };
    this.updateState({ targetJob: updatedTargetJob });
    this.saveToStorage();
  }

  setTargetJob(targetJob: TargetJobJson): void {
    if (!validateTargetJobData(targetJob)) {
      this.updateState({ error: 'Invalid target job data' });
      return;
    }
    this.updateState({ targetJob, error: null });
    this.saveToStorage();
  }

  // Base resume management
  setBaseResume(baseResume: Resume | null): void {
    this.updateState({ baseResume });
  }

  // Resume management
  setResume(resume: Resume | null): void {
    this.updateState({ resume });
    this.saveToStorage();
  }

  // Generation state
  setGenerating(isGenerating: boolean): void {
    this.updateState({ isGenerating });
  }

  setError(error: string | null): void {
    this.updateState({ error });
  }

  // Data validation
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

  // Generation input creation
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

  // Storage operations
  private loadFromStorage(): void {
    const stored = LocalStorageService.loadAll();

    if (stored.person) {
      this.state.person = stored.person;
    }
    if (stored.targetJob) {
      this.state.targetJob = stored.targetJob;
    }
    if (stored.resume) {
      this.state.resume = stored.resume;
    }

    // Load base resume from user profile
    const baseResume = LocalStorageService.loadBaseResume();
    if (baseResume) {
      this.state.baseResume = baseResume;
    }

    this.notifyListeners();
  }

  private saveToStorage(): void {
    LocalStorageService.savePerson(this.state.person);
    LocalStorageService.saveTargetJob(this.state.targetJob);
    if (this.state.resume) {
      LocalStorageService.saveResume(this.state.resume);
    }
  }

  // Data operations
  clearAllData(): void {
    this.state = {
      person: createDefaultPerson(),
      targetJob: createDefaultTargetJob(),
      baseResume: null,
      resume: null,
      isGenerating: false,
      error: null
    };
    LocalStorageService.clearAll();
    this.notifyListeners();
  }

  exportData(): string | null {
    return LocalStorageService.exportData();
  }

  importData(jsonString: string): boolean {
    const success = LocalStorageService.importData(jsonString);
    if (success) {
      this.loadFromStorage();
    }
    return success;
  }

  // Getters
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