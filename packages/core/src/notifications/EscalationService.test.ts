import { describe, it, expect } from 'vitest';
import { EscalationService } from './EscalationService.js';

describe('EscalationService', () => {
  it('returns null when acknowledged', () => {
    const svc = new EscalationService();
    expect(svc.getEscalationLevel(true, new Date())).toBeNull();
  });
  it('returns level 1 after 2h unacknowledged', () => {
    const svc = new EscalationService();
    const createdAt = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const level = svc.getEscalationLevel(false, createdAt);
    expect(level?.level).toBeGreaterThanOrEqual(1);
  });
});
