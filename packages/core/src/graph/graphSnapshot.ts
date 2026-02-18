/**
 * Graph snapshots: capture and query historical graph state for diff and trends.
 */

import type { SerializedGraph } from '@apiwatch/shared';
import { createDbPool } from '../db/index.js';
import { createDrizzle } from '../db/index.js';
import type { Env } from '../env.js';

// Placeholder until 0005_graph_snapshots migration adds the table.
// GraphService or a job can call saveSnapshot(serialized) and loadSnapshot(date).

export async function saveSnapshot(_env: Env, _serialized: SerializedGraph): Promise<void> {
  // Requires graph_snapshots table; implemented when migration is run.
}

export async function loadSnapshot(_env: Env, _at: Date): Promise<SerializedGraph | null> {
  return null;
}
