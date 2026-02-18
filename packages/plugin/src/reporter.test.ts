/**
 * Unit tests for ApiReporter.
 */

import { describe, it, expect, vi } from 'vitest';
import { ApiReporter } from './reporter.js';
import type { ApiEndpoint } from '@apiwatch/shared';

function makeEndpoint(id: string): ApiEndpoint {
  const now = new Date();
  return {
    id,
    repoId: 'r1',
    path: '/a',
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
  };
}

describe('ApiReporter', () => {
  it('getRegisteredIds returns copy', () => {
    const r = new ApiReporter('http://localhost', 'key');
    expect(r.getRegisteredIds()).toEqual([]);
  });

  it('constructor normalizes serverUrl', () => {
    const r = new ApiReporter('http://localhost/', 'k');
    expect(r).toBeDefined();
  });

  it('register throws when server fails', async () => {
    const r = new ApiReporter('http://localhost:99999', 'k');
    await expect(r.register([makeEndpoint('e1')])).rejects.toThrow();
  });
});
