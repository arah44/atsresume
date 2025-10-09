/**
 * Better Auth Configuration (SERVER-SIDE ONLY)
 *
 * WARNING: This file uses MongoDB and Node.js APIs.
 * Do NOT import this in client components or middleware.
 * Use '@/lib/auth-client' for client-side auth instead.
 *
 * Uses separate MongoDB database for authentication:
 * - Database: ATSResumeAuth
 * - Collections: users, sessions, accounts, verificationTokens
 *
 * This is separate from:
 * - ATSResumeCache (AI-generated content cache)
 * - ATSResumeData (user profiles, jobs, resumes, applications)
 */

import "server-only";

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_CONNECTION_STRING) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_CONNECTION_STRING"');
}

// Create a synchronous MongoDB client for Better Auth
// Better Auth expects the adapter to be available immediately
// Connection happens lazily when first auth operation is performed
const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING, {
  retryWrites: true,
  writeConcern: {
    w: 'majority',
  },
});

// Get the database instance synchronously (connection is lazy)
const db = client.db('ATSResumeAuth');

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // Automatically sign in after signup
    requireEmailVerification: false, // Set to true in production
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds (5 minutes)
    },
    updateAge: 24 * 60 * 60, // 24 hours in seconds
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
  },

  advanced: {
    generateId: false, // Use MongoDB ObjectId
  },

  // Base URL for redirects
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Plugins - nextCookies should be the last plugin in the array
  plugins: [nextCookies()],
});

// Export types for use in components
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

