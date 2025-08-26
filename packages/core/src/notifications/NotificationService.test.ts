/**
 * Unit tests for NotificationService.
 */

import { describe, it, expect, vi } from 'vitest';
import { NotificationService } from './NotificationService.js';
import type { SchemaDiff } from '@apiwatch/shared';
import type { Env } from '../env.js';

const mockEnv = {} as Env;

function mockDiff(): SchemaDiff {
  return {
    apiEndpointId: 'ep1',
    fromVersion: 1,
    toVersion: 2,
    changes: [],
    breakingChanges: [],
    nonBreakingChanges: [],
    timestamp: new Date(),
  };
}

describe('NotificationService', () => {
  it('registers channel and fanOut calls it', async () => {
    const sent = vi.fn().mockResolvedValue(true);
    const svc = new NotificationService(mockEnv);
    svc.registerChannel('email', { send: sent });
    const event = {
      changeEventId: 'ce1',
      apiEndpointId: 'ep1',
      diff: mockDiff(),
      threatLevel: 'CRITICAL',
      riskScore: 80,
    };
    await svc.fanOut(event, [{ userId: 'u1', email: 'u1@x.com', channels: ['email'] }]);
    expect(sent).toHaveBeenCalledTimes(1);
    expect(sent.mock.calls[0]?.[1]).toContain('CRITICAL');
  });
});
