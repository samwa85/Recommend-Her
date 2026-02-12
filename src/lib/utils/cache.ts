// ============================================================================
// CACHE UTILITIES - Simple in-memory cache with TTL
// ============================================================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

class Cache {
  private store = new Map<string, CacheEntry<unknown>>();
  private maxSize: number;
  private defaultTtl: number;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTtl = options.ttl || 5 * 60 * 1000; // 5 minutes default
  }

  /**
   * Get cached value
   */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) return undefined;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(key);
      return undefined;
    }
    
    return entry.data;
  }

  /**
   * Set cached value
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Evict oldest entries if at capacity
    if (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) {
        this.store.delete(oldestKey);
      }
    }
    
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTtl,
    });
  }

  /**
   * Delete cached value
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all cached values
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.store.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need hit/miss tracking
    };
  }
}

// Global cache instance
export const globalCache = new Cache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
});

/**
 * Memoize function with cache
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: CacheOptions = {}
): T {
  const cache = new Cache(options);
  
  return ((...args: unknown[]) => {
    const key = JSON.stringify(args);
    const cached = cache.get<ReturnType<T>>(key);
    
    if (cached !== undefined) {
      return cached;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

export default globalCache;
