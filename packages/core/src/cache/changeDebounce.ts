/**
 * Debounce rapid changes: batch changes for same API within 60s window (Redis TTL).
 */

const DEBOUNCE_TTL_SECONDS = 60;

interface PendingChange {
  apiId: string;
  at: number;
}

const pendingByApi = new Map<string, PendingChange>();

export function shouldDebounce(apiId: string): boolean {
  const now = Date.now();
  const pending = pendingByApi.get(apiId);
  if (pending && now - pending.at < DEBOUNCE_TTL_SECONDS * 1000) {
    return true;
  }
  pendingByApi.set(apiId, { apiId, at: now });
  return false;
}

export function clearDebounce(apiId: string): void {
  pendingByApi.delete(apiId);
}
