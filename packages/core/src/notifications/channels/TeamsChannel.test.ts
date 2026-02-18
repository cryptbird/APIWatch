import { describe, it, expect, vi } from 'vitest';
import { TeamsChannel } from './TeamsChannel.js';

describe('TeamsChannel', () => {
  it('returns false when webhook not configured', async () => {
    const ch = new TeamsChannel();
    expect(await ch.send('u', 'Subj', 'Body', {})).toBe(false);
  });
});
