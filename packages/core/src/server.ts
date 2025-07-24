/**
 * APIWatch core server — Fastify with health check and graceful shutdown.
 */

import Fastify from 'fastify';
import { getEnv } from './env.js';
import { getRedisClient, closeRedis } from './cache/redis.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { registryRoutes } from './registry/registry.routes.js';
import { usageRoutes } from './routes/usage.routes.js';

const env = getEnv();

export async function start(): Promise<void> {
  getRedisClient(env.REDIS_URL);

  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
  });

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(registryRoutes);
  await app.register(usageRoutes);

  app.get('/', async (_req, reply) => {
    return reply.send({ name: 'APIWatch', version: '1.0.0' });
  });

  const shutdown = async (): Promise<void> => {
    try {
      await app.close();
      await closeRedis();
      process.exit(0);
    } catch (err) {
      process.exit(1);
    }
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
  } catch (err) {
    app.log.fatal(err);
    process.exit(1);
  }
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
