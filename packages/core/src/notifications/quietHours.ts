/**
 * Check if current time is within user's quiet hours. CRITICAL + riskScore > 90 bypasses.
 */

export interface QuietHours {
  start: string;
  end: string;
  timezone?: string;
}

export function isWithinQuietHours(quiet: QuietHours | undefined, _timezone?: string): boolean {
  if (!quiet?.start || !quiet?.end) return false;
  const now = new Date();
  const [sh, sm] = quiet.start.split(':').map(Number);
  const [eh, em] = quiet.end.split(':').map(Number);
  const min = now.getHours() * 60 + now.getMinutes();
  const startMin = sh * 60 + (sm ?? 0);
  const endMin = eh * 60 + (em ?? 0);
  if (startMin <= endMin) return min >= startMin && min < endMin;
  return min >= startMin || min < endMin;
}

export function shouldBypassQuietHours(threatLevel: string, riskScore: number): boolean {
  return threatLevel === 'CRITICAL' && riskScore > 90;
}
