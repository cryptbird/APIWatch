/**
 * POST /api/subscriptions, GET /api/subscriptions/:userId, DELETE - subscribe/unsubscribe to API changes.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getEnv } from '../env.js';
import { SubscriberService } from '../notifications/SubscriberService.js';

const bodySchema = z.object({
  teamId: z.string().min(1),
  userId: z.string().min(1),
  channels: z.array(z.string()).default(['email']),
});

export async function subscriptionsRoutes(app: FastifyInstance): Promise<void> {
  const env = getEnv();
  const subscriberService = new SubscriberService(env);

  app.post('/api/subscriptions', async (req, reply) => {
    const parsed = bodySchema.safeParse((req as { body?: unknown }).body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.message });
    await subscriberService.subscribe(parsed.data.teamId, {
      userId: parsed.data.userId,
      channels: parsed.data.channels,
    });
    return reply.send({ ok: true });
  });

  app.get<{ Params: { userId: string } }>('/api/subscriptions/:userId', async (req, reply) => {
    const list = await subscriberService.listByUser(req.params.userId);
    return reply.send({ subscriptions: list });
  });

  app.delete<{ Querystring: { teamId: string; userId: string } }>('/api/subscriptions', async (req, reply) => {
    const { teamId, userId } = req.query;
    if (!teamId || !userId) return reply.status(400).send({ error: 'teamId and userId required' });
    const ok = await subscriberService.unsubscribe(teamId, userId);
    return reply.send({ ok });
  });
}
