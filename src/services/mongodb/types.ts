import { ObjectId } from 'mongodb';
import { TargetJobJson, Resume, ApplicationDetail, JobApplication } from '@/types';

export interface ProfileDocument {
  _id?: ObjectId;
  userId: string; // Indexed
  name: string;
  raw_content: string;
  email?: string;
  phone?: string;
  baseResumeId?: string;
  additional_details?: ApplicationDetail[];
  metadata?: {
    lastUpdated?: number;
    version?: number;
    notes?: string;
  };
  timestamp: number;
}

export interface JobDocument {
  _id?: ObjectId;
  id: string; // Our UUID - Indexed
  name: string; // Indexed
  company: string; // Indexed
  url: string;
  description: string;
  raw_content: string;
  apply_url?: string;
  is_easy_apply?: boolean;
  remote_allowed?: boolean;
  timestamp: number;
}

export interface ResumeDocument extends Omit<Resume, '_id'> {
  _id?: ObjectId;
  userId: string; // Indexed
  jobId?: string; // Indexed
  timestamp: number;
}

export interface ApplicationDocument extends Omit<JobApplication, '_id'> {
  _id?: ObjectId;
  userId: string; // Indexed
  timestamp: number;
}
