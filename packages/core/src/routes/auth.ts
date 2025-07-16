/**
 * POST /api/auth/register-repo (creates repo + API key), POST /api/auth/rotate-key.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { hashApiKey } from '../auth/apiKey.js';

const registerBody = z.object({
  name: z.string().min(1),
  teamId: z.string().optional().default(''),
  orgId: z.string().optional().default(''),
  framework: z.string().optional().default('auto'),
  contactEmail: z.string().email().optional(),
});

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/auth/register-repo', async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = registerBody.safeParse((req as FastifyRequest & { body?: unknown }).body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.message });
    }
    const { name, teamId, orgId, framework } = parsed.data;
    const apiKey = `aw_${Date.now()}_${Math.random().toString(36).slice(2, 14)}`;
    const apiKeyHash = hashApiKey(apiKey);
    return reply.send({
      repoId: `repo-${Date.now()}`,
      apiKey,
      apiKeyHash,
      name,
      teamId,
      orgId,
      framework,
    });
  });

  app.post('/api/auth/rotate-key', async (_req: FastifyRequest, reply: FastifyReply) => {
    const newKey = `aw_${Date.now()}_${Math.random().toString(36).slice(2, 14)}`;
    return reply.send({ apiKey: newKey, apiKeyHash: hashApiKey(newKey) });
  });
}
