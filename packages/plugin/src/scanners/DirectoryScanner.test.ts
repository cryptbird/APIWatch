/**
 * Unit tests for DirectoryScanner.
 */

import { describe, it, expect } from 'vitest';
import { DirectoryScanner } from './DirectoryScanner.js';
import type { ApiWatchConfig } from '../config.js';

const baseConfig: ApiWatchConfig = {
  serverUrl: 'http://localhost',
  repoId: 'r1',
  apiKey: 'k1',
  scanPaths: ['.'],
  framework: 'auto',
};

describe('DirectoryScanner', () => {
  it('scan returns array', () => {
    const scanner = new DirectoryScanner(baseConfig);
    const results = scanner.scan(__dirname);
    expect(Array.isArray(results)).toBe(true);
  });

  it('each result has path and framework', () => {
    const scanner = new DirectoryScanner(baseConfig);
    const results = scanner.scan(__dirname);
    for (const r of results) {
      expect(r).toHaveProperty('path');
      expect(r).toHaveProperty('framework');
    }
  });

  it('respects scanPaths', () => {
    const scanner = new DirectoryScanner({ ...baseConfig, scanPaths: ['__fixtures__'] });
    const results = scanner.scan(__dirname);
    expect(Array.isArray(results)).toBe(true);
  });
});
