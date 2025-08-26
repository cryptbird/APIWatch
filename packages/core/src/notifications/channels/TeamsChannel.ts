/**
 * Microsoft Teams incoming webhook channel. Adaptive Card format.
 */

import type { NotificationChannel } from '../../NotificationService.js';

export class TeamsChannel implements NotificationChannel {
  constructor(private _webhookUrl?: string) {}

  async send(
    recipient: string,
    subject: string,
    body: string,
    payload: Record<string, unknown>
  ): Promise<boolean> {
    try {
      if (!this._webhookUrl) return false;
      const res = await fetch(this._webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'message',
          attachments: [
            {
              contentType: 'application/vnd.microsoft.card.adaptive',
              content: { type: 'AdaptiveCard', body: [{ type: 'TextBlock', text: `[${payload.threatLevel ?? 'Alert'}] ${body}` }] },
            },
          ],
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
