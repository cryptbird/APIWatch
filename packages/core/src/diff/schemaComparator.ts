/**
 * Deep compare JSON Schema: type, format, enum, pattern, min/max.
 */

import type { JsonSchema } from '@apiwatch/shared';

export function jsonSchemaEqual(a: JsonSchema | undefined, b: JsonSchema | undefined): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.type !== b.type) return false;
  if (a.format !== b.format) return false;
  const enumA = JSON.stringify(a.enum ?? []);
  const enumB = JSON.stringify(b.enum ?? []);
  if (enumA !== enumB) return false;
  if (a.pattern !== b.pattern) return false;
  if (a.minimum !== b.minimum || a.maximum !== b.maximum) return false;
  if (a.minLength !== b.minLength || a.maxLength !== b.maxLength) return false;
  if (a.required !== undefined && b.required !== undefined) {
    const ra = JSON.stringify((a.required as string[]).slice().sort());
    const rb = JSON.stringify((b.required as string[]).slice().sort());
    if (ra !== rb) return false;
  }
  return true;
}

export function jsonSchemaChanged(
  before: JsonSchema | undefined,
  after: JsonSchema | undefined
): { typeChanged: boolean; narrowed: boolean } {
  if (before == null && after == null) return { typeChanged: false, narrowed: false };
  if (before == null || after == null) return { typeChanged: true, narrowed: false };
  if (before.type !== after.type) return { typeChanged: true, narrowed: false };
  if (after.enum && (!before.enum || before.enum.length < after.enum.length))
    return { typeChanged: false, narrowed: true };
  if (after.enum && before.enum && JSON.stringify(before.enum) !== JSON.stringify(after.enum))
    return { typeChanged: true, narrowed: false };
  return { typeChanged: !jsonSchemaEqual(before, after), narrowed: false };
}
