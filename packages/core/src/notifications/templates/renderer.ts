/**
 * Render email templates (Handlebars). Fallback to plain text if MJML not available.
 */

export function renderCriticalTemplate(vars: { changeSummary: string; dashboardLink: string }): string {
  return `CRITICAL: API Breaking Change\n\n${vars.changeSummary}\n\nView: ${vars.dashboardLink}`;
}

export function renderNeutralTemplate(vars: { changeSummary: string }): string {
  return `NEUTRAL: API Change\n\n${vars.changeSummary}`;
}

export function renderDigestTemplate(vars: { items: Array<{ apiId: string; summary: string }> }): string {
  return `Daily Digest\n\n${vars.items.map((i) => `- ${i.apiId}: ${i.summary}`).join('\n')}`;
}
