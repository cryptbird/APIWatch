/**
 * Notification preferences per user: preferredChannels, quietHours, digestFrequency, minThreatLevel.
 */

import { eq } from 'drizzle-orm';
import { createDbPool } from '../db/index.js';
import { createDrizzle } from '../db/index.js';
import { subscribers } from '../db/schema.js';
import type { Env } from '../env.js';

export interface UserPreferences {
  preferredChannels: string[];
  quietHoursStart?: string;
  quietHoursEnd?: string;
  digestFrequency?: 'immediate' | 'daily' | 'weekly';
  minThreatLevel?: 'LOW' | 'NEUTRAL' | 'CRITICAL';
}

export class PreferencesService {
  private db: ReturnType<typeof createDrizzle> | null = null;

  constructor(private _env: Env) {}

  private getDb() {
    if (this.db === null) this.db = createDrizzle(createDbPool(this._env.DATABASE_URL));
    return this.db;
  }

  async get(userId: string, teamId: string): Promise<UserPreferences> {
    const rows = await this.getDb()
      .select()
      .from(subscribers)
      .where(eq(subscribers.userId, userId))
      .limit(1);
    const r = rows[0];
    return {
      preferredChannels: (r?.preferredChannels as string[]) ?? ['email'],
      quietHoursStart: r?.quietHoursStart ?? undefined,
      quietHoursEnd: r?.quietHoursEnd ?? undefined,
      minThreatLevel: 'LOW',
    };
  }

  async set(userId: string, teamId: string, prefs: Partial<UserPreferences>): Promise<void> {
    const existing = await this.getDb().select().from(subscribers).where(eq(subscribers.userId, userId)).limit(1);
    if (existing.length > 0) {
      await this.getDb()
        .update(subscribers)
        .set({
          preferredChannels: prefs.preferredChannels ?? existing[0]!.preferredChannels,
          quietHoursStart: prefs.quietHoursStart ?? existing[0]!.quietHoursStart,
          quietHoursEnd: prefs.quietHoursEnd ?? existing[0]!.quietHoursEnd,
          updatedAt: new Date(),
        })
        .where(eq(subscribers.id, existing[0]!.id));
    }
  }
}
