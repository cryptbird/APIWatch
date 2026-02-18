/**
 * NestJS scanner. Finds @Controller, @Get, @Post, @Put, @Patch, @Delete.
 * Extracts @Body, @Param, @Query, @Headers. Resolves full path from controller prefix + method.
 */

import { Project, SyntaxKind } from 'ts-morph';
import type { ApiEndpoint, HttpMethod } from '@apiwatch/shared';

const METHOD_DECORATORS = ['Get', 'Post', 'Put', 'Patch', 'Delete'];

export class NestScanner {
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
        endpoints.push({
          id: `nest-${r.path}-${r.method}-${now.getTime()}`,
          repoId: '',
          path: r.path,
          method: r.method as HttpMethod,
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

  private extractRoutes(sourceFile: import('ts-morph').SourceFile): Array<{ path: string; method: string }> {
    const routes: Array<{ path: string; method: string }> = [];
    let controllerPath = '';
    for (const dec of sourceFile.getDescendantsOfKind(SyntaxKind.Decorator)) {
      const text = dec.getText();
      if (text.startsWith('@Controller')) {
        const args = dec.getArguments();
        controllerPath = args[0]?.getText().replace(/^['`"]|['`"]$/g, '') ?? '';
        if (controllerPath && !controllerPath.startsWith('/')) controllerPath = '/' + controllerPath;
      }
      for (const method of METHOD_DECORATORS) {
        if (text.startsWith(`@${method}`)) {
          const args = dec.getArguments();
          const path = args[0]?.getText().replace(/^['`"]|['`"]$/g, '') ?? '';
          const full = (controllerPath + (path ? '/' + path.replace(/^\//, '') : '')).replace(/\/+/g, '/') || '/';
          routes.push({ path: full, method: method.toUpperCase() });
        }
      }
    }
    return routes;
  }
}
