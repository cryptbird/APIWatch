/**
 * Generate 1-2 sentence plain English description of a diff.
 */

import type { SchemaDiff } from '@apiwatch/shared';

export function generateSummary(diff: SchemaDiff, affectedCount?: number): string {
  const parts: string[] = [];
  for (const c of diff.changes.slice(0, 3)) {
    parts.push(c.description);
  }
  const summary = parts.join('. ');
  if (affectedCount !== undefined && affectedCount > 0) {
    return `${summary} This will affect ${affectedCount} dependent API(s).`;
  }
  return summary;
}
