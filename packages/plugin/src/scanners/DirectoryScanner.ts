/**
 * Recursively walk directories matching scan paths. Skip node_modules, dist, .git,
 * test files (*spec*, *test*), files in .apiwatchignore. Detect framework by inspecting imports.
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ApiWatchConfig } from '../config.js';

const DEFAULT_IGNORE = [
  'node_modules',
  'dist',
  '.git',
  '**/*.spec.ts',
  '**/*.spec.js',
  '**/*.test.ts',
  '**/*.test.js',
  '**/*.d.ts',
  '**/*.generated.ts',
  '**/migrations/**',
];

function matchesGlob(path: string, pattern: string): boolean {
  const re = new RegExp(
    '^' + pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*').replace(/\./g, '\\.') + '$'
  );
  return re.test(path.replace(/\\/g, '/'));
}

export interface ScannedFile {
  path: string;
  framework: 'express' | 'fastify' | 'nest' | 'unknown';
}

export class DirectoryScanner {
  private config: ApiWatchConfig;
  private ignorePatterns: string[] = [];

  constructor(config: ApiWatchConfig) {
    this.config = config;
    this.ignorePatterns = [...DEFAULT_IGNORE, ...(config.ignorePaths ?? [])];
    const root = typeof config.scanPaths[0] === 'string' ? join(process.cwd(), config.scanPaths[0]) : process.cwd();
    this.loadApiwatchignore(root);
  }

  private loadApiwatchignore(root: string): void {
    const p = join(root, '.apiwatchignore');
    if (!existsSync(p)) return;
    try {
      const lines = readFileSync(p, 'utf-8').split(/\r?\n/);
      for (const line of lines) {
        const t = line.replace(/#.*/, '').trim();
        if (t) this.ignorePatterns.push(t);
      }
    } catch {
      // ignore
    }
  }

  private shouldSkip(relativePath: string): boolean {
    const normalized = relativePath.replace(/\\/g, '/');
    for (const pattern of this.ignorePatterns) {
      if (matchesGlob(normalized, pattern)) return true;
      if (normalized.includes('node_modules') || normalized.includes('.git')) return true;
      if (/\/(spec|test)\.[tj]s$/i.test(normalized)) return true;
    }
    return false;
  }

  private detectFramework(content: string): ScannedFile['framework'] {
    if (/from\s+['"]express['"]|require\s*\(\s*['"]express['"]/.test(content)) return 'express';
    if (/from\s+['"]fastify['"]|require\s*\(\s*['"]fastify['"]/.test(content)) return 'fastify';
    if (/@Controller|@nestjs/.test(content)) return 'nest';
    return 'unknown';
  }

  scan(rootDir: string): ScannedFile[] {
    const results: ScannedFile[] = [];
    const scanPaths = this.config.scanPaths.length ? this.config.scanPaths : ['.'];
    for (const base of scanPaths) {
      const full = join(rootDir, base);
      if (!existsSync(full)) continue;
      this.walk(full, base, results);
    }
    return results;
  }

  private walk(dir: string, relative: string, out: ScannedFile[]): void {
    let entries: string[];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const rel = relative ? join(relative, e.name) : e.name;
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist') continue;
        this.walk(join(dir, e.name), rel, out);
      } else if (e.isFile() && /\.(ts|js)$/.test(e.name) && !/\.(spec|test)\.(ts|js)$/i.test(e.name)) {
        if (this.shouldSkip(rel)) continue;
        const content = readFileSync(join(dir, e.name), 'utf-8');
        out.push({ path: join(dir, e.name), framework: this.detectFramework(content) });
      }
    }
  }
}
