import { Collection } from 'mongodb';
import { MongoBaseRepository } from './base-repository';
import { ApplicationDocument } from '../types';
import { JobApplication } from '@/types';

export interface SavedApplication extends JobApplication {
  id: string;
  userId: string;  // Owner of this application
  timestamp: number;
}

/**
 * MongoDB Application Repository
 * Uses native MongoDB operations with proper job_id filtering
 */
export class MongoApplicationRepository extends MongoBaseRepository<ApplicationDocument, SavedApplication> {
  private userId: string;

  constructor(collection: Collection<ApplicationDocument>, userId: string) {
    super(collection);
    this.userId = userId;
  }

  protected toDocument(entity: SavedApplication): ApplicationDocument {
    const { userId, timestamp, ...data } = entity;
    return {
      ...data,
      userId: this.userId,
      timestamp
    };
  }

  protected toEntity(doc: ApplicationDocument): SavedApplication {
    return {
      id: doc.id,
      userId: doc.userId,
      job_id: doc.job_id,
      status: doc.status,
      filled_data: doc.filled_data,
      preview_data: doc.preview_data,
      submitted_at: doc.submitted_at,
      error: doc.error,
      timestamp: doc.timestamp
    };
  }

  /**
   * Generate unique ID for new application
   */
  private generateId(application: Omit<SavedApplication, 'id' | 'timestamp'>): string {
    return `app-${application.job_id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Save new application
   */
  async save(application: Omit<SavedApplication, 'id' | 'timestamp'>): Promise<string> {
    const id = this.generateId(application);
    const timestamp = Date.now();

    const applicationData: ApplicationDocument = {
      id,
      userId: this.userId,
      job_id: application.job_id,
      status: application.status,
      filled_data: application.filled_data,
      preview_data: application.preview_data,
      submitted_at: application.submitted_at,
      error: application.error,
      timestamp
    };

    await this.collection.insertOne(applicationData);
    return id;
  }

  /**
   * Update existing application
   */
  async update(id: string, updates: Partial<Omit<SavedApplication, 'id'>>): Promise<boolean> {
    const updateData: Partial<ApplicationDocument> = {
      ...updates,
      timestamp: Date.now()
    };

    const result = await this.collection.updateOne(
      { id, userId: this.userId },
      { $set: updateData }
    );

    return result.modifiedCount > 0;
  }

  /**
   * Get applications for a specific job
   */
  async getByJobId(jobId: string): Promise<SavedApplication[]> {
    const docs = await this.collection
      .find({ userId: this.userId, job_id: jobId })
      .sort({ timestamp: -1 })
      .toArray();
    
    return docs.map(doc => this.toEntity(doc));
  }

  /**
   * Get latest application for a job
   */
  async getLatestForJob(jobId: string): Promise<SavedApplication | null> {
    const doc = await this.collection
      .findOne(
        { userId: this.userId, job_id: jobId },
        { sort: { timestamp: -1 } }
      );
    
    return doc ? this.toEntity(doc) : null;
  }

  /**
   * Check if a job has been applied to
   */
  async hasApplied(jobId: string): Promise<boolean> {
    const count = await this.collection.countDocuments({
      userId: this.userId,
      job_id: jobId,
      status: 'submitted'
    }, { limit: 1 });
    
    return count > 0;
  }

  /**
   * Get application statistics
   */
  async getStatistics(): Promise<{
    total: number;
    submitted: number;
    failed: number;
    pending: number;
  }> {
    const pipeline = [
      { $match: { userId: this.userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          submitted: {
            $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          pending: {
            $sum: {
              $cond: [
                { $in: ['$status', ['pending', 'filling', 'preview', 'submitting']] },
                1,
                0
              ]
            }
          }
        }
      }
    ];

    const result = await this.collection.aggregate(pipeline).toArray();
    
    if (result.length === 0) {
      return { total: 0, submitted: 0, failed: 0, pending: 0 };
    }

    return result[0] as { total: number; submitted: number; failed: number; pending: number };
  }

  /**
   * Delete all applications for a job
   */
  async deleteByJobId(jobId: string): Promise<number> {
    const result = await this.collection.deleteMany({
      userId: this.userId,
      job_id: jobId
    });

    return result.deletedCount || 0;
  }

  /**
   * Get all applications for user
   */
  async getAll(): Promise<SavedApplication[]> {
    const docs = await this.collection
      .find({ userId: this.userId })
      .sort({ timestamp: -1 })
      .toArray();
    
    return docs.map(doc => this.toEntity(doc));
  }
}
