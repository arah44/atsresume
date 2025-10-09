/**
 * Authentication Utilities
 * Helper functions for getting user session in server actions and components
 */

import { headers } from 'next/headers';
import { auth } from './auth';

/**
 * Get current user session (for server components and actions)
 * Throws error if no session found
 */
export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error('Unauthorized - Please sign in');
  }

  return {
    user: session.user,
    session,
  };
}

/**
 * Get current userId (convenience function)
 * Throws error if no session found
 */
export async function getUserId(): Promise<string> {
  const { user } = await requireAuth();
  return user.id;
}

/**
 * Get current user session (optional)
 * Returns null if no session found (doesn't throw)
 */
export async function getOptionalAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user ? {
    user: session.user,
    session,
  } : null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return !!session?.user;
}

