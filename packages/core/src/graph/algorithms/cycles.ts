/**
 * Format cycles as human-readable descriptions (API A → API B → API A).
 * Store cycles in Redis for dashboard; emit cycle:detected event.
 */

const CYCLES_REDIS_KEY = 'apiwatch:graph:cycles';
const CYCLE_CHANNEL = 'cycle:detected';
const CYCLES_TTL_SECONDS = 3600;

export function formatCycleDescription(
  cycleNodeIds: string[],
  getLabel: (nodeId: string) => string = (id) => id
): string {
  if (cycleNodeIds.length === 0) return '';
  const labels = cycleNodeIds.map(getLabel);
  return labels.join(' → ') + (cycleNodeIds.length > 1 ? ' → ' + labels[0] : '');
}

export function formatCyclesDescriptions(
  cycles: string[][],
  getLabel: (nodeId: string) => string = (id) => id
): string[] {
  return cycles.map((cycle) => formatCycleDescription(cycle, getLabel));
}

export interface CyclePersistenceOptions {
  setRedis: (key: string, value: string, ttlSeconds?: number) => Promise<void>;
  publish: (channel: string, message: string) => Promise<number>;
}

/**
 * Store cycles in Redis for dashboard display and emit cycle:detected event.
 */
export async function storeCyclesAndEmit(
  options: CyclePersistenceOptions,
  cycles: string[][],
  getLabel: (nodeId: string) => string = (id) => id
): Promise<void> {
  if (cycles.length === 0) return;
  const descriptions = formatCyclesDescriptions(cycles, getLabel);
  const payload = JSON.stringify({ cycles, descriptions });
  await options.setRedis(CYCLES_REDIS_KEY, payload, CYCLES_TTL_SECONDS);
  await options.publish(CYCLE_CHANNEL, payload);
}
