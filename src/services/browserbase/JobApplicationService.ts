/**
 * Job Application Service using Browserbase Stagehand
 * Handles automated job application form filling and submission
 */

import { z } from "zod";
import { BaseStagehandService } from "./BaseStagehandService";
import { FieldMapper, UserData, MappedField } from "./FieldMapper";
import { ApplicationPreview, PreviewField, ApplicationDetail } from "@/types";

export interface FormField {
  label: string;
  value: string;
  selector: string;
  type: string;
  method: string;
  description: string;
}

export interface NewQuestionPrompt {
  question: string;
  field_type: string;
  suggested_answer?: string;
}

export class JobApplicationService extends BaseStagehandService {
  private fieldMapper: FieldMapper | null = null;
  private userData: UserData | null = null;
  private formFields: FormField[] = [];
  private unknownQuestions: NewQuestionPrompt[] = [];

  /**
   * Set user data for form filling
   */
  setUserData(userData: UserData): void {
    this.userData = userData;
    this.fieldMapper = new FieldMapper(userData);
  }

  /**
   * Navigate to application URL and analyze form
   */
  async navigateToApplication(applyUrl: string): Promise<void> {
    if (!this.isSessionActive()) {
      throw new Error("Session not initialized. Call initSession() first.");
    }

    await this.navigate(applyUrl);
    await this.wait(2000); // Wait for page to fully load
  }

  /**
   * Observe all form fields on the page
   */
  async observeFormFields(): Promise<FormField[]> {
    if (!this.page) {
      throw new Error("Session not active");
    }

    const observed = await this.page.observe({
      instruction: "Find all form input fields, textareas, select dropdowns, checkboxes, and file upload fields for job application",
      returnAction: true,
    });

    this.formFields = observed.map((field: any) => ({
      label: field.description || '',
      value: '',
      selector: field.selector || '',
      type: field.type || 'text',
      method: field.method || 'click',
      description: field.description || '',
    }));

    return this.formFields;
  }

  /**
   * Fill form fields with user data
   */
  async fillFormFields(): Promise<{
    filled: FormField[];
    unknown: NewQuestionPrompt[];
  }> {
    if (!this.fieldMapper || !this.userData) {
      throw new Error("User data not set. Call setUserData() first.");
    }

    if (!this.page) {
      throw new Error("Session not active");
    }

    const filled: FormField[] = [];
    const unknown: NewQuestionPrompt[] = [];

    for (const field of this.formFields) {
      const mapped = this.fieldMapper.mapField(field.label, field.type);

      if (mapped.source === 'unknown' && !mapped.value) {
        // Field needs user input
        unknown.push({
          question: field.label,
          field_type: field.type,
          suggested_answer: ''
        });
        continue;
      }

      // Fill the field using Stagehand
      if (mapped.value && mapped.value !== '[RESUME_FILE]') {
        try {
          await this.fillSingleField(field, mapped);
          filled.push({
            ...field,
            value: String(mapped.value)
          });
        } catch (error) {
          console.error(`Failed to fill field "${field.label}":`, error);
          unknown.push({
            question: field.label,
            field_type: field.type,
            suggested_answer: ''
          });
        }
      }
    }

    this.unknownQuestions = unknown;
    return { filled, unknown };
  }

  /**
   * Fill a single field with mapped value
   */
  private async fillSingleField(field: FormField, mapped: MappedField): Promise<void> {
    if (!this.page) return;

    const value = mapped.value;

    if (field.type === 'checkbox' || field.type === 'radio') {
      // For boolean fields
      if (value === true || value === 'true' || value === 'yes') {
        await this.page.act({
          action: `check the checkbox for "${field.label}"`,
          iframes: true
        });
      }
    } else if (field.type === 'select' || field.type === 'dropdown') {
      // For select fields
      await this.page.act({
        action: `select "${value}" from the dropdown for "${field.label}"`,
        iframes: true
      });
    } else {
      // For text/textarea fields
      await this.page.act({
        action: `type "${value}" in the field for "${field.label}"`,
        iframes: true
      });
    }

    await this.wait(500); // Brief pause between fields
  }

  /**
   * Fill unknown fields with user-provided answers
   */
  async fillUnknownFields(answers: ApplicationDetail[]): Promise<void> {
    if (!this.page) {
      throw new Error("Session not active");
    }

    for (const answer of answers) {
      const field = this.formFields.find(f => f.label === answer.question);

      if (field) {
        const mapped: MappedField = {
          value: answer.answer,
          source: 'saved_answer',
          confidence: 'high'
        };

        await this.fillSingleField(field, mapped);
      }
    }
  }

  /**
   * Extract form preview for user confirmation
   */
  async extractFormPreview(): Promise<ApplicationPreview> {
    if (!this.page) {
      throw new Error("Session not active");
    }

    // Extract all filled form fields
    const formDataSchema = z.object({
      fields: z.array(z.object({
        label: z.string().describe("The field label or name"),
        value: z.string().describe("The current value in the field"),
        fieldType: z.string().describe("The type of field (text, select, checkbox, etc.)")
      }))
    });

    const extracted = await this.page.extract({
      instruction: "Extract all form fields with their labels and current values",
      schema: formDataSchema,
      iframes: true
    });

    // Take screenshot
    const screenshotBuffer = await this.takeScreenshot();
    const screenshot = screenshotBuffer.toString('base64');

    // Map to preview format
    const fields: PreviewField[] = extracted.fields.map(field => ({
      label: field.label,
      value: field.value,
      field_type: field.fieldType,
      confidence: this.determineConfidence(field.label, field.value)
    }));

    return {
      fields,
      screenshot,
      form_action_url: this.page.url()
    };
  }

  /**
   * Determine confidence level based on field mapping
   */
  private determineConfidence(label: string, value: string): 'high' | 'medium' | 'low' {
    if (!value) return 'low';

    if (!this.fieldMapper) return 'medium';

    const mapped = this.fieldMapper.mapField(label);
    return mapped.confidence;
  }

  /**
   * Submit the form
   */
  async submitForm(): Promise<{ success: boolean; message: string }> {
    if (!this.page) {
      throw new Error("Session not active");
    }

    try {
      // Find submit button
      const submitActions = await this.page.observe({
        instruction: "Find the submit, apply, or send application button",
        returnAction: true
      });

      if (submitActions.length === 0) {
        throw new Error("Submit button not found");
      }

      // Click submit button
      await this.page.act(submitActions[0]);

      // Wait for submission
      await this.wait(3000);

      // Extract confirmation message
      const resultSchema = z.object({
        status: z.string().describe("Success or error status"),
        message: z.string().describe("Confirmation or error message")
      });

      const result = await this.page.extract({
        instruction: "Extract the application submission status message or confirmation",
        schema: resultSchema
      });

      const success = result.status.toLowerCase().includes('success') ||
                     result.message.toLowerCase().includes('success') ||
                     result.message.toLowerCase().includes('submitted');

      return {
        success,
        message: result.message
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit application'
      };
    }
  }

  /**
   * Get unknown questions that need user input
   */
  getUnknownQuestions(): NewQuestionPrompt[] {
    return this.unknownQuestions;
  }
}

