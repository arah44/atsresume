import { AsyncStorageProvider } from '../storage';

/**
 * Base entity with common fields
 */
export interface BaseEntity {
  id: string;
  timestamp: number;
}

/**
 * Generic Repository with Dependency Injection
 * Accepts any storage provider that implements AsyncStorageProvider
 */
export abstract class BaseRepository<T extends BaseEntity> {
  protected storage: AsyncStorageProvider;
  protected collectionPrefix: string;
  protected listKey: string;

  constructor(
    storage: AsyncStorageProvider,
    collectionPrefix: string,
    listKey: string
  ) {
    this.storage = storage;
    this.collectionPrefix = collectionPrefix;
    this.listKey = listKey;
  }

  /**
   * Generate storage key for an entity
   */
  protected getEntityKey(id: string): string {
    return `${this.collectionPrefix}${id}`;
  }

  /**
   * Generate unique ID for new entity
   */
  protected abstract generateId(entity: Omit<T, 'id' | 'timestamp'>): string;

  /**
   * Get all entities
   */
  async getAll(): Promise<T[]> {
    const list = await this.storage.readAsync<T[]>(this.listKey);
    return list || [];
  }

  /**
   * Get entity by ID
   */
  async getById(id: string): Promise<T | null> {
    const key = this.getEntityKey(id);
    return this.storage.readAsync<T>(key);
  }

  /**
   * Save new entity
   */
  async save(entity: Omit<T, 'id' | 'timestamp'>): Promise<string> {
    const id = this.generateId(entity);
    const timestamp = Date.now();

    const newEntity: T = {
      ...entity,
      id,
      timestamp
    } as T;

    // Save entity
    const key = this.getEntityKey(id);
    await this.storage.writeAsync(key, newEntity);

    // Update list
    await this.addToList(newEntity);

    return id;
  }

  /**
   * Update existing entity
   */
  async update(id: string, updates: Partial<Omit<T, 'id'>>): Promise<boolean> {
    const existing = await this.getById(id);
    if (!existing) return false;

    const updated: T = {
      ...existing,
      ...updates,
      id, // Preserve ID
      timestamp: Date.now()
    };

    // Save updated entity
    const key = this.getEntityKey(id);
    await this.storage.writeAsync(key, updated);

    // Update in list
    await this.updateInList(updated);

    return true;
  }

  /**
   * Delete entity
   */
  async delete(id: string): Promise<boolean> {
    const key = this.getEntityKey(id);
    const deleted = await this.storage.deleteAsync(key);

    if (deleted) {
      await this.removeFromList(id);
    }

    return deleted;
  }

  /**
   * Check if entity exists
   */
  async exists(id: string): Promise<boolean> {
    const key = this.getEntityKey(id);
    return this.storage.existsAsync(key);
  }

  /**
   * Add entity to the list
   */
  protected async addToList(entity: T): Promise<void> {
    const list = await this.getAll();
    
    // Remove existing entry if any (update scenario)
    const filtered = list.filter(item => item.id !== entity.id);
    
    // Add new entry at the top
    filtered.unshift(entity);

    // Save updated list
    await this.storage.writeAsync(this.listKey, filtered);
  }

  /**
   * Update entity in the list
   */
  protected async updateInList(entity: T): Promise<void> {
    const list = await this.getAll();
    const index = list.findIndex(item => item.id === entity.id);

    if (index !== -1) {
      list[index] = entity;
      await this.storage.writeAsync(this.listKey, list);
    }
  }

  /**
   * Remove entity from the list
   */
  protected async removeFromList(id: string): Promise<void> {
    const list = await this.getAll();
    const filtered = list.filter(item => item.id !== id);
    await this.storage.writeAsync(this.listKey, filtered);
  }

  /**
   * Clear all entities
   */
  async clearAll(): Promise<number> {
    const list = await this.getAll();
    
    // Delete all entity data
    await Promise.all(
      list.map(entity => this.storage.deleteAsync(this.getEntityKey(entity.id)))
    );

    // Clear list
    await this.storage.deleteAsync(this.listKey);

    return list.length;
  }

  /**
   * Get count of entities
   */
  async count(): Promise<number> {
    const list = await this.getAll();
    return list.length;
  }
}

