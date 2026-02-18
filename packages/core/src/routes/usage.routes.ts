/**
 * POST /api/usage/record — batch of usage events for dependency tracking.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getEnv } from '../env.js';
import { UsageTracker, recordBatchBodySchema } from '../analytics/UsageTracker.js';

export async function usageRoutes(app: FastifyInstance): Promise<void> {
  const env = getEnv();
  const tracker = new UsageTracker(env);

  app.post('/api/usage/record', async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = recordBatchBodySchema.safeParse((req as FastifyRequest & { body?: unknown }).body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.message, issues: parsed.error.issues });
    }
    try {
      const result = await tracker.recordBatch(parsed.data);
      return reply.send(result);
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: 'Failed to record usage events' });
    }
  });
}
