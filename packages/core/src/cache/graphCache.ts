/**
 * Cache graph endpoint responses in Redis with 5-minute TTL.
 * Cache key = hash of (endpoint + params). Invalidate on edge/node updates.
 */

import { createHash } from 'node:crypto';
import { redisGet, redisSet, redisKeys, redisDel } from './redis.js';

const TTL_SECONDS = 300; // 5 min
const KEY_PREFIX = 'apiwatch:graph:';

function cacheKey(endpoint: string, params: Record<string, string>): string {
  const payload = endpoint + JSON.stringify(params);
  const hash = createHash('sha256').update(payload).digest('hex');
  return KEY_PREFIX + hash;
}

export async function getCachedGraph<T>(endpoint: string, params: Record<string, string>): Promise<T | null> {
  const key = cacheKey(endpoint, params);
  const raw = await redisGet(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCachedGraph(endpoint: string, params: Record<string, string>, value: unknown): Promise<void> {
  const key = cacheKey(endpoint, params);
  await redisSet(key, JSON.stringify(value), TTL_SECONDS);
}

/**
 * Invalidate all graph caches (on new edge, removed edge, node updated).
 * Requires Redis to be already initialized (e.g. by server).
 */
export async function invalidateGraphCache(): Promise<void> {
  try {
    const keys = await redisKeys(KEY_PREFIX + '*');
    for (const key of keys) {
      await redisDel(key);
    }
  } catch {
    // Redis may not be initialized (e.g. in tests)
  }
}
