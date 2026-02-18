/**
 * Unit tests for ParamExtractor.
 */

import { describe, it, expect } from 'vitest';
import { ParamExtractor } from './ParamExtractor.js';

describe('ParamExtractor', () => {
  it('extractFromHandler returns array', () => {
    const ext = new ParamExtractor();
    expect(ext.extractFromHandler(undefined as never)).toEqual([]);
  });

  it('isRequired returns boolean', () => {
    const ext = new ParamExtractor();
    expect(ext.isRequired({ name: 'x' })).toBe(true);
  });

  it('extractBodySchema returns undefined when no body', () => {
    const ext = new ParamExtractor();
    expect(ext.extractBodySchema(undefined as never)).toBeUndefined();
  });
});
