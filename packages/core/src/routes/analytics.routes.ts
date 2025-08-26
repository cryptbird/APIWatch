/**
 * GET /api/analytics/notifications - delivery rate, open rate, acknowledge rate.
 */

import type { FastifyInstance } from 'fastify';
import { getMetrics } from '../analytics/NotificationAnalytics.js';

export async function analyticsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/analytics/notifications', async (_req, reply) => {
    return reply.send(getMetrics());
  });
}
