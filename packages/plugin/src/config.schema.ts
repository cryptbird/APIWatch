/**
 * Zod schema for APIWatch plugin configuration.
 */

import { z } from 'zod';

export const apiWatchConfigSchema = z.object({
  serverUrl: z.string().url('serverUrl must be a valid URL'),
  repoId: z.string().min(1, 'repoId is required'),
  apiKey: z.string().min(1, 'apiKey is required'),
  scanPaths: z.array(z.string()).min(1, 'At least one scan path is required'),
  ignorePaths: z.array(z.string()).optional().default([]),
  framework: z.enum(['express', 'fastify', 'nest', 'auto']),
  trackOutbound: z.boolean().optional().default(true),
  teamId: z.string().optional().default(''),
  orgId: z.string().optional().default(''),
});

export type ApiWatchConfig = z.infer<typeof apiWatchConfigSchema>;
