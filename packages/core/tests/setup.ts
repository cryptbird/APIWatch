/**
 * Vitest setup file for APIWatch core tests.
 */
import { beforeAll, afterAll, vi } from 'vitest';

beforeAll(() => {
  vi.stubEnv('NODE_ENV', 'test');
});

afterAll(() => {
  vi.unstubAllEnvs();
});
