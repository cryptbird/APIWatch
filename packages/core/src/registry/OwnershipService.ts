/**
 * Resolve apiId to team name, squad, contact, Slack channel, repo link, office location.
 */

import type { Env } from '../env.js';
import { createDbPool } from '../db/index.js';
import { createDrizzle } from '../db/index.js';
import { apis, teams } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export interface ApiOwnership {
  apiId: string;
  teamName: string;
  squadId: string;
  teamLeadContact?: string;
  slackChannel?: string;
  repoLink?: string;
  officeLocation?: string;
}

export class OwnershipService {
  private db: ReturnType<typeof createDrizzle> | null = null;

  constructor(private _env: Env) {}

  private getDb() {
    if (this.db === null) {
      const pool = createDbPool(this._env.DATABASE_URL);
      this.db = createDrizzle(pool);
    }
    return this.db;
  }

  async getOwnership(apiId: string): Promise<ApiOwnership | null> {
    const database = this.getDb();
    const [apiRow] = await database.select().from(apis).where(eq(apis.id, apiId)).limit(1);
    if (!apiRow) return null;
    const [teamRow] = await database.select().from(teams).where(eq(teams.id, apiRow.teamId)).limit(1);
    return {
      apiId,
      teamName: teamRow?.name ?? apiRow.teamId,
      squadId: apiRow.squadId,
      slackChannel: teamRow?.slackChannelId ?? undefined,
      officeLocation: apiRow.locationId,
    };
  }
}
