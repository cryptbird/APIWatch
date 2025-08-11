import { describe, it, expect } from 'vitest';
import { generateSummary } from './changeSummary.js';
import type { SchemaDiff } from '@apiwatch/shared';

function diff(description: string): SchemaDiff {
  return {
    apiEndpointId: 'ep1',
    fromVersion: 1,
    toVersion: 2,
    changes: [{ type: 'PARAM_REQUIRED_ADDED', path: 'params.orgId', before: undefined, after: {}, description }],
    breakingChanges: [],
    nonBreakingChanges: [],
    timestamp: new Date(),
  };
}

describe('changeSummary', () => {
  it('generates summary from diff', () => {
    const s = generateSummary(diff('Required parameter orgId was added.'));
    expect(s).toContain('Required parameter orgId was added');
  });
  it('appends affected count when provided', () => {
    const s = generateSummary(diff('Required param added.'), 7);
    expect(s).toContain('7 dependent');
  });
});
