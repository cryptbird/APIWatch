/**
 * GET /api/notifications, POST /api/notifications/:id/acknowledge, PATCH bulk-acknowledge.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getEnv } from '../env.js';
import { NotificationStore } from '../notifications/NotificationStore.js';

const querySchema = z.object({
  userId: z.string().min(1),
  read: z.enum(['true', 'false']).optional(),
  threatLevel: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export async function notificationsRoutes(app: FastifyInstance): Promise<void> {
  const env = getEnv();
  const store = new NotificationStore(env);

  app.get<{ Querystring: unknown }>('/api/notifications', async (req, reply) => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.message });
    const list = await store.listByUser(parsed.data.userId, {
      read: parsed.data.read === 'true' ? true : parsed.data.read === 'false' ? false : undefined,
      threatLevel: parsed.data.threatLevel,
      limit: parsed.data.limit,
    });
    return reply.send({ notifications: list });
  });

  app.post<{ Params: { id: string }; Querystring: { userId: string } }>(
    '/api/notifications/:id/acknowledge',
    async (req, reply) => {
      const userId = (req.query as { userId?: string }).userId;
      if (!userId) return reply.status(400).send({ error: 'userId required' });
      const ok = await store.markAcknowledged(req.params.id, userId);
      return ok ? reply.send({ ok: true }) : reply.status(404).send({ error: 'Not found' });
    }
  );

  app.patch<{ Querystring: { userId: string } }>('/api/notifications/bulk-acknowledge', async (req, reply) => {
    const userId = (req.query as { userId?: string }).userId;
    if (!userId) return reply.status(400).send({ error: 'userId required' });
    const count = await store.bulkMarkRead(userId);
    return reply.send({ marked: count });
  });
}
