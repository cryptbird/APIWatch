/**
 * GET /api/notifications/stream - Server-Sent Events for real-time notifications.
 */

import type { FastifyInstance } from 'fastify';
import { addClient } from '../sse/SseManager.js';

export async function sseRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/notifications/stream', async (req, reply) => {
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    const id = `sse-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    addClient(id, reply);
    await reply.raw.write(`event: connected\ndata: ${JSON.stringify({ id })}\n\n`);
  });
}
