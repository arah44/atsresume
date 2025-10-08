/**
 * Client-side PDF validation utilities
 */

/**
 * Validate PDF file before upload
 */
export function validatePdfFile(
  fileSize: number,
  fileType: string,
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (fileSize > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`
    };
  }

  // Check file type
  if (fileType !== 'application/pdf') {
    return {
      valid: false,
      error: 'File must be a PDF'
    };
  }

  return { valid: true };
}

