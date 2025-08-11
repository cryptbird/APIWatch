/**
 * Schema versioning: create snapshot when fingerprint changes, list versions.
 */

import type { ApiEndpoint } from '@apiwatch/shared';
import { eq, desc, and } from 'drizzle-orm';
import { createDbPool } from '../db/index.js';
import { createDrizzle } from '../db/index.js';
import { apiSnapshots } from '../db/schema.js';
import type { Env } from '../env.js';
import { computeFingerprint, endpointToSnapshotSchema } from './ApiSnapshot.js';

export class SnapshotService {
  private db: ReturnType<typeof createDrizzle> | null = null;

  constructor(private _env: Env) {}

  private getDb() {
    if (this.db === null) {
      this.db = createDrizzle(createDbPool(this._env.DATABASE_URL));
    }
    return this.db;
  }

  /**
   * Get latest snapshot version for an API.
   */
  async getLatestVersion(apiEndpointId: string): Promise<number> {
    const rows = await this.getDb()
      .select({ version: apiSnapshots.version })
      .from(apiSnapshots)
      .where(eq(apiSnapshots.apiEndpointId, apiEndpointId))
      .orderBy(desc(apiSnapshots.version))
      .limit(1);
    return rows[0]?.version ?? 0;
  }

  /**
   * Create new snapshot when fingerprint changes. Returns new version number.
   */
  async createIfChanged(endpoint: ApiEndpoint, capturedBy: string): Promise<{ version: number; created: boolean }> {
    const fingerprint = computeFingerprint(endpoint);
    const latest = await this.getDb()
      .select({ version: apiSnapshots.version, fingerprintHash: apiSnapshots.fingerprintHash })
      .from(apiSnapshots)
      .where(eq(apiSnapshots.apiEndpointId, endpoint.id))
      .orderBy(desc(apiSnapshots.version))
      .limit(1);
    const prev = latest[0];
    if (prev?.fingerprintHash === fingerprint) {
      return { version: prev.version, created: false };
    }
    const newVersion = (prev?.version ?? 0) + 1;
    await this.getDb().insert(apiSnapshots).values({
      apiEndpointId: endpoint.id,
      version: newVersion,
      schema: endpointToSnapshotSchema(endpoint),
      capturedBy,
      fingerprintHash: fingerprint,
    });
    return { version: newVersion, created: true };
  }

  /**
   * List all snapshot versions for an API.
   */
  async listByApiId(apiId: string): Promise<Array<{ id: string; version: number; capturedAt: Date }>> {
    const rows = await this.getDb()
      .select({ id: apiSnapshots.id, version: apiSnapshots.version, capturedAt: apiSnapshots.capturedAt })
      .from(apiSnapshots)
      .where(eq(apiSnapshots.apiEndpointId, apiId))
      .orderBy(desc(apiSnapshots.version));
    return rows.map((r) => ({ id: r.id, version: r.version, capturedAt: r.capturedAt }));
  }

  /**
   * Get a specific snapshot by API id and version.
   */
  async getByVersion(apiId: string, version: number): Promise<{ schema: unknown; capturedAt: Date } | null> {
    const all = await this.getDb()
      .select()
      .from(apiSnapshots)
      .where(and(eq(apiSnapshots.apiEndpointId, apiId), eq(apiSnapshots.version, version)))
      .limit(1);
    const found = all[0];
    if (!found) return null;
    return { schema: found.schema, capturedAt: found.capturedAt };
  }
}