/**
 * Integration test: server starts and /health returns correct shape.
 * Mocks Redis so no real Redis is required.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify from 'fastify';
import { healthRoutes } from '../../src/routes/health.js';

vi.mock('../../src/cache/redis.js', () => ({
  getRedisClient: () => ({}),
  redisHealth: () => Promise.resolve(true),
  closeRedis: () => Promise.resolve(),
}));

describe('Server integration', () => {
  let app: Awaited<ReturnType<typeof Fastify>>;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await app.register(healthRoutes);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns 200 with status, db, redis, version, uptime', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as {
      status: string;
      db: string;
      redis: string;
      version: string;
      uptime: number;
    };
    expect(body).toHaveProperty('status');
    expect(['ok', 'degraded', 'error']).toContain(body.status);
    expect(body).toHaveProperty('db');
    expect(['ok', 'error']).toContain(body.db);
    expect(body).toHaveProperty('redis');
    expect(['ok', 'error']).toContain(body.redis);
    expect(body).toHaveProperty('version');
    expect(typeof body.version).toBe('string');
    expect(body).toHaveProperty('uptime');
    expect(typeof body.uptime).toBe('number');
  });
});
