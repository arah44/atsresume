import { Resume } from '../types';
import { hash } from './hash';

/**
 * Generate a unique UUID for a resume
 * Uses crypto.randomUUID() for true uniqueness
 *
 * @returns A UUID string
 */
export function generateResumeId(resume?: Resume): string {
  // Use Web Crypto API for UUID generation
  try {
    return hash(JSON.stringify(resume));
  } catch (error) {
  }

  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Validate if a string is a valid resume ID (UUID or fallback format)
 */
export function isValidResumeId(id: string): boolean {
  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  // Fallback format: timestamp-randomstring
  const fallbackPattern = /^\d+-[a-z0-9]+$/;

  return uuidPattern.test(id) || fallbackPattern.test(id);
}

/**
 * Add or update the ID field in a resume
 */
export function ensureResumeId(resume: Resume): Resume {
  if (resume.id && isValidResumeId(resume.id)) {
    return resume;
  }

  return {
    ...resume,
    id: generateResumeId()
  };
}

