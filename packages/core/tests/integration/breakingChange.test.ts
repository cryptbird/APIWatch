/**
 * Integration test: CRITICAL classification when required param is added.
 */

import { describe, it, expect } from 'vitest';
import { diff } from '../../src/diff/SchemaDiff.js';
import { classify } from '../../src/diff/ThreatClassifier.js';
import type { ApiEndpoint } from '@apiwatch/shared';

function endpoint(overrides: Partial<ApiEndpoint> = {}): ApiEndpoint {
  return {
    id: 'ep1',
    repoId: 'r1',
    path: '/users',
    method: 'GET',
    params: [],
    responses: {},
    tags: [],
    deprecated: false,
    teamId: 't1',
    squadId: 's1',
    locationId: 'loc1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('CRITICAL classification', () => {
  it('required param addition yields CRITICAL', () => {
    const before = endpoint({ params: [] });
    const after = endpoint({
      params: [{ name: 'orgId', in: 'query', required: true, schema: { type: 'string' } }],
    });
    const result = diff(before, after, 'ep1', 1, 2);
    expect(classify(result)).toBe('CRITICAL');
  });
});
