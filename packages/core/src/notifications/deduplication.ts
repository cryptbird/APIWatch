/**
 * Deduplication: same (userId, apiId) within 1hr -> merge into one notification. Redis SET with TTL.
 */

import { getEnv } from '../env.js';
import { getRedisClient } from '../cache/redis.js';

const KEY_PREFIX = 'apiwatch:notif_dedup:';
const TTL_SECONDS = 3600;

export function dedupeKey(userId: string, apiId: string): string {
  return `${KEY_PREFIX}${userId}:${apiId}`;
}

export async function shouldDedupe(userId: string, apiId: string): Promise<boolean> {
  try {
    const redis = getRedisClient(getEnv().REDIS_URL);
    const exists = await redis.get(dedupeKey(userId, apiId));
    return exists !== null;
  } catch {
    return false;
  }
}

export async function markDedupe(userId: string, apiId: string): Promise<void> {
  try {
    const redis = getRedisClient(getEnv().REDIS_URL);
    await redis.setex(dedupeKey(userId, apiId), TTL_SECONDS, '1');
  } catch {
    // ignore
  }
}
