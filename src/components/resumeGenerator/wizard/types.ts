import { z } from 'zod';

// Job data schema (simplified - most fields optional since we get from URL import or AI parse)
export const jobSchema = z.object({
  name: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  url: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  raw_content: z.string().min(10, 'Job content is required'),
  apply_url: z.string().optional(),
  is_easy_apply: z.boolean().optional(),
  remote_allowed: z.boolean().optional()
});

export type JobFormData = z.infer<typeof jobSchema>;

