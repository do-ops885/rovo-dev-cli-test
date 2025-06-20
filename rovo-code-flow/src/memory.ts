/**
 * Memory system for storing and retrieving knowledge
 */

export class Memory {
  private storage: Map<string, any> = new Map();
  
  /**
   * Store a value in memory
   */
  public store(key: string, value: any): void {
    this.storage.set(key, {
      value,
      timestamp: new Date(),
    });
  }
  
  /**
   * Retrieve a value from memory
   */
  public retrieve(key: string): any {
    const entry = this.storage.get(key);
    return entry ? entry.value : null;
  }
  
  /**
   * Check if a key exists in memory
   */
  public has(key: string): boolean {
    return this.storage.has(key);
  }
  
  /**
   * Delete a value from memory
   */
  public delete(key: string): boolean {
    return this.storage.delete(key);
  }
  
  /**
   * List all keys in memory
   */
  public listKeys(): string[] {
    return Array.from(this.storage.keys());
  }
  
  /**
   * Get all memory entries
   */
  public getAll(): Map<string, any> {
    return this.storage;
  }
  
  /**
   * Clear all memory
   */
  public clear(): void {
    this.storage.clear();
  }
  
  /**
   * Search memory for a pattern
   */
  public search(pattern: string): Map<string, any> {
    const results = new Map();
    const regex = new RegExp(pattern, 'i');
    
    for (const [key, entry] of this.storage.entries()) {
      if (regex.test(key) || regex.test(JSON.stringify(entry.value))) {
        results.set(key, entry);
      }
    }
    
    return results;
  }
}