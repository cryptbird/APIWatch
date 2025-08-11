/**
 * Store and query change events (audit trail).
 */

import { eq, desc } from 'drizzle-orm';
import { createDbPool } from '../db/index.js';
import { createDrizzle } from '../db/index.js';
import { changeEvents } from '../db/schema.js';
import type { Env } from '../env.js';
import type { SchemaDiff } from '@apiwatch/shared';

export class ChangeService {
  private db: ReturnType<typeof createDrizzle> | null = null;

  constructor(private _env: Env) {}

  private getDb() {
    if (this.db === null) {
      this.db = createDrizzle(createDbPool(this._env.DATABASE_URL));
    }
    return this.db;
  }

  async create(diff: SchemaDiff, threatLevel: string, riskScore: number): Promise<string> {
    const payload = JSON.parse(JSON.stringify(diff));
    const rows = await this.getDb()
      .insert(changeEvents)
      .values({
        apiEndpointId: diff.apiEndpointId,
        fromVersion: diff.fromVersion,
        toVersion: diff.toVersion,
        diffPayload: payload,
        threatLevel,
        riskScore,
      })
      .returning({ id: changeEvents.id });
    return rows[0]?.id ?? '';
  }

  async listByApiId(
    apiId: string,
    options: { limit?: number; cursor?: string } = {}
  ): Promise<{
    events: Array<{
      id: string;
      fromVersion: number;
      toVersion: number;
      threatLevel: string;
      riskScore: number | null;
      createdAt: Date;
      acknowledgedAt: Date | null;
    }>;
    nextCursor: string | null;
  }> {
    const limit = options.limit ?? 20;
    const list = await this.getDb()
      .select({
        id: changeEvents.id,
        fromVersion: changeEvents.fromVersion,
        toVersion: changeEvents.toVersion,
        threatLevel: changeEvents.threatLevel,
        riskScore: changeEvents.riskScore,
        createdAt: changeEvents.createdAt,
        acknowledgedAt: changeEvents.acknowledgedAt,
      })
      .from(changeEvents)
      .where(eq(changeEvents.apiEndpointId, apiId))
      .orderBy(desc(changeEvents.createdAt))
      .limit(limit + 1);
    const start = options.cursor ? list.findIndex((e) => e.id === options.cursor) + 1 : 0;
    const slice = start > 0 ? list.slice(start, start + limit) : list.slice(0, limit);
    const nextCursor = list.length > limit ? list[limit]?.id ?? null : null;
    return {
      events: slice.map((e) => ({
        id: e.id,
        fromVersion: e.fromVersion,
        toVersion: e.toVersion,
        threatLevel: e.threatLevel,
        riskScore: e.riskScore,
        createdAt: e.createdAt,
        acknowledgedAt: e.acknowledgedAt,
      })),
      nextCursor,
    };
  }

  async listRecent(options: { limit?: number; threatLevel?: string }): Promise<{
    events: Array<{
      id: string;
      apiEndpointId: string;
      threatLevel: string;
      riskScore: number | null;
      createdAt: Date;
    }>;
    nextCursor: string | null;
  }> {
    const limit = options.limit ?? 50;
    const db = this.getDb();
    const base = db
      .select({
        id: changeEvents.id,
        apiEndpointId: changeEvents.apiEndpointId,
        threatLevel: changeEvents.threatLevel,
        riskScore: changeEvents.riskScore,
        createdAt: changeEvents.createdAt,
      })
      .from(changeEvents)
      .orderBy(desc(changeEvents.createdAt))
      .limit(limit + 1);
    const list = options.threatLevel
      ? await base.where(eq(changeEvents.threatLevel, options.threatLevel))
      : await base;
    const slice = list.slice(0, limit);
    return {
      events: slice,
      nextCursor: list.length > limit ? list[limit]?.id ?? null : null,
    };
  }
}
