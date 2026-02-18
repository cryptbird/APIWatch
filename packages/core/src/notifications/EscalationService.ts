/**
 * Escalation: unacknowledged CRITICAL after 2h -> team lead; 4h -> manager; 8h -> JIRA P1.
 */

export interface EscalationLevel {
  level: number;
  at: Date;
  target: string;
}

export class EscalationService {
  getEscalationLevel(acknowledged: boolean, createdAt: Date): EscalationLevel | null {
    if (acknowledged) return null;
    const hours = (Date.now() - createdAt.getTime()) / (60 * 60 * 1000);
    if (hours >= 8) return { level: 3, at: new Date(createdAt.getTime() + 8 * 3600000), target: 'jira' };
    if (hours >= 4) return { level: 2, at: new Date(createdAt.getTime() + 4 * 3600000), target: 'manager' };
    if (hours >= 2) return { level: 1, at: new Date(createdAt.getTime() + 2 * 3600000), target: 'team_lead' };
    return null;
  }
}
