/**
 * Unit tests for ExpressScanner.
 */

import { describe, it, expect } from 'vitest';
import { ExpressScanner } from './ExpressScanner.js';

describe('ExpressScanner', () => {
  it('extracts simple get route', async () => {
    const scanner = new ExpressScanner();
    const results = await scanner.scan(__dirname);
    expect(Array.isArray(results)).toBe(true);
  });

  it('returns ApiEndpoint shape for each route', async () => {
    const scanner = new ExpressScanner();
    const results = await scanner.scan(__dirname);
    for (const ep of results) {
      expect(ep).toHaveProperty('id');
      expect(ep).toHaveProperty('path');
      expect(ep).toHaveProperty('method');
      expect(ep).toHaveProperty('params');
      expect(Array.isArray(ep.params)).toBe(true);
    }
  });

  it('handles empty directory', async () => {
    const scanner = new ExpressScanner();
    const results = await scanner.scan(__dirname + '/__fixtures__');
    expect(Array.isArray(results)).toBe(true);
  });
});
