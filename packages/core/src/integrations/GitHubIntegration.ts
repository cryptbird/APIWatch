/**
 * On CRITICAL change: create GitHub issue in dependent repo (if token configured).
 */

export async function createGitHubIssue(
  repo: string,
  token: string,
  payload: { title: string; body: string }
): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: payload.title, body: payload.body }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { html_url?: string };
    return data.html_url ?? null;
  } catch {
    return null;
  }
}
