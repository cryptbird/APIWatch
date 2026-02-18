/**
 * Unit tests for ThreatClassifier.
 */

import { describe, it, expect } from 'vitest';
import { classify, computeRiskScore } from './ThreatClassifier.js';
import type { SchemaDiff } from '@apiwatch/shared';

function diffWithChanges(types: Array<{ type: SchemaDiff['changes'][0]['type'] }>): SchemaDiff {
  return {
    apiEndpointId: 'api-1',
    fromVersion: 1,
    toVersion: 2,
    changes: types.map((t) => ({
      type: t.type,
      path: '',
      before: undefined,
      after: undefined,
      description: '',
    })),
    breakingChanges: [],
    nonBreakingChanges: [],
    timestamp: new Date(),
  };
}

describe('ThreatClassifier', () => {
  it('classifies PARAM_REQUIRED_ADDED as CRITICAL', () => {
    expect(classify(diffWithChanges([{ type: 'PARAM_REQUIRED_ADDED' }]))).toBe('CRITICAL');
  });

  it('classifies PARAM_OPTIONAL_ADDED as NEUTRAL', () => {
    expect(classify(diffWithChanges([{ type: 'PARAM_OPTIONAL_ADDED' }]))).toBe('NEUTRAL');
  });

  it('classifies DESCRIPTION_CHANGED as LOW', () => {
    expect(classify(diffWithChanges([{ type: 'DESCRIPTION_CHANGED' }]))).toBe('LOW');
  });

  it('computeRiskScore returns 0-100', () => {
    const d = diffWithChanges([{ type: 'PARAM_REQUIRED_ADDED' }]);
    expect(computeRiskScore(d)).toBeGreaterThanOrEqual(0);
    expect(computeRiskScore(d)).toBeLessThanOrEqual(100);
    expect(computeRiskScore(d, { dependentCount: 10, centralityScore: 0.9 })).toBeGreaterThan(computeRiskScore(d));
  });
});
