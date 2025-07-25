/**
 * Format cycles as human-readable descriptions (API A → API B → API A).
 */

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
