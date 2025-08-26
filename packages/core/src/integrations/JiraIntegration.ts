/**
 * On CRITICAL change: create JIRA issue (summary, description, P1, labels).
 */

export interface JiraConfig {
  baseUrl: string;
  token?: string;
  project: string;
}

export async function createJiraIssue(
  config: JiraConfig,
  payload: { summary: string; description: string; apiId: string }
): Promise<string | null> {
  try {
    const res = await fetch(`${config.baseUrl}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: config.token ? `Bearer ${config.token}` : '',
      },
      body: JSON.stringify({
        fields: {
          project: { key: config.project },
          summary: payload.summary,
          description: payload.description,
          issuetype: { name: 'Bug' },
          priority: { name: 'Highest' },
          labels: ['apiwatch', 'breaking-change'],
        },
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { key?: string };
    return data.key ?? null;
  } catch {
    return null;
  }
}
