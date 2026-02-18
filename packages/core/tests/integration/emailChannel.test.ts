/**
 * Integration tests for email channel.
 */

import { describe, it, expect } from 'vitest';
import { EmailChannel } from '../../src/notifications/channels/EmailChannel.js';

describe('EmailChannel', () => {
  it('send returns boolean', async () => {
    const ch = new EmailChannel({ transport: 'smtp', from: 'noreply@test.com' });
    const ok = await ch.send('user@test.com', 'Subject', 'Body', {});
    expect(typeof ok).toBe('boolean');
  });
});
