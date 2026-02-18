/**
 * GET /api/changes/:apiId - change history; GET /api/changes/recent - org-wide feed.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getEnv } from '../env.js';
import { ChangeService } from '../diff/ChangeService.js';

const limitSchema = z.coerce.number().int().min(1).max(100).default(20);
const threatSchema = z.enum(['LOW', 'NEUTRAL', 'CRITICAL']).optional();

export async function changesRoutes(app: FastifyInstance): Promise<void> {
  const env = getEnv();
  const changeService = new ChangeService(env);

  app.get<{ Params: { apiId: string }; Querystring: { limit?: string; cursor?: string } }>(
    '/api/changes/:apiId',
    async (req, reply) => {
      const limit = limitSchema.parse(req.query?.limit ?? 20);
      const cursor = typeof req.query?.cursor === 'string' ? req.query.cursor : undefined;
      const result = await changeService.listByApiId(req.params.apiId, { limit, cursor });
      return reply.send(result);
    }
  );

  app.get<{ Querystring: { limit?: string; threatLevel?: string } }>(
    '/api/changes/recent',
    async (req, reply) => {
      const limit = limitSchema.parse(req.query?.limit ?? 50);
      const threatLevel = threatSchema.parse(req.query?.threatLevel);
      const result = await changeService.listRecent({ limit, threatLevel });
      return reply.send(result);
    }
  );
}
