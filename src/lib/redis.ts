import { Redis } from "@upstash/redis";
import { createHash } from "crypto";

// ============================================================================
// Upstash Redis Client Initialization (Fail-Safe)
// ============================================================================

let redisInstance: Redis | null = null;
let redisInitialized = false;

export function getRedisClient(): Redis | null {
  if (redisInitialized) {
    return redisInstance;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (url && token) {
    try {
      redisInstance = new Redis({
        url,
        token,
      });
      if (process.env.NODE_ENV !== "production") {
        console.log("⚡ [Redis] Upstash Redis client initialized successfully.");
      }
    } catch (err) {
      console.warn("⚠️ [Redis] Failed to initialize Upstash client, running in fail-open mode:", err);
      redisInstance = null;
    }
  } else {
    if (process.env.NODE_ENV !== "production") {
      console.log("ℹ️ [Redis] Upstash credentials not detected (UPSTASH_REDIS_REST_URL / TOKEN). Running live fallback mode.");
    }
  }

  redisInitialized = true;
  return redisInstance;
}

export function isRedisAvailable(): boolean {
  return getRedisClient() !== null;
}

// ============================================================================
// Singleflight In-Flight Promise Map (Thundering Herd Protection)
// ============================================================================
const inFlightRequests = new Map<string, Promise<any>>();

// ============================================================================
// Deterministic Query Hash Generator
// ============================================================================
export function createDeterministicHash(
  params: Record<string, any> | URLSearchParams | undefined | null
): string {
  if (!params) return "default";

  const entries: [string, string][] = [];

  if (params instanceof URLSearchParams) {
    params.forEach((value, key) => {
      if (value !== undefined && value !== null && value !== "") {
        entries.push([key, value]);
      }
    });
  } else if (typeof params === "object") {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          entries.push([key, [...value].map(String).sort().join(",")]);
        } else {
          entries.push([key, String(value)]);
        }
      }
    }
  }

  if (entries.length === 0) return "default";

  // Sort alphabetically by key, then value
  entries.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
  const normalized = entries.map(([k, v]) => `${k}=${v}`).join("&");
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}

// ============================================================================
// Tag-Key Registration (For Tag-Based Invalidation)
// ============================================================================
async function registerKeyWithTags(redis: Redis, key: string, tags?: string[]) {
  if (!tags || tags.length === 0) return;
  try {
    const pipeline = redis.pipeline();
    for (const tag of tags) {
      pipeline.sadd(`aether:tag:${tag}`, key);
      // Give tag index sets a reasonable TTL so they don't accumulate indefinitely
      pipeline.expire(`aether:tag:${tag}`, 60 * 60 * 48); // 48 hours
    }
    await pipeline.exec();
  } catch (err) {
    // Non-blocking error
    console.warn(`⚠️ [Redis] Error registering tag index for key ${key}:`, err);
  }
}

// ============================================================================
// Core cachedFetch Helper (Cache-Aside Pattern)
// ============================================================================
export interface CacheOptions {
  ttlSeconds: number;
  tags?: string[];
  swr?: boolean;
}

/**
 * Fetch data with Redis caching and singleflight request deduplication.
 * If Redis is unavailable or fails, gracefully falls back to the direct fetcher (fail-open).
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions
): Promise<T> {
  const redis = getRedisClient();

  // If Redis is not available, bypass caching
  if (!redis) {
    return fetcher();
  }

  // 1. Try to read from Redis
  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
  } catch (err) {
    console.warn(`⚠️ [Redis] Error reading key "${key}", falling open:`, err);
  }

  // 2. Cache miss -> Singleflight deduplication to protect backend from stampede
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key) as Promise<T>;
  }

  const promise = (async () => {
    try {
      const freshData = await fetcher();

      // Only cache valid data
      if (freshData !== null && freshData !== undefined) {
        try {
          await redis.set(key, freshData, { ex: options.ttlSeconds });
          if (options.tags && options.tags.length > 0) {
            registerKeyWithTags(redis, key, options.tags).catch(() => {});
          }
        } catch (setErr) {
          console.warn(`⚠️ [Redis] Error writing key "${key}":`, setErr);
        }
      }

      return freshData;
    } finally {
      // Clear in-flight record after short delay
      setTimeout(() => {
        inFlightRequests.delete(key);
      }, 100);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
}

// ============================================================================
// Cache Invalidation Utilities
// ============================================================================

/**
 * Invalidate all keys matching a specific tag (e.g., 'products', 'categories', 'theme')
 */
export async function purgeCacheByTags(tags: string[]): Promise<number> {
  const redis = getRedisClient();
  if (!redis || tags.length === 0) return 0;

  let totalDeleted = 0;
  try {
    for (const tag of tags) {
      if (tag === "all" || tag === "*") {
        // Purge all aether:* keys
        return purgeCacheByPattern("aether:*");
      }

      const tagKey = `aether:tag:${tag}`;
      const keys = await redis.smembers<string[]>(tagKey);

      if (keys && keys.length > 0) {
        const pipeline = redis.pipeline();
        for (const k of keys) {
          pipeline.del(k);
        }
        pipeline.del(tagKey);
        await pipeline.exec();
        totalDeleted += keys.length;
      }
    }
  } catch (err) {
    console.warn("⚠️ [Redis] Error in purgeCacheByTags:", err);
  }

  return totalDeleted;
}

/**
 * Invalidate all keys matching a glob pattern (e.g., 'aether:product:*')
 */
export async function purgeCacheByPattern(pattern: string): Promise<number> {
  const redis = getRedisClient();
  if (!redis) return 0;

  let deletedCount = 0;
  try {
    const keys = await redis.keys(pattern);
    if (keys && keys.length > 0) {
      // Delete in batches of 50 to avoid large payload errors
      for (let i = 0; i < keys.length; i += 50) {
        const batch = keys.slice(i, i + 50);
        await redis.del(...batch);
        deletedCount += batch.length;
      }
    }
  } catch (err) {
    console.warn(`⚠️ [Redis] Error in purgeCacheByPattern("${pattern}"):`, err);
  }

  return deletedCount;
}

/**
 * Invalidate specific key(s)
 */
export async function purgeKeys(...keys: string[]): Promise<number> {
  const redis = getRedisClient();
  if (!redis || keys.length === 0) return 0;

  try {
    return await redis.del(...keys);
  } catch (err) {
    console.warn("⚠️ [Redis] Error in purgeKeys:", err);
    return 0;
  }
}
