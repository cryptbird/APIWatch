/**
 * Integration test: LOW classification for description-only changes.
 */

import { describe, it, expect } from 'vitest';
import { classify } from '../../src/diff/ThreatClassifier.js';
import type { SchemaDiff } from '@apiwatch/shared';

function diffWithDescriptionChange(): SchemaDiff {
  return {
    apiEndpointId: 'ep1',
    fromVersion: 1,
    toVersion: 2,
    changes: [
      {
        type: 'DESCRIPTION_CHANGED',
        path: 'description',
        before: 'Old',
        after: 'New',
        description: 'Description updated',
      },
    ],
    breakingChanges: [],
    nonBreakingChanges: [],
    timestamp: new Date(),
  };
}

describe('LOW classification', () => {
  it('description-only change yields LOW', () => {
    expect(classify(diffWithDescriptionChange())).toBe('LOW');
  });
});
