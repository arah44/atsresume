/**
 * Maps user profile and resume data to job application form fields
 * Follows DRY principles by centralizing field mapping logic
 */

import { UserProfile } from '@/services/profileStorage';
import { Resume, ApplicationDetail } from '@/types';

export interface UserData {
  profile: UserProfile;
  resume?: Resume;
}

export interface MappedField {
  value: string | boolean | string[];
  source: 'profile' | 'resume' | 'saved_answer' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
}

export class FieldMapper {
  private userData: UserData;

  constructor(userData: UserData) {
    this.userData = userData;
  }

  /**
   * Map a field based on its label/description
   */
  mapField(fieldLabel: string, fieldType: string = 'text'): MappedField {
    const normalizedLabel = fieldLabel.toLowerCase().trim();

    // Check for name fields
    if (this.isNameField(normalizedLabel)) {
      return this.mapNameField();
    }

    // Check for email fields
    if (this.isEmailField(normalizedLabel)) {
      return this.mapEmailField();
    }

    // Check for phone fields
    if (this.isPhoneField(normalizedLabel)) {
      return this.mapPhoneField();
    }

    // Check for resume/CV upload
    if (this.isResumeField(normalizedLabel)) {
      return this.mapResumeField();
    }

    // Check for cover letter
    if (this.isCoverLetterField(normalizedLabel)) {
      return this.mapCoverLetterField();
    }

    // Check for LinkedIn profile
    if (this.isLinkedInField(normalizedLabel)) {
      return this.mapLinkedInField();
    }

    // Check for website/portfolio
    if (this.isWebsiteField(normalizedLabel)) {
      return this.mapWebsiteField();
    }

    // Check saved answers in additional_details
    const savedAnswer = this.findSavedAnswer(fieldLabel);
    if (savedAnswer) {
      return {
        value: savedAnswer,
        source: 'saved_answer',
        confidence: 'high'
      };
    }

    // Unknown field
    return {
      value: '',
      source: 'unknown',
      confidence: 'low'
    };
  }

  /**
   * Field type detection methods
   */
  private isNameField(label: string): boolean {
    const patterns = ['name', 'full name', 'your name', 'applicant name'];
    return patterns.some(pattern => label.includes(pattern));
  }

  private isEmailField(label: string): boolean {
    const patterns = ['email', 'e-mail', 'email address', 'contact email'];
    return patterns.some(pattern => label.includes(pattern));
  }

  private isPhoneField(label: string): boolean {
    const patterns = ['phone', 'telephone', 'mobile', 'contact number', 'phone number'];
    return patterns.some(pattern => label.includes(pattern));
  }

  private isResumeField(label: string): boolean {
    const patterns = ['resume', 'cv', 'curriculum vitae', 'upload resume', 'attach resume'];
    return patterns.some(pattern => label.includes(pattern));
  }

  private isCoverLetterField(label: string): boolean {
    const patterns = ['cover letter', 'coverletter', 'letter', 'motivation letter'];
    return patterns.some(pattern => label.includes(pattern));
  }

  private isLinkedInField(label: string): boolean {
    const patterns = ['linkedin', 'linkedin profile', 'linkedin url'];
    return patterns.some(pattern => label.includes(pattern));
  }

  private isWebsiteField(label: string): boolean {
    const patterns = ['website', 'portfolio', 'personal website', 'portfolio url'];
    return patterns.some(pattern => label.includes(pattern));
  }

  /**
   * Field mapping methods
   */
  private mapNameField(): MappedField {
    return {
      value: this.userData.profile.name || '',
      source: 'profile',
      confidence: 'high'
    };
  }

  private mapEmailField(): MappedField {
    const email = this.userData.profile.email ||
                  this.extractEmailFromContent(this.userData.profile.raw_content) ||
                  this.userData.resume?.email || '';

    return {
      value: email,
      source: email ? 'profile' : 'unknown',
      confidence: email ? 'high' : 'low'
    };
  }

  private mapPhoneField(): MappedField {
    const phone = this.userData.profile.phone ||
                  this.extractPhoneFromContent(this.userData.profile.raw_content) ||
                  this.userData.resume?.contactInformation || '';

    return {
      value: phone,
      source: phone ? 'profile' : 'unknown',
      confidence: phone ? 'medium' : 'low'
    };
  }

  private mapResumeField(): MappedField {
    // This will be handled separately as file upload
    return {
      value: '[RESUME_FILE]', // Placeholder
      source: 'resume',
      confidence: 'high'
    };
  }

  private mapCoverLetterField(): MappedField {
    // Use resume summary as cover letter basis
    const coverLetter = this.userData.resume?.summary || '';

    return {
      value: coverLetter,
      source: 'resume',
      confidence: coverLetter ? 'medium' : 'low'
    };
  }

  private mapLinkedInField(): MappedField {
    const linkedIn = this.userData.resume?.socialMedia?.find(
      sm => sm.socialMedia.toLowerCase().includes('linkedin')
    );

    return {
      value: linkedIn?.link || '',
      source: 'resume',
      confidence: linkedIn ? 'high' : 'low'
    };
  }

  private mapWebsiteField(): MappedField {
    const website = this.userData.resume?.socialMedia?.find(
      sm => sm.socialMedia.toLowerCase().includes('website') ||
           sm.socialMedia.toLowerCase().includes('portfolio')
    );

    return {
      value: website?.link || '',
      source: 'resume',
      confidence: website ? 'high' : 'low'
    };
  }

  /**
   * Extract email from text content
   */
  private extractEmailFromContent(content: string): string | null {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = content.match(emailRegex);
    return match ? match[0] : null;
  }

  /**
   * Extract phone from text content
   */
  private extractPhoneFromContent(content: string): string | null {
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const match = content.match(phoneRegex);
    return match ? match[0] : null;
  }

  /**
   * Find saved answer from additional_details
   */
  private findSavedAnswer(question: string): string | null {
    if (!this.userData.profile.additional_details) {
      return null;
    }

    const normalizedQuestion = question.toLowerCase().trim();

    for (const detail of this.userData.profile.additional_details) {
      if (detail.question.toLowerCase().trim() === normalizedQuestion) {
        return detail.answer;
      }
    }

    return null;
  }

  /**
   * Get all unknown fields that need user input
   */
  getUnknownFields(fields: Array<{ label: string; type: string }>): Array<{ label: string; type: string }> {
    return fields
      .map(field => ({
        ...field,
        mapped: this.mapField(field.label, field.type)
      }))
      .filter(field => field.mapped.source === 'unknown')
      .map(field => ({ label: field.label, type: field.type }));
  }
}

