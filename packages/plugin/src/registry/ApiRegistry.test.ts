/**
 * Unit tests for ApiRegistry.
 */

import { describe, it, expect } from 'vitest';
import { ApiRegistry } from './ApiRegistry.js';
import type { ApiEndpoint } from '@apiwatch/shared';

function makeEndpoint(id: string, path: string, method: string): ApiEndpoint {
  const now = new Date();
  return {
    id,
    repoId: 'r1',
    path,
    method: method as ApiEndpoint['method'],
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

describe('ApiRegistry', () => {
  it('register and getAll', () => {
    const reg = new ApiRegistry();
    const ep = makeEndpoint('e1', '/users', 'GET');
    reg.register(ep);
    expect(reg.getAll()).toHaveLength(1);
    expect(reg.getByPath('/users', 'GET')).toBeDefined();
  });

  it('diff returns added and removed', () => {
    const reg = new ApiRegistry();
    reg.register(makeEndpoint('e1', '/a', 'GET'));
    const previous = [makeEndpoint('e2', '/b', 'GET')];
    const d = reg.diff(previous);
    expect(d.added).toHaveLength(1);
    expect(d.removed).toHaveLength(1);
  });

  it('clear empties registry', () => {
    const reg = new ApiRegistry();
    reg.register(makeEndpoint('e1', '/a', 'GET'));
    reg.clear();
    expect(reg.getAll()).toHaveLength(0);
  });
});
