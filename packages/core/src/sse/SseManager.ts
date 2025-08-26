/**
 * Server-Sent Events: stream notification:new, notification:updated, graph:changed.
 */

import type { FastifyReply } from 'fastify';

export interface SseClient {
  id: string;
  send(event: string, data: unknown): void;
}

const clients = new Map<string, FastifyReply>();

export function addClient(id: string, reply: FastifyReply): void {
  clients.set(id, reply);
  reply.raw.on('close', () => clients.delete(id));
}

export function broadcast(event: string, data: unknown): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const reply of clients.values()) {
    try {
      reply.raw.write(payload);
    } catch {
      // ignore
    }
  }
}
