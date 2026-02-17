/**
 * Load and validate apiwatch.config from project (CWD).
 * Reads apiwatch.config.ts or apiwatch.config.js, validates with Zod.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { apiWatchConfigSchema, type ApiWatchConfig } from './config.schema.js';

const CONFIG_NAMES = ['apiwatch.config.ts', 'apiwatch.config.js', 'apiwatch.config.mjs'];

export interface LoadConfigResult {
  ok: true;
  config: ApiWatchConfig;
}

export interface LoadConfigError {
  ok: false;
  message: string;
}

export type LoadConfigOutcome = LoadConfigResult | LoadConfigError;

export async function loadConfigAsync(cwd: string = process.cwd()): Promise<LoadConfigOutcome> {
  let configPath: string | null = null;
  for (const name of CONFIG_NAMES) {
    const candidate = join(cwd, name);
    if (existsSync(candidate)) {
      configPath = candidate;
      break;
    }
  }
  if (configPath === null) {
    return {
      ok: false,
      message: `No config file found. Create one of: ${CONFIG_NAMES.join(', ')} in ${cwd}`,
    };
  }
  let data: unknown;
  try {
    const mod = await import(pathToFileURL(configPath).href);
    data = mod.default ?? mod;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Failed to load ${configPath}: ${msg}` };
  }
  const parsed = apiWatchConfigSchema.safeParse(data);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    const pathStr = first?.path.join('.') ?? 'config';
    return {
      ok: false,
      message: `Invalid config (${pathStr}): ${first?.message ?? parsed.error.message}`,
    };
  }
  return { ok: true, config: parsed.data };
}

export function loadConfigSync(cwd: string = process.cwd()): LoadConfigOutcome {
  let configPath: string | null = null;
  for (const name of CONFIG_NAMES) {
    const candidate = join(cwd, name);
    if (existsSync(candidate)) {
      configPath = candidate;
      break;
    }
  }
  if (configPath === null) {
    return {
      ok: false,
      message: `No config file found. Create one of: ${CONFIG_NAMES.join(', ')} in ${cwd}`,
    };
  }
  return {
    ok: false,
    message: 'Sync config load not supported for TS/ESM. Use loadConfigAsync() instead.',
  };
}
