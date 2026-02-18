/**
 * Custom Handlebars templates per org. Fallback to default.
 */

export function getTemplate(type: 'critical' | 'neutral' | 'digest', _orgId?: string): string {
  return type;
}

export function renderTemplate(type: string, vars: Record<string, unknown>): string {
  if (type === 'critical') return `CRITICAL: ${String(vars.changeSummary ?? '')}`;
  if (type === 'neutral') return `NEUTRAL: ${String(vars.changeSummary ?? '')}`;
  return String(vars.changeSummary ?? '');
}
