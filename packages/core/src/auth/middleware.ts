/**
 * Fastify preHandler: validate API key on all /api/* routes.
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyApiKey } from './apiKey.js';

const HEADER = 'authorization';

export async function requireApiKey(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const raw = request.headers[HEADER];
  const token = typeof raw === 'string' ? raw.replace(/^Bearer\s+/i, '').trim() : '';
  if (!token) {
    return reply.status(401).send({ error: 'Missing API key in Authorization header' });
  }
  const hashedFromDb = (request as FastifyRequest & { apiKeyHash?: string }).apiKeyHash;
  if (hashedFromDb && verifyApiKey(token, hashedFromDb)) {
    return;
  }
  return reply.status(401).send({ error: 'Invalid API key' });
}
