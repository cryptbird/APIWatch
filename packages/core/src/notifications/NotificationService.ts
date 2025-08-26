/**
 * NotificationService: notify(changeEvent) -> get diff, dependents, subscribers, fan-out to channels.
 */

import type { Env } from '../env.js';
import { GraphService } from '../graph/GraphService.js';
import { changeEventEmitter } from '../diff/ChangeEventEmitter.js';
import { generateSummary } from '../diff/changeSummary.js';
import { generateMigrationGuide } from '../diff/migrationGuide.js';
import type { SchemaDiff } from '@apiwatch/shared';

export interface ChangeEventForNotify {
  changeEventId: string;
  apiEndpointId: string;
  diff: SchemaDiff;
  threatLevel: string;
  riskScore: number;
}

export interface NotificationChannel {
  send(recipient: string, subject: string, body: string, payload: Record<string, unknown>): Promise<boolean>;
}

export interface SubscriberRecipient {
  userId: string;
  email?: string;
  slackUserId?: string;
  channels: string[];
}

export class NotificationService {
  private channels = new Map<string, NotificationChannel>();

  constructor(private _env: Env) {}

  registerChannel(name: string, channel: NotificationChannel): void {
    this.channels.set(name, channel);
  }

  /**
   * Get dependents for an API (for affected count and fan-out).
   */
  async getDependents(apiId: string): Promise<string[]> {
    const graphService = GraphService.getInstance(this._env);
    await graphService.load();
    const list = graphService.getGraph().getDependentsBfs(apiId, 3);
    return list.map((x) => x.nodeId);
  }

  /**
   * Fan-out: send to all subscribers in parallel (Promise.allSettled).
   */
  async fanOut(
    event: ChangeEventForNotify,
    subscribers: SubscriberRecipient[]
  ): Promise<Array<{ recipient: string; ok: boolean }>> {
    const summary = generateSummary(event.diff, subscribers.length);
    const migrationGuide = generateMigrationGuide(event.diff);
    const results: Array<{ recipient: string; ok: boolean }> = [];
    const promises = subscribers.map(async (sub) => {
      const channelName = sub.channels[0] ?? 'email';
      const ch = this.channels.get(channelName);
      const recipient = sub.email ?? sub.slackUserId ?? sub.userId;
      if (!ch) {
        results.push({ recipient, ok: false });
        return;
      }
      const ok = await ch.send(recipient, `[${event.threatLevel}] API Change`, summary, {
        changeEventId: event.changeEventId,
        apiEndpointId: event.apiEndpointId,
        threatLevel: event.threatLevel,
        migrationGuide,
      });
      results.push({ recipient, ok });
    });
    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Notify: resolve dependents, get subscribers, fan-out. Emit change:detected.
   */
  async notify(event: ChangeEventForNotify): Promise<void> {
    const dependents = await this.getDependents(event.apiEndpointId);
    changeEventEmitter.emitChangeDetected({
      diff: event.diff,
      threatLevel: event.threatLevel as 'LOW' | 'NEUTRAL' | 'CRITICAL',
      riskScore: event.riskScore,
    });
    const subscribers: SubscriberRecipient[] = dependents.map((nodeId) => ({
      userId: nodeId,
      channels: ['email'],
    }));
    if (subscribers.length > 0) {
      await this.fanOut(event, subscribers);
    }
  }
}
