/**
 * Notification analytics: delivery rate, open rate, acknowledge rate, time-to-acknowledge.
 */

export interface NotificationMetrics {
  sent: number;
  failed: number;
  acknowledged: number;
  avgTimeToAckMs: number;
}

const metrics: NotificationMetrics = { sent: 0, failed: 0, acknowledged: 0, avgTimeToAckMs: 0 };

export function recordSent(): void {
  metrics.sent++;
}

export function recordFailed(): void {
  metrics.failed++;
}

export function recordAcknowledged(timeToAckMs: number): void {
  metrics.acknowledged++;
  const total = (metrics.avgTimeToAckMs * (metrics.acknowledged - 1) + timeToAckMs) / metrics.acknowledged;
  metrics.avgTimeToAckMs = Math.round(total);
}

export function getMetrics(): NotificationMetrics {
  return { ...metrics };
}
