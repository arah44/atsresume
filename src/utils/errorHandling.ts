/**
 * Error handling utilities for user-friendly error messages
 */

export interface UserFriendlyError {
  title: string;
  message: string;
  suggestion?: string;
  technicalDetails?: string;
}

/**
 * Convert technical errors to user-friendly messages
 */
export function parseErrorMessage(error: unknown): UserFriendlyError {
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
    const validationMatch = errorMessage.match(/Error: \[(.*?)\]/s);
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

