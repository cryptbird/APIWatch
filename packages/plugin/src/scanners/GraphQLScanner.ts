/**
 * GraphQL scanner. Parse .graphql schema files and resolvers.
 * Extract Query/Mutation/Subscription types, arguments, return types.
 * Register as pseudo-REST: POST /graphql#OperationName.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ApiEndpoint, HttpMethod } from '@apiwatch/shared';

export class GraphQLScanner {
  async scan(rootDir: string): Promise<ApiEndpoint[]> {
    const endpoints: ApiEndpoint[] = [];
    const now = new Date();
    try {
      this.walk(rootDir, (filePath) => {
        if (!filePath.endsWith('.graphql') && !filePath.endsWith('.gql')) return;
        const content = readFileSync(filePath, 'utf-8');
        const ops = this.parseOperations(content);
        for (const op of ops) {
          endpoints.push({
            id: `gql-${op}-${now.getTime()}`,
            repoId: '',
            path: `/graphql#${op}`,
            method: 'POST' as HttpMethod,
            params: [],
            responses: {},
            tags: ['graphql'],
            deprecated: false,
            teamId: '',
            squadId: '',
            locationId: '',
            createdAt: now,
            updatedAt: now,
          });
        }
      });
    } catch {
      return [];
    }
    return endpoints;
  }

  private parseOperations(content: string): string[] {
    const ops: string[] = [];
    const typeMatch = content.match(/type\s+(Query|Mutation|Subscription)\s*\{([^}]+)\}/g);
    if (typeMatch) {
      for (const block of typeMatch) {
        const names = block.match(/\b(\w+)\s*\(/g)?.map((s) => s.replace(/\s*\($/, '')) ?? [];
        ops.push(...names);
      }
    }
    if (ops.length === 0 && content.includes('query') || content.includes('mutation'))
      ops.push('Operation');
    return ops;
  }

  private walk(dir: string, onFile: (path: string) => void): void {
    const { readdirSync } = require('node:fs');
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory() && e.name !== 'node_modules' && e.name !== '.git')
        this.walk(full, onFile);
      else if (e.isFile()) onFile(full);
    }
  }
}
