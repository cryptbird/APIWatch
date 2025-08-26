/**
 * In-app notification store: create, list, mark read, bulk mark-as-read.
 */

import { eq, and, desc } from 'drizzle-orm';
import { createDbPool } from '../db/index.js';
import { createDrizzle } from '../db/index.js';
import { inAppNotifications } from '../db/schema.js';
import type { Env } from '../env.js';

export class NotificationStore {
  private db: ReturnType<typeof createDrizzle> | null = null;

  constructor(private _env: Env) {}

  private getDb() {
    if (this.db === null) this.db = createDrizzle(createDbPool(this._env.DATABASE_URL));
    return this.db;
  }

  async create(entry: {
    userId: string;
    changeEventId: string;
    channelType: string;
    subject: string;
    body?: string;
    threatLevel: string;
  }): Promise<string> {
    const rows = await this.getDb()
      .insert(inAppNotifications)
      .values({
        userId: entry.userId,
        changeEventId: entry.changeEventId,
        channelType: entry.channelType,
        subject: entry.subject,
        body: entry.body,
        threatLevel: entry.threatLevel,
      })
      .returning({ id: inAppNotifications.id });
    return rows[0]?.id ?? '';
  }

  async listByUser(
    userId: string,
    options: { read?: boolean; threatLevel?: string; limit?: number } = {}
  ): Promise<Array<{ id: string; subject: string; threatLevel: string; read: boolean; createdAt: Date }>> {
    const conditions = [eq(inAppNotifications.userId, userId)];
    if (options.read !== undefined) conditions.push(eq(inAppNotifications.read, options.read));
    if (options.threatLevel !== undefined) conditions.push(eq(inAppNotifications.threatLevel, options.threatLevel));
    const list = await this.getDb()
      .select({
        id: inAppNotifications.id,
        subject: inAppNotifications.subject,
        threatLevel: inAppNotifications.threatLevel,
        read: inAppNotifications.read,
        createdAt: inAppNotifications.createdAt,
      })
      .from(inAppNotifications)
      .where(and(...conditions))
      .orderBy(desc(inAppNotifications.createdAt))
      .limit(options.limit ?? 50);
    return list;
  }

  async markRead(id: string, userId: string): Promise<boolean> {
    const r = await this.getDb()
      .update(inAppNotifications)
      .set({ read: true, readAt: new Date() })
      .where(and(eq(inAppNotifications.id, id), eq(inAppNotifications.userId, userId)))
      .returning({ id: inAppNotifications.id });
    return r.length > 0;
  }

  async markAcknowledged(id: string, userId: string): Promise<boolean> {
    const r = await this.getDb()
      .update(inAppNotifications)
      .set({ acknowledged: true })
      .where(and(eq(inAppNotifications.id, id), eq(inAppNotifications.userId, userId)))
      .returning({ id: inAppNotifications.id });
    return r.length > 0;
  }

  async bulkMarkRead(userId: string): Promise<number> {
    const r = await this.getDb()
      .update(inAppNotifications)
      .set({ read: true, readAt: new Date() })
      .where(eq(inAppNotifications.userId, userId))
      .returning({ id: inAppNotifications.id });
    return r.length;
  }
}
