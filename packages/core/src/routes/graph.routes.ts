/**
 * Graph REST API: dependents, dependencies, critical-path, full, team, stats, export.
 * Responses cached in Redis (5 min TTL) via graphCache.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getEnv } from '../env.js';
import { GraphService } from '../graph/GraphService.js';
import { getCachedGraph, setCachedGraph } from '../cache/graphCache.js';
import { exportToDot } from '../graph/exporters/DotExporter.js';
import { exportEdgesCsv, exportNodesCsv } from '../graph/exporters/CsvExporter.js';

const depthSchema = z.coerce.number().int().min(1).max(10).default(3);
const cursorSchema = z.string().optional();
const limitSchema = z.coerce.number().int().min(1).max(500).default(100);
const formatSchema = z.enum(['dot', 'csv']);

export async function graphRoutes(app: FastifyInstance): Promise<void> {
  const env = getEnv();
  const graphService = GraphService.getInstance(env);

  app.get<{ Params: { apiId: string }; Querystring: { depth?: string } }>(
    '/api/graph/:apiId/dependents',
    async (req, reply) => {
      const depth = depthSchema.parse(req.query?.depth ?? 3);
      const params = { apiId: req.params.apiId, depth: String(depth) };
      const cached = await getCachedGraph<{ dependents: unknown }>('/api/graph/:apiId/dependents', params);
      if (cached !== null) return reply.send(cached);
      const list = await graphService.getDependents(req.params.apiId, depth);
      const out = { dependents: list };
      await setCachedGraph('/api/graph/:apiId/dependents', params, out);
      return reply.send(out);
    }
  );

  app.get<{ Params: { apiId: string }; Querystring: { depth?: string } }>(
    '/api/graph/:apiId/dependencies',
    async (req, reply) => {
      const depth = depthSchema.parse(req.query?.depth ?? 3);
      const list = await graphService.getDependencies(req.params.apiId, depth);
      return reply.send({ dependencies: list });
    }
  );

  app.get<{ Params: { apiId: string } }>(
    '/api/graph/:apiId/critical-path',
    async (_req, reply) => {
      const path = await graphService.getCriticalPath();
      return reply.send({ criticalPath: path });
    }
  );

  app.get<{ Querystring: { cursor?: string; limit?: string } }>(
    '/api/graph/full',
    async (req, reply) => {
      const cursor = cursorSchema.parse(req.query?.cursor);
      const limit = limitSchema.parse(req.query?.limit ?? 100);
      const serialized = await graphService.serialize();
      const nodes = serialized.nodes.sort((a, b) => b.centralityScore - a.centralityScore);
      const start = cursor ? nodes.findIndex((n) => n.id === cursor) + 1 : 0;
      const slice = nodes.slice(Math.max(0, start), start + limit);
      const nextCursor = start + limit < nodes.length ? nodes[start + limit - 1]?.id : undefined;
      return reply.send({
        nodes: slice,
        edges: serialized.edges,
        metadata: serialized.metadata,
        nextCursor: nextCursor ?? null,
      });
    }
  );

  app.get<{ Params: { teamId: string } }>(
    '/api/graph/team/:teamId',
    async (req, reply) => {
      await graphService.load();
      const g = graphService.getGraph();
      const nodes = g.getAllNodes().filter((n) => n.teamId === req.params.teamId);
      const nodeIds = new Set(nodes.map((n) => n.id));
      const sub = g.getSubgraph(nodeIds);
      return reply.send({ nodes: sub.nodes, edges: sub.edges });
    }
  );

  app.get('/api/graph/stats', async (req, reply) => {
    const params = { q: 'stats' };
    const cached = await getCachedGraph<{ nodeCount: number; edgeCount: number; cycleCount: number }>('/api/graph/stats', params);
    if (cached !== null) return reply.send(cached);
    const stats = await graphService.getStats();
    await setCachedGraph('/api/graph/stats', params, stats);
    return reply.send(stats);
  });

  app.get<{ Querystring: { format?: string } }>(
    '/api/graph/export',
    async (req, reply) => {
      const format = formatSchema.parse(req.query?.format ?? 'dot');
      const serialized = await graphService.serialize();
      if (format === 'dot') {
        return reply.type('text/vnd.graphviz').send(exportToDot(serialized));
      }
      const nodesCsv = exportNodesCsv(serialized);
      const edgesCsv = exportEdgesCsv(serialized);
      return reply.type('text/csv').send(`nodes:\n${nodesCsv}\n\nedges:\n${edgesCsv}`);
    }
  );
}
