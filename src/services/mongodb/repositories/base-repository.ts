import { Collection, ObjectId, WithId } from 'mongodb';

export abstract class MongoBaseRepository<TDocument extends { _id?: ObjectId }, TEntity extends { id: string; timestamp: number }> {
  protected collection: Collection<TDocument>;

  constructor(collection: Collection<TDocument>) {
    this.collection = collection;
  }

  protected abstract toDocument(entity: TEntity): TDocument;
  protected abstract toEntity(doc: WithId<TDocument>): TEntity;

  async findAll(): Promise<TEntity[]> {
    const docs = await this.collection.find({}).sort({ timestamp: -1 }).toArray();
    return docs.map(doc => this.toEntity(doc));
  }

  async findById(id: string): Promise<TEntity | null> {
    const doc = await this.collection.findOne({ id } as any);
    return doc ? this.toEntity(doc) : null;
  }

  async insertOne(entity: TEntity): Promise<string> {
    const doc = this.toDocument(entity);
    await this.collection.insertOne(doc as any);
    return entity.id;
  }

  async updateOne(id: string, updates: Partial<TEntity>): Promise<boolean> {
    const result = await this.collection.updateOne(
      { id } as any,
      { $set: { ...updates, timestamp: Date.now() } } as any
    );
    return result.modifiedCount > 0;
  }

  async deleteOne(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ id } as any);
    return result.deletedCount > 0;
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ id } as any, { limit: 1 });
    return count > 0;
  }

  async count(): Promise<number> {
    return await this.collection.countDocuments({});
  }
}
