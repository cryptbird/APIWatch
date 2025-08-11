/**
 * Unit tests for SchemaDiff engine.
 */

import { describe, it, expect } from 'vitest';
import { diff } from './SchemaDiff.js';
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

describe('SchemaDiff', () => {
  it('detects PARAM_REQUIRED_ADDED when required param added', () => {
    const before = endpoint({ params: [] });
    const after = endpoint({
      params: [{ name: 'orgId', in: 'query', required: true, schema: { type: 'string' } }],
    });
    const result = diff(before, after, 'ep1', 1, 2);
    expect(result.changes.some((c) => c.type === 'PARAM_REQUIRED_ADDED')).toBe(true);
  });

  it('detects PARAM_OPTIONAL_ADDED when optional param added', () => {
    const before = endpoint({ params: [] });
    const after = endpoint({
      params: [{ name: 'optional', in: 'query', required: false, schema: { type: 'string' } }],
    });
    const result = diff(before, after, 'ep1', 1, 2);
    expect(result.changes.some((c) => c.type === 'PARAM_OPTIONAL_ADDED')).toBe(true);
  });

  it('detects METHOD_CHANGED', () => {
    const before = endpoint({ method: 'GET' });
    const after = endpoint({ method: 'POST' });
    const result = diff(before, after, 'ep1', 1, 2);
    expect(result.changes.some((c) => c.type === 'METHOD_CHANGED')).toBe(true);
  });

  it('detects PATH_CHANGED', () => {
    const before = endpoint({ path: '/users' });
    const after = endpoint({ path: '/v2/users' });
    const result = diff(before, after, 'ep1', 1, 2);
    expect(result.changes.some((c) => c.type === 'PATH_CHANGED')).toBe(true);
  });

  it('detects PARAM_REMOVED', () => {
    const before = endpoint({
      params: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
    });
    const after = endpoint({ params: [] });
    const result = diff(before, after, 'ep1', 1, 2);
    expect(result.changes.some((c) => c.type === 'PARAM_REMOVED')).toBe(true);
  });
});
