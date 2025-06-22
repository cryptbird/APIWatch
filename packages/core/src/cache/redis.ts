/**
 * Redis connection and typed get/set/del/expire helpers.
 */

import Redis from 'ioredis';

let client: Redis | null = null;

export function getRedisClient(redisUrl: string): Redis {
  if (client !== null) {
    return client;
  }
  client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      return Math.min(times * 100, 3000);
    },
  });
  return client;
}

export async function redisGet(key: string): Promise<string | null> {
  if (client === null) {
    throw new Error('Redis not initialized');
  }
  return client.get(key);
}

export async function redisSet(
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<void> {
  if (client === null) {
    throw new Error('Redis not initialized');
  }
  if (ttlSeconds !== undefined) {
    await client.setex(key, ttlSeconds, value);
  } else {
    await client.set(key, value);
  }
}

export async function redisDel(key: string): Promise<void> {
  if (client === null) {
    throw new Error('Redis not initialized');
  }
  await client.del(key);
}

export async function redisExpire(key: string, ttlSeconds: number): Promise<void> {
  if (client === null) {
    throw new Error('Redis not initialized');
  }
  await client.expire(key, ttlSeconds);
}

export async function redisHealth(): Promise<boolean> {
  if (client === null) {
    return false;
  }
  try {
    const pong = await client.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}

export async function closeRedis(): Promise<void> {
  if (client !== null) {
    await client.quit();
    client = null;
  }
}
