/**
 * On CRITICAL threat with riskScore > 75: fire webhook. Max 3 retries, 5s backoff.
 */

const MAX_RETRIES = 3;
const BACKOFF_MS = 5000;

export interface WebhookPayload {
  apiName?: string;
  changeType?: string;
  affectedDependents?: number;
  migrationGuide?: string;
  dashboardLink?: string;
}

export async function fireWebhook(url: string, payload: WebhookPayload): Promise<boolean> {
  let lastErr: Error | null = null;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return true;
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
    if (i < MAX_RETRIES - 1) {
      await new Promise((r) => setTimeout(r, BACKOFF_MS));
    }
  }
  return false;
}
