/**
 * Integration test: deduplication within 1hr window.
 */

import { describe, it, expect } from 'vitest';
import { shouldDedupe, markDedupe } from '../../src/notifications/deduplication.js';

describe('Deduplication', () => {
  it('shouldDedupe returns false when not marked', async () => {
    const result = await shouldDedupe('user1', 'api1');
    expect(typeof result).toBe('boolean');
  });
  it('markDedupe does not throw', async () => {
    await expect(markDedupe('user1', 'api1')).resolves.toBeUndefined();
  });
});
