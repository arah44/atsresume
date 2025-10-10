import { z } from 'zod';

// Zod schemas for validation
export const personSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  raw_content: z.string().min(10, 'Profile content must be at least 10 characters')
});

export const targetJobSchema = z.object({
  name: z.string().min(1, 'Job title is required'),
  url: z.string().optional(),
  company: z.string().min(1, 'Company name is required'),
  description: z.string().min(1, 'Description is required'),
  raw_content: z.string().min(1, 'Raw content is required'),
  apply_url: z.string().optional(),
  is_easy_apply: z.boolean().optional(),
  remote_allowed: z.boolean().optional()
});
