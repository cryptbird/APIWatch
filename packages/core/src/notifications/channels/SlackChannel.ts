/**
 * Slack channel: Block Kit message with threat header, change summary, action buttons.
 */

import type { NotificationChannel } from '../../NotificationService.js';

export class SlackChannel implements NotificationChannel {
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
          text: `[${payload.threatLevel ?? subject}] ${body}`,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
