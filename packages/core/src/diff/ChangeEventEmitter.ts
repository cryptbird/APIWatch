/**
 * Change event system: change:detected, change:critical, change:acknowledged.
 */

import { EventEmitter } from 'node:events';
import type { SchemaDiff } from '@apiwatch/shared';
import type { ThreatLevel } from '@apiwatch/shared';

export interface ChangeDetectedPayload {
  diff: SchemaDiff;
  threatLevel: ThreatLevel;
  riskScore: number;
}

export interface ChangeAcknowledgedPayload {
  notificationId: string;
  userId: string;
}

export class ChangeEventEmitter extends EventEmitter {
  emitChangeDetected(payload: ChangeDetectedPayload): void {
    this.emit('change:detected', payload);
    if (payload.threatLevel === 'CRITICAL') {
      this.emit('change:critical', payload);
    }
  }

  emitChangeAcknowledged(payload: ChangeAcknowledgedPayload): void {
    this.emit('change:acknowledged', payload);
  }
}

export const changeEventEmitter = new ChangeEventEmitter();
