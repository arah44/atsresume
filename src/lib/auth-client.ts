/**
 * Better Auth Client for React Components
 * Provides client-side auth hooks and methods
 */

'use client';

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});

// Export types for better TypeScript support
export type { Session } from './auth';

// Re-export commonly used client methods for convenience
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;

