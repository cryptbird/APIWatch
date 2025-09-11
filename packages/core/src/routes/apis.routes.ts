/**
 * GET /api/apis - list APIs (for dashboard). GET /api/apis/:id - single API detail.
 */

import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { getEnv } from '../env.js';
import { createDbPool, createDrizzle } from '../db/index.js';
import { apis } from '../db/schema.js';

export async function apisRoutes(app: FastifyInstance): Promise<void> {
  const env = getEnv();
  const db = createDrizzle(createDbPool(env.DATABASE_URL));

  app.get('/api/apis', async (_req, reply) => {
    const list = await db.select().from(apis).limit(500);
    return reply.send({ apis: list });
  });

  app.get<{ Params: { id: string } }>('/api/apis/:id', async (req, reply) => {
    const [row] = await db.select().from(apis).where(eq(apis.id, req.params.id)).limit(1);
    if (!row) return reply.status(404).send({ error: 'Not found' });
    return reply.send(row);
  });
}
