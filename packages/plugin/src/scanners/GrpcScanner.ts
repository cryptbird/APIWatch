/**
 * gRPC scanner. Parse .proto files, extract service definitions, RPC methods, request/response types.
 * Convert to ApiEndpoint format (pseudo path: /ServiceName/MethodName).
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ApiEndpoint, HttpMethod } from '@apiwatch/shared';

export class GrpcScanner {
  async scan(rootDir: string): Promise<ApiEndpoint[]> {
    const endpoints: ApiEndpoint[] = [];
    const now = new Date();
    this.walk(rootDir, (filePath) => {
      if (!filePath.endsWith('.proto')) return;
      try {
        const content = readFileSync(filePath, 'utf-8');
        const services = this.parseServices(content);
        for (const svc of services) {
          for (const rpc of svc.rpcs) {
            endpoints.push({
              id: `grpc-${svc.name}-${rpc}-${now.getTime()}`,
              repoId: '',
              path: `/${svc.name}/${rpc}`,
              method: 'POST' as HttpMethod,
              params: [],
              responses: {},
              tags: ['grpc'],
              deprecated: false,
              teamId: '',
              squadId: '',
              locationId: '',
              createdAt: now,
              updatedAt: now,
            });
          }
        }
      } catch {
        // skip
      }
    });
    return endpoints;
  }

  private parseServices(content: string): Array<{ name: string; rpcs: string[] }> {
    const out: Array<{ name: string; rpcs: string[] }> = [];
    const serviceBlocks = content.match(/service\s+(\w+)\s*\{([^}]+)\}/g) ?? [];
    for (const block of serviceBlocks) {
      const nameMatch = block.match(/service\s+(\w+)/);
      const name = nameMatch?.[1] ?? 'Unknown';
      const rpcs = block.match(/rpc\s+(\w+)/g)?.map((s) => s.replace(/rpc\s+/, '')) ?? [];
      out.push({ name, rpcs });
    }
    return out;
  }

  private walk(dir: string, onFile: (path: string) => void): void {
    if (!existsSync(dir)) return;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory() && e.name !== 'node_modules' && e.name !== '.git')
        this.walk(full, onFile);
      else if (e.isFile()) onFile(full);
    }
  }
}
