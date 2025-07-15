/**
 * ApiReporter: register(endpoints) batches 50 per request to POST /api/endpoints/batch-upsert.
 * Exponential backoff (3 attempts), API key in Authorization header.
 */

import type { ApiEndpoint } from '@apiwatch/shared';

const BATCH_SIZE = 50;
const MAX_ATTEMPTS = 3;

export class ApiReporter {
  private serverUrl: string;
  private apiKey: string;
  private registeredIds: string[] = [];

  constructor(serverUrl: string, apiKey: string) {
    this.serverUrl = serverUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  async register(endpoints: ApiEndpoint[]): Promise<void> {
    for (let i = 0; i < endpoints.length; i += BATCH_SIZE) {
      const chunk = endpoints.slice(i, i + BATCH_SIZE);
      await this.sendBatch(chunk);
    }
  }

  private async sendBatch(chunk: ApiEndpoint[]): Promise<void> {
    let lastErr: Error | null = null;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const res = await fetch(`${this.serverUrl}/api/endpoints/batch-upsert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({ endpoints: chunk }),
        });
        if (res.ok) {
          const data = (await res.json()) as { ids?: string[] };
          if (Array.isArray(data.ids)) this.registeredIds.push(...data.ids);
          return;
        }
        lastErr = new Error(`HTTP ${res.status}`);
      } catch (e) {
        lastErr = e instanceof Error ? e : new Error(String(e));
      }
      await this.backoff(attempt);
    }
    throw lastErr ?? new Error('Failed after retries');
  }

  private backoff(attempt: number): Promise<void> {
    const ms = Math.min(1000 * Math.pow(2, attempt), 10000);
    return new Promise((r) => setTimeout(r, ms));
  }

  async heartbeat(): Promise<void> {
    try {
      const res = await fetch(`${this.serverUrl}/health`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      throw e instanceof Error ? e : new Error(String(e));
    }
  }

  async deregister(endpointId: string): Promise<void> {
    try {
      await fetch(`${this.serverUrl}/api/endpoints/${endpointId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      this.registeredIds = this.registeredIds.filter((id) => id !== endpointId);
    } catch {
      // ignore
    }
  }

  getRegisteredIds(): string[] {
    return [...this.registeredIds];
  }
}
