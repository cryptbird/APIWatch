/**
 * SchemaDiff: diff(before, after) -> SchemaDiff. Detects param/response/method/path changes.
 */

import type { ApiEndpoint, JsonSchema } from '@apiwatch/shared';
import type { SchemaDiff, SchemaChange, ChangeType } from '@apiwatch/shared';
import { jsonSchemaEqual, jsonSchemaChanged } from './schemaComparator.js';

function change(
  type: ChangeType,
  path: string,
  before: unknown,
  after: unknown,
  description: string
): SchemaChange {
  return { type, path, before, after, description };
}

/**
 * Deep compare two ApiEndpoint snapshots and return structured SchemaDiff.
 */
export function diff(
  before: ApiEndpoint,
  after: ApiEndpoint,
  apiEndpointId: string,
  fromVersion: number,
  toVersion: number
): SchemaDiff {
  const changes: SchemaChange[] = [];

  if (before.method !== after.method) {
    changes.push(
      change(
        'METHOD_CHANGED',
        'method',
        before.method,
        after.method,
        `HTTP method changed from ${before.method} to ${after.method}`
      )
    );
  }
  if (before.path !== after.path) {
    changes.push(
      change('PATH_CHANGED', 'path', before.path, after.path, `Path changed from ${before.path} to ${after.path}`)
    );
  }

  const beforeParams = new Map(before.params.map((p) => [p.name, p]));
  const afterParams = new Map(after.params.map((p) => [p.name, p]));
  for (const [name, pAfter] of afterParams) {
    const pBefore = beforeParams.get(name);
    if (!pBefore) {
      changes.push(
        change(
          pAfter.required ? 'PARAM_REQUIRED_ADDED' : 'PARAM_OPTIONAL_ADDED',
          `params.${name}`,
          undefined,
          pAfter,
          `${pAfter.required ? 'Required' : 'Optional'} parameter ${name} added`
        )
      );
      continue;
    }
    const { typeChanged, narrowed } = jsonSchemaChanged(pBefore.schema, pAfter.schema);
    if (pBefore.required !== pAfter.required) {
      changes.push(
        change(
          'PARAM_TYPE_CHANGED',
          `params.${name}.required`,
          pBefore.required,
          pAfter.required,
          `Parameter ${name} required flag changed`
        )
      );
    }
    if (typeChanged || narrowed) {
      changes.push(
        change(
          'PARAM_TYPE_CHANGED',
          `params.${name}.schema`,
          pBefore.schema,
          pAfter.schema,
          `Parameter ${name} type or schema changed`
        )
      );
    }
  }
  for (const [name] of beforeParams) {
    if (!afterParams.has(name)) {
      const pBefore = beforeParams.get(name)!;
      changes.push(
        change(
          'PARAM_REMOVED',
          `params.${name}`,
          pBefore,
          undefined,
          `Parameter ${name} removed${pBefore.required ? ' (was required)' : ''}`
        )
      );
    }
  }

  const reqBodyChanged = !jsonSchemaEqual(before.requestBody, after.requestBody);
  if (reqBodyChanged && (before.requestBody || after.requestBody)) {
    changes.push(
      change('PARAM_TYPE_CHANGED', 'requestBody', before.requestBody, after.requestBody, 'Request body schema changed')
    );
  }

  const beforeResp = before.responses ?? {};
  const afterResp = after.responses ?? {};
  const statuses = new Set([...Object.keys(beforeResp), ...Object.keys(afterResp)]);
  for (const status of statuses) {
    const b = beforeResp[status] as JsonSchema | undefined;
    const a = afterResp[status] as JsonSchema | undefined;
    if (!a && b) {
      changes.push(change('RESPONSE_SCHEMA_EXTENDED', `responses.${status}`, b, undefined, `Response ${status} removed`));
    } else if (a && !b) {
      changes.push(change('RESPONSE_SCHEMA_EXTENDED', `responses.${status}`, undefined, a, `Response ${status} added`));
    } else if (a && b && !jsonSchemaEqual(b, a)) {
      changes.push(
        change('RESPONSE_SCHEMA_EXTENDED', `responses.${status}`, b, a, `Response ${status} schema changed`)
      );
    }
  }

  if ((before.deprecated !== after.deprecated) && after.deprecated) {
    changes.push(change('DEPRECATION_ADDED', 'deprecated', before.deprecated, after.deprecated, 'Endpoint marked deprecated'));
  }

  const breakingChanges = changes.filter(
    (c) =>
      c.type === 'PARAM_REQUIRED_ADDED' ||
      c.type === 'PARAM_REMOVED' ||
      c.type === 'PARAM_TYPE_CHANGED' ||
      c.type === 'METHOD_CHANGED' ||
      c.type === 'PATH_CHANGED' ||
      c.type === 'ENDPOINT_REMOVED' ||
      c.type === 'AUTH_SCHEME_CHANGED'
  );
  const nonBreakingChanges = changes.filter((c) => !breakingChanges.includes(c));

  return {
    apiEndpointId,
    fromVersion,
    toVersion,
    changes,
    breakingChanges,
    nonBreakingChanges,
    timestamp: new Date(),
  };
}
