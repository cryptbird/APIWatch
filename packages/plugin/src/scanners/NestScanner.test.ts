/**
 * Unit tests for NestScanner.
 */

import { describe, it, expect } from 'vitest';
import { NestScanner } from './NestScanner.js';

describe('NestScanner', () => {
  it('returns array', async () => {
    const scanner = new NestScanner();
    const results = await scanner.scan(__dirname);
    expect(Array.isArray(results)).toBe(true);
  });

  it('each endpoint has path and method', async () => {
    const scanner = new NestScanner();
    const results = await scanner.scan(__dirname);
    for (const ep of results) {
      expect(ep).toHaveProperty('path');
      expect(ep).toHaveProperty('method');
    }
  });

  it('handles empty dir', async () => {
    const scanner = new NestScanner();
    const results = await scanner.scan(__dirname + '/__nonexistent__');
    expect(results).toEqual([]);
  });
});
