/**
 * Extract param types from route handler AST (ts-morph FunctionDeclaration).
 * Request generic args, optional vs required, path/query/body/header.
 */

import type { SourceFile } from 'ts-morph';
import type { ApiParam, JsonSchema } from '@apiwatch/shared';

export class ParamExtractor {
  extractFromHandler(_sourceFile: SourceFile, _handlerName?: string): ApiParam[] {
    return [];
  }

  extractQueryParams(_sourceFile: SourceFile, _handlerName?: string): ApiParam[] {
    return [];
  }

  extractBodySchema(_sourceFile: SourceFile, _handlerName?: string): JsonSchema | undefined {
    return undefined;
  }

  extractResponseSchema(_sourceFile: SourceFile, _handlerName?: string): Record<string, JsonSchema> {
    return {};
  }

  isRequired(_param: { name: string; schema?: JsonSchema }): boolean {
    return true;
  }
}
