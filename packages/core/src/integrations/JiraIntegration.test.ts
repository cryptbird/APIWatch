import { describe, it, expect, vi } from 'vitest';
import { createJiraIssue } from './JiraIntegration.js';

describe('JiraIntegration', () => {
  it('returns key on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ key: 'PROJ-123' }) }));
    const key = await createJiraIssue(
      { baseUrl: 'https://jira.atlassian.net', project: 'PROJ' },
      { summary: 'Break', description: 'Desc', apiId: 'ep1' }
    );
    expect(key).toBe('PROJ-123');
    vi.unstubAllGlobals();
  });
});
