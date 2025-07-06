/**
 * OpenAPI/Swagger scanner. Supports Swagger 2.0, OpenAPI 3.0/3.1.
 * Resolves $ref, converts to internal ApiEndpoint[] format.
 */

import SwaggerParser from '@apidevtools/swagger-parser';
import type { ApiEndpoint, ApiParam, HttpMethod, JsonSchema } from '@apiwatch/shared';

export class OpenApiScanner {
  async scan(specPath: string): Promise<ApiEndpoint[]> {
    const endpoints: ApiEndpoint[] = [];
    try {
      const api = await SwaggerParser.bundle(specPath) as {
        paths?: Record<string, Record<string, { parameters?: unknown[]; requestBody?: unknown; responses?: Record<string, unknown> }>>;
        basePath?: string;
        swagger?: string;
        openapi?: string;
      };
      const basePath = api.basePath ?? '';
      const paths = api.paths ?? {};
      const now = new Date();
      for (const [path, methods] of Object.entries(paths)) {
        if (typeof methods !== 'object' || methods === null) continue;
        for (const [method, op] of Object.entries(methods)) {
          if (method === 'parameters' || typeof op !== 'object' || op === null) continue;
          const httpMethod = method.toUpperCase() as HttpMethod;
          const params = this.normalizeParams(op.parameters);
          const requestBody = op.requestBody && typeof op.requestBody === 'object'
            ? (op.requestBody as { content?: { 'application/json'?: { schema?: JsonSchema } } }).content?.['application/json']?.schema
            : undefined;
          const responses: Record<string, JsonSchema> = {};
          if (op.responses && typeof op.responses === 'object') {
            for (const [code, res] of Object.entries(op.responses)) {
              if (res && typeof res === 'object' && 'schema' in res)
                responses[code] = (res as { schema?: JsonSchema }).schema ?? { type: 'object' };
            }
          }
          endpoints.push({
            id: `openapi-${basePath}${path}-${httpMethod}-${now.getTime()}`,
            repoId: '',
            path: basePath + path,
            method: httpMethod,
            params,
            requestBody,
            responses,
            tags: [],
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
      return [];
    }
    return endpoints;
  }

  private normalizeParams(parameters: unknown): ApiParam[] {
    if (!Array.isArray(parameters)) return [];
    return parameters.map((p: unknown) => {
      const q = p as { name?: string; in?: string; required?: boolean; schema?: JsonSchema };
      return {
        name: q.name ?? 'unknown',
        in: (q.in === 'query' || q.in === 'path' || q.in === 'header' || q.in === 'body') ? q.in : 'query',
        required: Boolean(q.required),
        schema: q.schema ?? { type: 'string' },
      };
    });
  }
}
