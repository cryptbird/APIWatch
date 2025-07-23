/**
 * Tests for FetchInterceptor.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { installFetchInterceptor } from './FetchInterceptor.js';
import type { ApiEndpoint } from '@apiwatch/shared';

const mockEndpoint: ApiEndpoint = {
  id: 'ep1',
  repoId: 'r1',
  path: '/api/users',
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
};

describe('FetchInterceptor', () => {
  const serverUrl = 'http://localhost:4000';
  const originalFetch = globalThis.fetch;
  const originalEnv = process.env.APIWATCH_SOURCE_API_ID;

  beforeEach(() => {
    process.env.APIWATCH_SOURCE_API_ID = 'source-1';
    const mockRes = new Response('', { status: 200 });
    globalThis.fetch = vi.fn().mockResolvedValue(mockRes);
  });

  afterEach(() => {
    process.env.APIWATCH_SOURCE_API_ID = originalEnv;
    globalThis.fetch = originalFetch;
    (globalThis as unknown as { __apiwatchFetchInstalled?: boolean }).__apiwatchFetchInstalled = false;
  });

  it('installs without throwing', () => {
    expect(() =>
      installFetchInterceptor({ endpoints: [mockEndpoint], serverUrl })
    ).not.toThrow();
  });

  it('wraps fetch and calls original with same input', async () => {
    const orig = vi.fn().mockResolvedValue(new Response('', { status: 200 }));
    globalThis.fetch = orig;
    installFetchInterceptor({ endpoints: [mockEndpoint], serverUrl });
    await globalThis.fetch('https://example.com/api/users');
    expect(orig).toHaveBeenCalledWith('https://example.com/api/users', undefined);
  });
});
