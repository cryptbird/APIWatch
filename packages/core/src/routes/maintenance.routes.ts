/**
 * POST /api/maintenance - add maintenance window (apiId, startAt, endAt, reason). Suppress notifications.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { addMaintenanceWindow } from '../notifications/MaintenanceService.js';

const bodySchema = z.object({
  apiId: z.string().min(1),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  reason: z.string().optional(),
});

export async function maintenanceRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/maintenance', async (req, reply) => {
    const parsed = bodySchema.safeParse((req as { body?: unknown }).body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.message });
    addMaintenanceWindow(
      parsed.data.apiId,
      new Date(parsed.data.startAt),
      new Date(parsed.data.endAt),
      parsed.data.reason ?? 'Planned maintenance'
    );
    return reply.send({ ok: true });
  });
}
