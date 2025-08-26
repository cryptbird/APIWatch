import { describe, it, expect, vi } from 'vitest';
import { SlackChannel } from './SlackChannel.js';

describe('SlackChannel', () => {
  it('sends to webhook when URL configured', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const ch = new SlackChannel('https://hooks.slack.com/x');
    const ok = await ch.send('channel', 'Subject', 'Body', {});
    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://hooks.slack.com/x',
      expect.objectContaining({ method: 'POST' })
    );
    vi.unstubAllGlobals();
  });
});
