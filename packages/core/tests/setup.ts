/**
 * Vitest setup file for APIWatch core tests.
 */
import { beforeAll, afterAll, vi } from 'vitest';

beforeAll(() => {
  vi.stubEnv('NODE_ENV', 'test');
  vi.stubEnv('DATABASE_URL', 'postgresql://test:test@localhost:5432/test');
  vi.stubEnv('REDIS_URL', 'redis://localhost:6379');
});

afterAll(() => {
  vi.unstubAllEnvs();
});
