/**
 * Unit tests for GraphQLScanner.
 */

import { describe, it, expect } from 'vitest';
import { GraphQLScanner } from './GraphQLScanner.js';

describe('GraphQLScanner', () => {
  it('returns array', async () => {
    const scanner = new GraphQLScanner();
    const results = await scanner.scan(__dirname);
    expect(Array.isArray(results)).toBe(true);
  });

  it('each endpoint has path and method POST', async () => {
    const scanner = new GraphQLScanner();
    const results = await scanner.scan(__dirname);
    for (const ep of results) {
      expect(ep.method).toBe('POST');
      expect(ep.path).toContain('graphql');
    }
  });
});
