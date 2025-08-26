/**
 * Daily digest: collect unread notifications from past 24h, group by threat, send summary email.
 */

import type { Env } from '../env.js';

export class DigestScheduler {
  constructor(private _env: Env) {}

  async run(): Promise<{ sent: number }> {
    return { sent: 0 };
  }
}
