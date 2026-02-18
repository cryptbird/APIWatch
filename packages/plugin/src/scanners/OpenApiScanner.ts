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
        paths?: Record<string, Record<string, { parameters?: unknown[]; requestBody?: unknown; responses?: Record<string, unknown>; consumes?: string[] }>>;
        basePath?: string;
        swagger?: string;
        openapi?: string;
        host?: string;
        definitions?: Record<string, JsonSchema>;
      };
      const basePath = (api.basePath ?? '').replace(/\/$/, '');
      const paths = api.paths ?? {};
      const now = new Date();
      for (const [path, methods] of Object.entries(paths)) {
        if (typeof methods !== 'object' || methods === null) continue;
        for (const [method, op] of Object.entries(methods)) {
          if (method === 'parameters' || typeof op !== 'object' || op === null) continue;
          const httpMethod = method.toUpperCase() as HttpMethod;
          const pathParams = (methods as { parameters?: unknown[] }).parameters;
          const opParams = op.parameters ?? pathParams;
          const params = this.normalizeParams(opParams);
          const requestBody = op.requestBody && typeof op.requestBody === 'object'
            ? (op.requestBody as { content?: { 'application/json'?: { schema?: JsonSchema } } }).content?.['application/json']?.schema
            : undefined;
          const responses: Record<string, JsonSchema> = {};
          if (op.responses && typeof op.responses === 'object') {
            for (const [code, res] of Object.entries(op.responses)) {
              if (res && typeof res === 'object') {
                const r = res as { schema?: JsonSchema };
                responses[code] = r.schema ?? { type: 'object' };
              }
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
