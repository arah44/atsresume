import { Collection, Db } from 'mongodb';
import { getUserDataDatabase } from '@/lib/mongodb';
import { ProfileDocument, JobDocument, ResumeDocument, ApplicationDocument } from './types';

let cachedDb: Db | null = null;

async function getDb(): Promise<Db> {
  if (!cachedDb) {
    cachedDb = await getUserDataDatabase();
    await initializeIndexes(cachedDb);
  }
  return cachedDb;
}

async function initializeIndexes(db: Db): Promise<void> {
  // Profiles
  await db.collection('profiles').createIndex({ userId: 1 }, { unique: true });
  
  // Jobs
  await db.collection('jobs').createIndex({ id: 1 }, { unique: true });
  await db.collection('jobs').createIndex({ name: 1 });
  await db.collection('jobs').createIndex({ company: 1 });
  
  // Resumes
  await db.collection('resumes').createIndex({ id: 1 }, { unique: true });
  await db.collection('resumes').createIndex({ userId: 1 });
  await db.collection('resumes').createIndex({ jobId: 1 });
  
  // Applications
  await db.collection('applications').createIndex({ id: 1 }, { unique: true });
  await db.collection('applications').createIndex({ userId: 1 });
  await db.collection('applications').createIndex({ job_id: 1 });
  
  console.log('✅ MongoDB indexes initialized');
}

export async function getProfilesCollection(): Promise<Collection<ProfileDocument>> {
  const db = await getDb();
  return db.collection<ProfileDocument>('profiles');
}

export async function getJobsCollection(): Promise<Collection<JobDocument>> {
  const db = await getDb();
  return db.collection<JobDocument>('jobs');
}

export async function getResumesCollection(): Promise<Collection<ResumeDocument>> {
  const db = await getDb();
  return db.collection<ResumeDocument>('resumes');
}

export async function getApplicationsCollection(): Promise<Collection<ApplicationDocument>> {
  const db = await getDb();
  return db.collection<ApplicationDocument>('applications');
}
