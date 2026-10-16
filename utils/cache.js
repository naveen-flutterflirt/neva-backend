// Zero-dependency, thread-safe high performance in-memory cache for API responses
class SimpleMemoryCache {
  constructor(defaultTtlMs = 60 * 1000) {
    this.cache = new Map();
    this.defaultTtlMs = defaultTtlMs;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key, data, ttlMs = this.defaultTtlMs) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  delete(key) {
    this.cache.delete(key);
  }

  clearPattern(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  clearAll() {
    this.cache.clear();
  }
}

// Global cache instance
const apiCache = new SimpleMemoryCache(60 * 1000); // 1 minute default cache

module.exports = apiCache;
