import { describe, it, expect, vi } from 'vitest';
import { createGitHubIssue } from './GitHubIntegration.js';

describe('GitHubIntegration', () => {
  it('returns null when request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    const url = await createGitHubIssue('owner/repo', 'token', { title: 'Title', body: 'Body' });
    expect(url).toBeNull();
    vi.unstubAllGlobals();
  });
});
