/**
 * Better Auth API Route Handler
 * Handles all authentication endpoints:
 * - POST /api/auth/sign-in
 * - POST /api/auth/sign-up
 * - POST /api/auth/sign-out
 * - GET /api/auth/session
 * - etc.
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);

