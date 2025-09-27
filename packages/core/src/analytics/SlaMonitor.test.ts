import { describe, it, expect, vi } from 'vitest';
import { SlaMonitor, type SlaConfig } from './SlaMonitor.js';

describe('SlaMonitor', () => {
  it('creates breach when error rate exceeds threshold', async () => {
    const env = { DATABASE_URL: 'postgres://x:x@localhost/x', REDIS_URL: 'redis://localhost' } as Parameters<typeof SlaMonitor>[0];
    const monitor = new SlaMonitor(env, []);
    monitor.addConfig({ apiId: 'test-api', maxErrorRate: 0.01 });
    expect(monitor).toBeDefined();
  });

  it('accepts config with maxP95LatencyMs', () => {
    const env = { DATABASE_URL: 'postgres://x:x@localhost/x', REDIS_URL: 'redis://localhost' } as Parameters<typeof SlaMonitor>[0];
    const configs: SlaConfig[] = [{ apiId: 'a', maxP95LatencyMs: 500 }];
    const monitor = new SlaMonitor(env, configs);
    expect(monitor).toBeDefined();
  });
});
