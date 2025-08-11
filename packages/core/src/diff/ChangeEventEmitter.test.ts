import { describe, it, expect, vi } from 'vitest';
import { ChangeEventEmitter } from './ChangeEventEmitter.js';
import type { SchemaDiff } from '@apiwatch/shared';

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

describe('ChangeEventEmitter', () => {
  it('emits change:detected and change:critical for CRITICAL', () => {
    const emitter = new ChangeEventEmitter();
    const onDetected = vi.fn();
    const onCritical = vi.fn();
    emitter.on('change:detected', onDetected);
    emitter.on('change:critical', onCritical);
    emitter.emitChangeDetected({
      diff: mockDiff(),
      threatLevel: 'CRITICAL',
      riskScore: 80,
    });
    expect(onDetected).toHaveBeenCalledTimes(1);
    expect(onCritical).toHaveBeenCalledTimes(1);
  });
  it('does not emit change:critical for NEUTRAL', () => {
    const emitter = new ChangeEventEmitter();
    const onCritical = vi.fn();
    emitter.on('change:critical', onCritical);
    emitter.emitChangeDetected({
      diff: mockDiff(),
      threatLevel: 'NEUTRAL',
      riskScore: 20,
    });
    expect(onCritical).not.toHaveBeenCalled();
  });
});
