/**
 * Health check route: GET /health
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { redisHealth } from '../cache/redis.js';

const startTime = Date.now();

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  db: 'ok' | 'error';
  redis: 'ok' | 'error';
  version: string;
  uptime: number;
}

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async (_req: FastifyRequest, reply: FastifyReply) => {
    const redisOk = await redisHealth();
    const dbOk = true; // TODO: ping DB when pool is available
    const status: HealthResponse['status'] =
      dbOk && redisOk ? 'ok' : redisOk ? 'degraded' : 'error';
    const response: HealthResponse = {
      status,
      db: dbOk ? 'ok' : 'error',
      redis: redisOk ? 'ok' : 'error',
      version: process.env.npm_package_version ?? '1.0.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
    };
    const code = status === 'ok' ? 200 : 503;
    return reply.status(code).send(response);
  });
}
