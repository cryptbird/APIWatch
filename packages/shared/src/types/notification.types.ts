/**
 * Shared notification and channel types for APIWatch.
 */

import type { ThreatLevel } from './api.types.js';

export type NotificationChannel = 'email' | 'slack' | 'teams' | 'in_app';

export interface Subscriber {
  id: string;
  teamId: string;
  userId: string;
  email?: string;
  slackUserId?: string;
  preferredChannels: NotificationChannel[];
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface Notification {
  id: string;
  changeEventId: string;
  subscriberId: string;
  channel: NotificationChannel;
  sentAt: Date;
  acknowledgedAt?: Date;
  payload: Record<string, unknown>;
}

export interface ChangeEventPayload {
  apiId: string;
  apiPath: string;
  threatLevel: ThreatLevel;
  changeSummary: string;
  affectedCount: number;
  migrationGuide?: string;
}
