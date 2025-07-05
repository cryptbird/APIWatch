/**
 * Unit tests for FastifyScanner.
 */

import { describe, it, expect } from 'vitest';
import { FastifyScanner } from './FastifyScanner.js';

describe('FastifyScanner', () => {
  it('returns array of endpoints', async () => {
    const scanner = new FastifyScanner();
    const results = await scanner.scan(__dirname);
    expect(Array.isArray(results)).toBe(true);
  });

  it('each endpoint has path and method', async () => {
    const scanner = new FastifyScanner();
    const results = await scanner.scan(__dirname);
    for (const ep of results) {
      expect(ep).toHaveProperty('path');
      expect(ep).toHaveProperty('method');
    }
  });

  it('handles missing directory', async () => {
    const scanner = new FastifyScanner();
    const results = await scanner.scan(__dirname + '/__nonexistent__');
    expect(results).toEqual([]);
  });
});
