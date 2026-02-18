/**
 * Unit tests for GrpcScanner.
 */

import { describe, it, expect } from 'vitest';
import { GrpcScanner } from './GrpcScanner.js';

describe('GrpcScanner', () => {
  it('returns array', async () => {
    const scanner = new GrpcScanner();
    const results = await scanner.scan(__dirname);
    expect(Array.isArray(results)).toBe(true);
  });

  it('each endpoint has path containing /', async () => {
    const scanner = new GrpcScanner();
    const results = await scanner.scan(__dirname);
    for (const ep of results) {
      expect(ep.path).toContain('/');
      expect(ep.method).toBe('POST');
    }
  });
});
