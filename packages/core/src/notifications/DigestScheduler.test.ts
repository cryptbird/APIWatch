import { describe, it, expect } from 'vitest';
import { DigestScheduler } from './DigestScheduler.js';
import type { Env } from '../env.js';

const mockEnv = {} as Env;

describe('DigestScheduler', () => {
  it('run returns sent count', async () => {
    const scheduler = new DigestScheduler(mockEnv);
    const result = await scheduler.run();
    expect(result.sent).toBe(0);
  });
});
