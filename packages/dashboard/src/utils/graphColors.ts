/**
 * Node/edge colors by threat level and health. CRITICAL=red, NEUTRAL=amber, LOW=green.
 */

export const THREAT_COLORS = {
  CRITICAL: '#ef4444',
  NEUTRAL: '#f59e0b',
  LOW: '#22c55e',
  unknown: '#6b7280',
} as const;

export function getNodeColor(threatLevel: string): string {
  return THREAT_COLORS[threatLevel as keyof typeof THREAT_COLORS] ?? THREAT_COLORS.unknown;
}

export function getEdgeColor(errorRate: number): string {
  if (errorRate >= 0.05) return '#ef4444';
  if (errorRate >= 0.01) return '#f59e0b';
  return '#22c55e';
}

export function nodeRadius(centralityScore: number): number {
  const r = 4 + centralityScore * 20;
  return Math.min(24, Math.max(4, r));
}

export function edgeWidth(callCount: number): number {
  return 0.5 + Math.log(Math.max(1, callCount)) * 2;
}
