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

  extractQueryParams(sourceFile: SourceFile, _handlerName?: string): ApiParam[] {
    const params: ApiParam[] = [];
    const text = sourceFile.getText();
    const queryMatch = text.match(/Request\s*<\s*[^,]*,\s*([^>]+)\s*>/);
    if (queryMatch) {
      const queryType = queryMatch[1];
      if (queryType.includes('{') && queryType.includes('}')) {
        const names = queryType.match(/\b(\w+)\s*:/g)?.map((s) => s.replace(/\s*:$/, '')) ?? [];
        for (const name of names) params.push({ name, in: 'query', required: true, schema: { type: 'string' } });
      }
    }
    return params;
  }

  extractBodySchema(sourceFile: SourceFile, _handlerName?: string): JsonSchema | undefined {
    const text = sourceFile.getText();
    if (text.includes('RequestBody') || text.includes('body:')) return { type: 'object' };
    const bodyMatch = text.match(/Request\s*<\s*[^,]*,\s*[^,]*,\s*([^>]+)\s*>/);
    if (bodyMatch && !bodyMatch[1].trim().match(/^(void|undefined|null)$/i)) return { type: 'object' };
    return undefined;
  }

  extractResponseSchema(sourceFile: SourceFile, _handlerName?: string): Record<string, JsonSchema> {
    const text = sourceFile.getText();
    const out: Record<string, JsonSchema> = {};
    if (text.includes('Promise<') && text.match(/Promise\s*<\s*(\w+)\s*>/)) out['200'] = { type: 'object' };
    if (text.includes('res.json') || text.includes('reply.send')) out['200'] = { type: 'object' };
    if (text.includes('@ApiResponse')) out['200'] = { type: 'object' };
    if (Object.keys(out).length === 0) out['200'] = { type: 'object' };
    return out;
  }

  isRequired(param: { name: string; schema?: JsonSchema; optional?: boolean; default?: unknown }): boolean {
    if (param.optional === true) return false;
    if (param.default !== undefined) return false;
    const schema = param.schema;
    if (schema && typeof schema === 'object' && 'required' in schema && Array.isArray((schema as { required?: string[] }).required))
      return ((schema as { required: string[] }).required).includes(param.name);
    return true;
  }

  classifyOptional(params: ApiParam[], sourceText: string): ApiParam[] {
    return params.map((p) => {
      const optional = /[?]|@IsOptional|optional\s*:\s*true/.test(sourceText) || p.name.includes('?');
      return { ...p, required: !optional && this.isRequired(p) };
    });
  }
}
