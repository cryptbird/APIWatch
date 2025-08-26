/**
 * Integration tests for Slack channel.
 */

import { describe, it, expect } from 'vitest';
import { SlackChannel } from '../../src/notifications/channels/SlackChannel.js';

describe('SlackChannel', () => {
  it('returns false when webhook not set', async () => {
    const ch = new SlackChannel();
    expect(await ch.send('ch', 'Subj', 'Body', {})).toBe(false);
  });
});
