/**
 * POST /api/repos/register — name, teamId, orgId, framework, contact email. Returns repoId + apiKey.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getEnv } from '../env.js';
import { RepoService } from './RepoService.js';

const registerSchema = z.object({
  name: z.string().min(1),
  teamId: z.string().optional().default(''),
  orgId: z.string().optional().default(''),
  framework: z.string().optional().default('auto'),
  contactEmail: z.string().email().optional(),
});

export async function registryRoutes(app: FastifyInstance): Promise<void> {
  const env = getEnv();
  const repoService = new RepoService(env);

  app.post('/api/repos/register', async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = registerSchema.safeParse((req as FastifyRequest & { body?: unknown }).body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.message });
    }
    const result = await repoService.register(parsed.data);
    return reply.send({ ...result, message: 'Save apiKey securely; it is not stored in plaintext.' });
  });
}
