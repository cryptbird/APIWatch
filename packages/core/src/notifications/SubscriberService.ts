/**
 * Subscriber management: subscribe/unsubscribe to API changes. Auto-subscribe on dependency edge.
 */

import { eq, and } from 'drizzle-orm';
import { createDbPool } from '../db/index.js';
import { createDrizzle } from '../db/index.js';
import { subscribers } from '../db/schema.js';
import type { Env } from '../env.js';

export type SubscriptionType = 'OWNER' | 'DEPENDENT' | 'MANUAL';

export class SubscriberService {
  private db: ReturnType<typeof createDrizzle> | null = null;

  constructor(private _env: Env) {}

  private getDb() {
    if (this.db === null) this.db = createDrizzle(createDbPool(this._env.DATABASE_URL));
    return this.db;
  }

  async subscribe(teamId: string, input: { userId: string; channels: string[] }): Promise<void> {
    const existing = await this.getDb()
      .select()
      .from(subscribers)
      .where(and(eq(subscribers.teamId, teamId), eq(subscribers.userId, input.userId)))
      .limit(1);
    if (existing.length > 0) {
      await this.getDb()
        .update(subscribers)
        .set({ preferredChannels: input.channels, updatedAt: new Date() })
        .where(eq(subscribers.id, existing[0]!.id));
    } else {
      await this.getDb().insert(subscribers).values({
        teamId,
        userId: input.userId,
        preferredChannels: input.channels,
      });
    }
  }

  async listByUser(userId: string): Promise<Array<{ teamId: string; preferredChannels: string[] }>> {
    const rows = await this.getDb()
      .select({ teamId: subscribers.teamId, preferredChannels: subscribers.preferredChannels })
      .from(subscribers)
      .where(eq(subscribers.userId, userId));
    return rows.map((r) => ({ teamId: r.teamId, preferredChannels: (r.preferredChannels as string[]) ?? [] }));
  }

  async unsubscribe(teamId: string, userId: string): Promise<boolean> {
    const r = await this.getDb()
      .delete(subscribers)
      .where(and(eq(subscribers.teamId, teamId), eq(subscribers.userId, userId)))
      .returning({ id: subscribers.id });
    return r.length > 0;
  }
}
