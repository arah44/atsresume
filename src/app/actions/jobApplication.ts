'use server';

/**
 * Server actions for job application auto-apply workflow
 */

import { JobApplicationService } from '@/services/browserbase/JobApplicationService';
import { UserData } from '@/services/browserbase/FieldMapper';
import { ApplicationPreview, ApplicationDetail } from '@/types';

export interface AutoApplyInitResult {
  success: boolean;
  sessionId?: string;
  unknownQuestions?: Array<{ question: string; field_type: string }>;
  error?: string;
}

export interface AutoApplyPreviewResult {
  success: boolean;
  preview?: ApplicationPreview;
  error?: string;
}

export interface AutoApplySubmitResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Initialize auto-apply session and fill form
 */
export async function initAutoApplyAction(
  applyUrl: string,
  userData: UserData
): Promise<AutoApplyInitResult> {
  const service = new JobApplicationService();

  try {
    // Initialize session
    await service.initSession();

    // Set user data
    service.setUserData(userData);

    // Navigate to application page
    await service.navigateToApplication(applyUrl);

    // Observe form fields
    await service.observeFormFields();

    // Fill form fields
    const { filled, unknown } = await service.fillFormFields();

    console.log(`Filled ${filled.length} fields, ${unknown.length} unknown fields`);

    // If there are unknown questions, return them
    if (unknown.length > 0) {
      const sessionId = service.getSessionId();
      await service.close(); // Close for now, will reopen when user provides answers

      return {
        success: false,
        unknownQuestions: unknown,
        error: 'Additional information required'
      };
    }

    // Get session ID
    const sessionId = service.getSessionId();

    return {
      success: true,
      sessionId: sessionId || undefined
    };
  } catch (error) {
    await service.close();
    console.error('Auto-apply initialization failed:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize auto-apply'
    };
  }
}

/**
 * Fill unknown fields and get preview
 */
export async function fillUnknownFieldsAction(
  applyUrl: string,
  userData: UserData,
  answers: ApplicationDetail[]
): Promise<AutoApplyPreviewResult> {
  const service = new JobApplicationService();

  try {
    // Initialize new session
    await service.initSession();
    service.setUserData(userData);

    // Navigate to application page
    await service.navigateToApplication(applyUrl);

    // Observe and fill known fields first
    await service.observeFormFields();
    await service.fillFormFields();

    // Fill unknown fields with user answers
    await service.fillUnknownFields(answers);

    // Get preview
    const preview = await service.extractFormPreview();

    // Keep session open for submission
    const sessionId = service.getSessionId();

    // Note: We're not closing the session here - it will be used for submission
    // In a production app, you'd need session persistence (e.g., Redis)
    // For now, we'll extract preview and close
    await service.close();

    return {
      success: true,
      preview
    };
  } catch (error) {
    await service.close();
    console.error('Failed to fill unknown fields:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fill fields'
    };
  }
}

/**
 * Get application preview without unknown fields
 */
export async function getApplicationPreviewAction(
  applyUrl: string,
  userData: UserData
): Promise<AutoApplyPreviewResult> {
  const service = new JobApplicationService();

  try {
    // Initialize session
    await service.initSession();
    service.setUserData(userData);

    // Navigate and fill
    await service.navigateToApplication(applyUrl);
    await service.observeFormFields();
    await service.fillFormFields();

    // Get preview
    const preview = await service.extractFormPreview();

    // Close session after preview
    await service.close();

    return {
      success: true,
      preview
    };
  } catch (error) {
    await service.close();
    console.error('Failed to get preview:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get preview'
    };
  }
}

/**
 * Submit application (creates new session, fills, and submits)
 */
export async function submitApplicationAction(
  applyUrl: string,
  userData: UserData,
  additionalAnswers?: ApplicationDetail[]
): Promise<AutoApplySubmitResult> {
  const service = new JobApplicationService();

  try {
    // Initialize session
    await service.initSession();
    service.setUserData(userData);

    // Navigate and fill
    await service.navigateToApplication(applyUrl);
    await service.observeFormFields();
    await service.fillFormFields();

    // Fill any additional answers
    if (additionalAnswers && additionalAnswers.length > 0) {
      await service.fillUnknownFields(additionalAnswers);
    }

    // Submit the form
    const result = await service.submitForm();

    // Close session
    await service.close();

    return {
      success: result.success,
      message: result.message
    };
  } catch (error) {
    await service.close();
    console.error('Failed to submit application:', error);

    return {
      success: false,
      message: 'Failed to submit application',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

