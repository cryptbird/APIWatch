/**
 * Priority queue for notifications: CRITICAL=3, NEUTRAL=2, LOW=1. Redis sorted set.
 */

import { getEnv } from '../env.js';
import { getRedisClient } from '../cache/redis.js';

const QUEUE_KEY = 'apiwatch:notifications:queue';
const PRIORITY: Record<string, number> = { CRITICAL: 3, NEUTRAL: 2, LOW: 1 };

export async function enqueue(notificationId: string, threatLevel: string): Promise<void> {
  try {
    const redis = getRedisClient(getEnv().REDIS_URL);
    const score = PRIORITY[threatLevel] ?? 1;
    await redis.zadd(QUEUE_KEY, score, notificationId);
  } catch {
    // Redis may not be initialized
  }
}

export async function dequeue(): Promise<string | null> {
  try {
    const redis = getRedisClient(getEnv().REDIS_URL);
    const result = await redis.zpopmax(QUEUE_KEY);
    return result[0] ?? null;
  } catch {
    return null;
  }
}
