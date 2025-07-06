/**
 * Unit tests for OpenApiScanner.
 */

import { describe, it, expect } from 'vitest';
import { OpenApiScanner } from './OpenApiScanner.js';

describe('OpenApiScanner', () => {
  it('returns array from valid spec path', async () => {
    const scanner = new OpenApiScanner();
    const results = await scanner.scan(__dirname + '/__fixtures__/crud-api.json');
    expect(Array.isArray(results)).toBe(true);
  });

  it('returns empty array for invalid path', async () => {
    const scanner = new OpenApiScanner();
    const results = await scanner.scan('/nonexistent/spec.yaml');
    expect(results).toEqual([]);
  });

  it('each endpoint has path method params', async () => {
    const scanner = new OpenApiScanner();
    const results = await scanner.scan(__dirname + '/__fixtures__/crud-api.json');
    for (const ep of results) {
      expect(ep).toHaveProperty('path');
      expect(ep).toHaveProperty('method');
      expect(Array.isArray(ep.params)).toBe(true);
    }
  });
});
