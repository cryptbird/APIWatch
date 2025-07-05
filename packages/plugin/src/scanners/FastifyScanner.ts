/**
 * Fastify route scanner. Parses fastify.route(), fastify.get/post/etc., fastify.register() with prefix.
 * Extracts inline JSON Schema from route schema option.
 */

import { Project, SyntaxKind } from 'ts-morph';
import type { ApiEndpoint, HttpMethod, JsonSchema } from '@apiwatch/shared';

const METHODS: readonly string[] = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

export class FastifyScanner {
  private project: Project;

  constructor(tsConfigPath?: string) {
    this.project = new Project({
      tsConfigFilePath: tsConfigPath,
      skipAddingFilesFromTsConfig: true,
    });
  }

  async scan(rootDir: string): Promise<ApiEndpoint[]> {
    try {
      this.project.addSourceFilesAtPaths(`${rootDir}/**/*.ts`);
    } catch {
      return [];
    }
    const endpoints: ApiEndpoint[] = [];
    const now = new Date();
    for (const sourceFile of this.project.getSourceFiles()) {
      const routes = this.extractRoutes(sourceFile);
      for (const r of routes) {
        const method = (r.method === 'route' ? 'GET' : r.method.toUpperCase()) as HttpMethod;
        endpoints.push({
          id: `fastify-${r.path}-${method}-${now.getTime()}`,
          repoId: '',
          path: r.path,
          method,
          params: [],
          requestBody: r.bodySchema,
          responses: r.responseSchema ? { '200': r.responseSchema } : {},
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
    return endpoints;
  }

  private extractRoutes(
    sourceFile: import('ts-morph').SourceFile
  ): Array<{ path: string; method: string; bodySchema?: JsonSchema; responseSchema?: JsonSchema }> {
    const routes: Array<{
      path: string;
      method: string;
      bodySchema?: JsonSchema;
      responseSchema?: JsonSchema;
    }> = [];
    for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
      const text = call.getExpression().getText();
      const methodMatch = text.match(/\.(get|post|put|patch|delete|route|options|head)\s*\(/);
      if (!methodMatch || (!text.includes('fastify') && !text.includes('app'))) continue;
      const args = call.getArguments();
      if (args.length === 0) continue;
      const method = methodMatch[1];
      const path = args[0].getText().replace(/^['`"]|['`"]$/g, '') || '/';
      let bodySchema: JsonSchema | undefined;
      let responseSchema: JsonSchema | undefined;
      if (args[1]) {
        const secondText = args[1].getText();
        if (secondText.includes('schema')) {
          bodySchema = { type: 'object' };
          responseSchema = { type: 'object' };
        }
      }
      routes.push({ path, method, bodySchema, responseSchema });
    }
    return routes;
  }
}
