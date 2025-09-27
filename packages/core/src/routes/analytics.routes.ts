/**
 * Analytics REST: notifications, api usage, health-history, stability, org summary, top-apis, change-velocity.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getEnv } from '../env.js';
import { getMetrics } from '../analytics/NotificationAnalytics.js';
import { apiHourlyStats } from '../db/schema.js';
import { createDrizzle } from '../db/index.js';
import { createDbPool } from '../db/index.js';
import { eq, gte, lte, and, desc, sql } from 'drizzle-orm';
import { apis, dependencyEdges, changeEvents } from '../db/schema.js';
import { StabilityAnalyzer } from '../analytics/StabilityAnalyzer.js';
import { HealthScoreCalculator } from '../analytics/HealthScoreCalculator.js';
import { GraphService } from '../graph/GraphService.js';
import { ChangeService } from '../diff/ChangeService.js';

const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export async function analyticsRoutes(app: FastifyInstance): Promise<void> {
  const env = getEnv();
  const db = createDrizzle(createDbPool(env.DATABASE_URL));

  app.get('/api/analytics/notifications', async (_req, reply) => {
    return reply.send(getMetrics());
  });

  app.get<{ Params: { id: string }; Querystring: unknown }>(
    '/api/analytics/api/:id/usage',
    async (req, reply) => {
      const parsed = dateRangeSchema.safeParse(req.query);
      const from = parsed.success && parsed.data.from ? new Date(parsed.data.from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const to = parsed.success && parsed.data.to ? new Date(parsed.data.to) : new Date();
      const rows = await db
        .select()
        .from(apiHourlyStats)
        .where(and(
          eq(apiHourlyStats.apiId, req.params.id),
          gte(apiHourlyStats.hour, from),
          lte(apiHourlyStats.hour, to)
        ))
        .orderBy(desc(apiHourlyStats.hour))
        .limit(500);
      return reply.send({ usage: rows });
    }
  );

  app.get<{ Params: { id: string } }>(
    '/api/analytics/api/:id/health-history',
    async (req, reply) => {
      const calculator = new HealthScoreCalculator(env);
      const result = await calculator.computeForApi(req.params.id);
      return reply.send(result);
    }
  );

  app.get<{ Params: { id: string }; Querystring: { days?: string } }>(
    '/api/analytics/api/:id/stability',
    async (req, reply) => {
      const days = Math.min(365, Math.max(1, parseInt(req.query?.days ?? '90', 10) || 90));
      const analyzer = new StabilityAnalyzer(env);
      const result = await analyzer.getStability(req.params.id, days);
      return reply.send(result);
    }
  );

  app.get<{ Querystring: unknown }>(
    '/api/analytics/org/summary',
    async (_req, reply) => {
      const [apiCount] = await db.select({ count: sql<number>`count(*)::int` }).from(apis);
      const [edgeCount] = await db.select({ count: sql<number>`count(*)::int` }).from(dependencyEdges);
      const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const [changeCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(changeEvents)
        .where(gte(changeEvents.createdAt, since24h));
      return reply.send({
        totalApis: apiCount?.count ?? 0,
        totalEdges: edgeCount?.count ?? 0,
        changesLast24h: changeCount?.count ?? 0,
      });
    }
  );

  app.get<{ Querystring: { limit?: string } }>(
    '/api/analytics/org/top-apis',
    async (req, reply) => {
      const limit = Math.min(50, Math.max(1, parseInt(req.query?.limit ?? '20', 10) || 20));
      const graphService = GraphService.getInstance(env);
      const serialized = await graphService.serialize();
      const top = serialized.nodes
        .sort((a, b) => b.centralityScore - a.centralityScore)
        .slice(0, limit)
        .map((n) => ({ id: n.id, label: n.label, centralityScore: n.centralityScore, threatLevel: n.threatLevel }));
      return reply.send({ apis: top });
    }
  );

  app.get<{ Querystring: { days?: string } }>(
    '/api/analytics/org/change-velocity',
    async (req, reply) => {
      const days = Math.min(90, Math.max(1, parseInt(req.query?.days ?? '7', 10) || 7));
      const changeService = new ChangeService(env);
      const recent = await changeService.listRecent({ limit: 500 });
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const inPeriod = recent.events.filter((e) => e.createdAt >= since);
      const perDay = days > 0 ? inPeriod.length / days : 0;
      return reply.send({ changesInPeriod: inPeriod.length, days, changesPerDay: Math.round(perDay * 10) / 10 });
    }
  );
}
