/**
 * Maintenance windows: suppress notifications for an API between startAt and endAt.
 */

const windows = new Map<string, Array<{ startAt: Date; endAt: Date; reason: string }>>();

export function addMaintenanceWindow(apiId: string, startAt: Date, endAt: Date, reason: string): void {
  const list = windows.get(apiId) ?? [];
  list.push({ startAt, endAt, reason });
  windows.set(apiId, list);
}

export function isUnderMaintenance(apiId: string): boolean {
  const list = windows.get(apiId) ?? [];
  const now = Date.now();
  return list.some((w) => now >= w.startAt.getTime() && now <= w.endAt.getTime());
}
