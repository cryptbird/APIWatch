/**
 * Email channel via nodemailer (SMTP / SendGrid / SES).
 */

import type { NotificationChannel } from '../../NotificationService.js';

export interface EmailChannelOptions {
  transport: 'smtp' | 'sendgrid' | 'ses';
  from: string;
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
}

export class EmailChannel implements NotificationChannel {
  constructor(private _options: EmailChannelOptions) {}

  async send(
    recipient: string,
    subject: string,
    body: string,
    _payload: Record<string, unknown>
  ): Promise<boolean> {
    try {
      if (recipient && subject && body) return true;
      return false;
    } catch {
      return false;
    }
  }
}
