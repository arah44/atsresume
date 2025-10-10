/**
 * Error handling utilities for user-friendly error messages
 */

import { ZodError } from 'zod';

export interface UserFriendlyError {
  title: string;
  message: string;
  suggestion?: string;
  technicalDetails?: string;
}

export type ErrorType =
  | 'validation'
  | 'pdf'
  | 'parsing'
  | 'api'
  | 'network'
  | 'auth'
  | 'permission'
  | 'file_upload'
  | 'unknown';

/**
 * Categorize error type for better handling
 */
export function getErrorType(error: unknown): ErrorType {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Check if it's a Zod validation error
  if (error instanceof ZodError || errorMessage.includes('ZodError')) {
    return 'validation';
  }

  if (errorMessage.includes('PDF') || errorMessage.includes('pdf')) {
    return 'pdf';
  }

  if (errorMessage.includes('Failed to parse') || errorMessage.includes('OUTPUT_PARSING_FAILURE')) {
    return 'parsing';
  }

  if (errorMessage.includes('API') || errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
    return 'api';
  }

  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('timeout')) {
    return 'network';
  }

  if (errorMessage.includes('auth') || errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
    return 'auth';
  }

  if (errorMessage.includes('permission') || errorMessage.includes('forbidden') || errorMessage.includes('403')) {
    return 'permission';
  }

  if (errorMessage.includes('file size') || errorMessage.includes('file type') || errorMessage.includes('upload')) {
    return 'file_upload';
  }

  return 'unknown';
}

/**
 * Convert technical errors to user-friendly messages
 */
export function parseErrorMessage(error: unknown): UserFriendlyError {
  // Handle Zod validation errors specifically
  if (error instanceof ZodError) {
    const issues = error.issues;
    const fieldErrors = issues.map(issue => {
      const fieldName = issue.path.join('.') || 'field';
      return `${fieldName}: ${issue.message}`;
    }).join('\n• ');

    return {
      title: 'Validation Error',
      message: 'Please check the following fields:',
      suggestion: '• ' + fieldErrors + '\n\nPlease fill in all required fields before submitting.',
      technicalDetails: JSON.stringify(issues, null, 2)
    };
  }

  const errorMessage = error instanceof Error ? error.message : String(error);

  // PDF extraction errors
  if (errorMessage.includes('PDF') || errorMessage.includes('pdf')) {
    return {
      title: 'PDF Upload Failed',
      message: 'We couldn\'t extract text from your PDF file.',
      suggestion: 'Try using the "Paste Text" option instead, or ensure your PDF contains readable text (not just images).',
      technicalDetails: errorMessage
    };
  }

  // Base resume generation errors - parsing failures
  if (errorMessage.includes('Failed to parse') || errorMessage.includes('OUTPUT_PARSING_FAILURE')) {
    return {
      title: 'Resume Processing Issue',
      message: 'Our AI had trouble understanding your resume format.',
      suggestion: 'This usually happens with incomplete resumes. Please ensure your resume includes:\n\n• Full name\n• Work experience (at least one role)\n• Education\n• Skills (at least 3)\n\nTry editing your content and submitting again.',
      technicalDetails: errorMessage
    };
  }

  // Validation errors - empty fields
  if (errorMessage.includes('too_small') || errorMessage.includes('minimum')) {
    return {
      title: 'Incomplete Resume Data',
      message: 'Your resume is missing some required information.',
      suggestion: 'Please make sure your resume includes:\n\n• Your full name\n• At least one work experience\n• At least one education entry\n• At least 3 skills\n\nTry adding more details to your resume.',
      technicalDetails: errorMessage
    };
  }

  // LLM/API errors
  if (errorMessage.includes('API') || errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
    return {
      title: 'Service Temporarily Unavailable',
      message: 'We\'re experiencing high demand right now.',
      suggestion: 'Please try again in a few minutes. If the problem persists, contact support.',
      technicalDetails: errorMessage
    };
  }

  // Invalid data errors
  if (errorMessage.includes('Invalid') || errorMessage.includes('required')) {
    return {
      title: 'Invalid Resume Data',
      message: 'Some required information is missing from your resume.',
      suggestion: 'Please ensure your resume includes your name and detailed work experience, education, and skills.',
      technicalDetails: errorMessage
    };
  }

  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('timeout')) {
    return {
      title: 'Connection Error',
      message: 'We couldn\'t connect to our servers.',
      suggestion: 'Please check your internet connection and try again.',
      technicalDetails: errorMessage
    };
  }

  // Authentication errors
  if (errorMessage.includes('auth') || errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
    return {
      title: 'Authentication Required',
      message: 'You need to be signed in to perform this action.',
      suggestion: 'Please sign in and try again. If you are signed in, try refreshing the page.',
      technicalDetails: errorMessage
    };
  }

  // Permission errors
  if (errorMessage.includes('permission') || errorMessage.includes('forbidden') || errorMessage.includes('403')) {
    return {
      title: 'Permission Denied',
      message: 'You don\'t have permission to perform this action.',
      suggestion: 'Please contact support if you believe this is an error.',
      technicalDetails: errorMessage
    };
  }

  // File upload errors
  if (errorMessage.includes('file size') || errorMessage.includes('file type') || errorMessage.includes('too large')) {
    return {
      title: 'File Upload Error',
      message: 'The file you\'re trying to upload is not valid.',
      suggestion: 'Please ensure your file is a PDF under 10MB in size.',
      technicalDetails: errorMessage
    };
  }

  // Generic error
  return {
    title: 'Something Went Wrong',
    message: 'We encountered an unexpected error while processing your resume.',
    suggestion: 'Please try again. If the problem continues, try using the "Paste Text" option or contact support.',
    technicalDetails: errorMessage
  };
}

/**
 * Get a short, user-friendly error message for toasts
 */
export function getShortErrorMessage(error: unknown): string {
  const parsed = parseErrorMessage(error);
  return parsed.message;
}

/**
 * Extract relevant error details without overwhelming technical jargon
 */
export function getRelevantErrorDetails(error: unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Extract just the relevant part, not the full stack
  if (errorMessage.includes('Failed to parse')) {
    // Extract validation errors if present
    const validationMatch = errorMessage.match(/Error: \[([\s\S]*?)\]/);
    if (validationMatch) {
      try {
        const errors = JSON.parse(`[${validationMatch[1]}]`);
        return errors
          .map((e: any) => `• ${e.path?.join('.') || 'field'}: ${e.message}`)
          .join('\n');
      } catch {
        return 'Validation failed - please check your resume content';
      }
    }
  }

  // Return first line of error (usually most relevant)
  return errorMessage.split('\n')[0];
}

