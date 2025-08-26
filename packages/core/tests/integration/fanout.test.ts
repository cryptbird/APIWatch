/**
 * Integration test: fan-out to all dependent team subscribers.
 */

import { describe, it, expect } from 'vitest';
import { NotificationService } from '../../src/notifications/NotificationService.js';
import type { Env } from '../env.js';

const mockEnv = {} as Env;

describe('Fan-out', () => {
  it('fanOut sends to all subscribers', async () => {
    const sent: string[] = [];
    const svc = new NotificationService(mockEnv);
    svc.registerChannel('email', {
      send: async (recipient) => {
        sent.push(recipient);
        return true;
      },
    });
    await svc.fanOut(
      {
        changeEventId: 'ce1',
        apiEndpointId: 'ep1',
        diff: { apiEndpointId: 'ep1', fromVersion: 1, toVersion: 2, changes: [], breakingChanges: [], nonBreakingChanges: [], timestamp: new Date() },
        threatLevel: 'CRITICAL',
        riskScore: 80,
      },
      [{ userId: 'u1', email: 'u1@x.com', channels: ['email'] }, { userId: 'u2', email: 'u2@x.com', channels: ['email'] }]
    );
    expect(sent).toHaveLength(2);
  });
});
