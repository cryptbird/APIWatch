/**
 * Tests for AxiosInterceptor.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { installAxiosInterceptor } from './AxiosInterceptor.js';
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

describe('AxiosInterceptor', () => {
  const serverUrl = 'http://localhost:4000';
  const originalEnv = process.env.APIWATCH_SOURCE_API_ID;

  beforeEach(() => {
    process.env.APIWATCH_SOURCE_API_ID = 'source-api-1';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  afterEach(() => {
    process.env.APIWATCH_SOURCE_API_ID = originalEnv;
    vi.unstubAllGlobals();
  });

  it('installs without throwing', () => {
    expect(() =>
      installAxiosInterceptor({ axios, endpoints: [mockEndpoint], serverUrl })
    ).not.toThrow();
  });

  it('request interceptor adds X-ApiWatch-Source header', () => {
    let requestHandler: ((c: unknown) => unknown) | undefined;
    const mockAxios = {
      interceptors: {
        request: { use: vi.fn((fn: (c: unknown) => unknown) => { requestHandler = fn; }) },
        response: { use: vi.fn() },
      },
    } as unknown as ReturnType<typeof axios.create>;
    installAxiosInterceptor({
      axios: mockAxios,
      endpoints: [mockEndpoint],
      serverUrl,
    });
    const config = { headers: {} as Record<string, string>, url: '', method: 'get' };
    requestHandler?.(config);
    expect(config.headers['X-ApiWatch-Source']).toBe('source-api-1');
  });
});
