import { Collection } from 'mongodb';
import { MongoBaseRepository } from './base-repository';
import { JobDocument } from '../types';
import { TargetJobJson } from '@/types';
import { hash } from '@/utils/hash';

export interface SavedJob extends TargetJobJson {
  timestamp: number;
}

/**
 * MongoDB Job Repository
 * Uses native MongoDB operations with proper search queries
 */
export class MongoJobRepository extends MongoBaseRepository<JobDocument, SavedJob> {
  constructor(collection: Collection<JobDocument>) {
    super(collection);
  }

  protected toDocument(entity: SavedJob): JobDocument {
    const { id, ...data } = entity;
    return {
      ...data,
      id: id,
      timestamp: entity.timestamp
    };
  }

  protected toEntity(doc: JobDocument): SavedJob {
    return {
      id: doc.id,
      name: doc.name,
      company: doc.company,
      url: doc.url,
      description: doc.description,
      raw_content: doc.raw_content,
      apply_url: doc.apply_url,
      is_easy_apply: doc.is_easy_apply,
      remote_allowed: doc.remote_allowed,
      timestamp: doc.timestamp
    };
  }

  /**
   * Generate unique ID for new job
   */
  private generateId(job: Omit<SavedJob, 'id' | 'timestamp'>): string {
    return hash(job.url);
  }

  /**
   * Save new job
   */
  async save(job: Omit<SavedJob, 'id' | 'timestamp'>): Promise<string> {
    const id = this.generateId(job);
    const timestamp = Date.now();

    const jobData: JobDocument = {
      id,
      name: job.name,
      company: job.company,
      url: job.url,
      description: job.description,
      raw_content: job.raw_content,
      apply_url: job.apply_url,
      is_easy_apply: job.is_easy_apply,
      remote_allowed: job.remote_allowed,
      timestamp
    };

    await this.collection.insertOne(jobData);
    return id;
  }

  /**
   * Update existing job
   */
  async update(id: string, updates: Partial<Omit<SavedJob, 'id'>>): Promise<boolean> {
    const updateData: Partial<JobDocument> = {
      ...updates,
      timestamp: Date.now()
    };

    const result = await this.collection.updateOne(
      { id },
      { $set: updateData }
    );

    return result.modifiedCount > 0;
  }

  /**
   * Find jobs by company using MongoDB regex
   */
  async getByCompany(company: string): Promise<SavedJob[]> {
    const docs = await this.collection
      .find({ company: { $regex: company, $options: 'i' } })
      .sort({ timestamp: -1 })
      .toArray();

    return docs.map(doc => this.toEntity(doc));
  }

  /**
   * Search jobs by keyword using MongoDB text search
   */
  async search(keyword: string): Promise<SavedJob[]> {
    const docs = await this.collection
      .find({
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { company: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } }
        ]
      })
      .sort({ timestamp: -1 })
      .toArray();

    return docs.map(doc => this.toEntity(doc));
  }

  /**
   * Find jobs by ID
   */
  async findById(id: string): Promise<SavedJob | null> {
    const doc = await this.collection.findOne({ id });
    return doc ? this.toEntity(doc) : null;
  }

  /**
   * Find jobs by ID
   */
  async findByIds(ids: string[]): Promise<SavedJob[]> {
    const docs = await this.collection.find({ id: { $in: ids } }).toArray();
    return docs.map(doc => this.toEntity(doc));
  }

  /**
   * Get jobs sorted by date (newest first) - same as findAll
   */
  async getAllSorted(): Promise<SavedJob[]> {
    return this.findAll();
  }
}
