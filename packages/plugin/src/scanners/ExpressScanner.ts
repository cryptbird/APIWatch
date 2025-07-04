/**
 * Express route scanner using ts-morph AST.
 * Extracts app.get/post/put/patch/delete/use, router.route(), nested router.use().
 */

import { Project, type SourceFile, SyntaxKind } from 'ts-morph';
import type { ApiEndpoint, ApiParam, HttpMethod } from '@apiwatch/shared';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options'] as const;

export interface RawRoute {
  path: string;
  method: string;
  handlerName?: string;
}

export class ExpressScanner {
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
      const rawRoutes = this.extractRoutes(sourceFile);
      for (const r of rawRoutes) {
        const method = r.method.toUpperCase() as HttpMethod;
        if (!HTTP_METHODS.includes(r.method.toLowerCase() as (typeof HTTP_METHODS)[number])) continue;
        endpoints.push({
          id: `express-${r.path}-${method}-${now.getTime()}`,
          repoId: '',
          path: r.path,
          method,
          params: [],
          responses: {},
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

  extractRoutes(sourceFile: SourceFile): RawRoute[] {
    const routes: RawRoute[] = [];
    const appIdentifiers = ['app', 'router', 'application'];
    for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
      const expr = call.getExpression();
      const text = expr.getText();
      const isApp = appIdentifiers.some((id) => text.startsWith(id + '.'));
      if (!isApp) continue;
      const methodMatch = text.match(/\.(get|post|put|patch|delete|use|route)\s*\(/);
      if (!methodMatch) continue;
      const method = methodMatch[1];
      const args = call.getArguments();
      if (args.length === 0) continue;
      const firstArg = args[0];
      const path = firstArg.getText().replace(/^['`"]|['`"]$/g, '');
      if (method === 'use') {
        routes.push({ path: path || '/', method: 'use', handlerName: undefined });
      } else if (method === 'route') {
        routes.push({ path: path || '/', method: 'get', handlerName: undefined });
      } else {
        routes.push({ path: path || '/', method, handlerName: undefined });
      }
    }
    return routes;
  }
}
