/**
 * Unit tests for fingerprint.
 */

import { describe, it, expect } from 'vitest';
import { fingerprint, fingerprintFromParts } from './fingerprint.js';
import type { ApiEndpoint } from '@apiwatch/shared';

function makeEndpoint(overrides: Partial<ApiEndpoint>): ApiEndpoint {
  const now = new Date();
  return {
    id: 'e1',
    repoId: 'r1',
    path: '/users',
    method: 'GET',
    params: [],
    responses: {},
    tags: [],
    deprecated: false,
    teamId: '',
    squadId: '',
    locationId: '',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('fingerprint', () => {
  it('returns 64-char hex string', () => {
    const ep = makeEndpoint({});
    const fp = fingerprint(ep);
    expect(fp).toMatch(/^[a-f0-9]{64}$/);
  });

  it('same input gives same fingerprint', () => {
    const ep = makeEndpoint({ repoId: 'r1', path: '/a', method: 'GET' });
    expect(fingerprint(ep)).toBe(fingerprint(ep));
  });

  it('different params give different fingerprint', () => {
    const a = makeEndpoint({ params: [{ name: 'x', in: 'query', required: false, schema: {} }] });
    const b = makeEndpoint({ params: [{ name: 'y', in: 'query', required: false, schema: {} }] });
    expect(fingerprint(a)).not.toBe(fingerprint(b));
  });
});

describe('fingerprintFromParts', () => {
  it('matches fingerprint for equivalent endpoint', () => {
    const ep = makeEndpoint({ repoId: 'r1', path: '/x', method: 'POST', params: [{ name: 'a', in: 'body', required: true, schema: {} }] });
    const fp1 = fingerprint(ep);
    const fp2 = fingerprintFromParts('r1', 'POST', '/x', ['a']);
    expect(fp1).toBe(fp2);
  });
});
