/**
 * GET /api/snapshots/:apiId - list versions; GET /api/snapshots/:apiId/:version - specific snapshot.
 */

import type { FastifyInstance } from 'fastify';
import { getEnv } from '../env.js';
import { SnapshotService } from '../diff/SnapshotService.js';
import { z } from 'zod';

const versionSchema = z.coerce.number().int().min(1);

export async function snapshotsRoutes(app: FastifyInstance): Promise<void> {
  const env = getEnv();
  const snapshotService = new SnapshotService(env);

  app.get<{ Params: { apiId: string } }>('/api/snapshots/:apiId', async (req, reply) => {
    const list = await snapshotService.listByApiId(req.params.apiId);
    return reply.send({ versions: list });
  });

  app.get<{ Params: { apiId: string; version: string } }>('/api/snapshots/:apiId/:version', async (req, reply) => {
    const version = versionSchema.safeParse(req.params.version);
    if (!version.success) return reply.status(400).send({ error: 'Invalid version' });
    const snapshot = await snapshotService.getByVersion(req.params.apiId, version.data);
    if (!snapshot) return reply.status(404).send({ error: 'Snapshot not found' });
    return reply.send(snapshot);
  });
}
