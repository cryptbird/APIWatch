/**
 * Generate markdown migration guide for breaking changes.
 */

import type { SchemaDiff, SchemaChange } from '@apiwatch/shared';

export function generateMigrationGuide(diff: SchemaDiff): string {
  const lines: string[] = ['# Migration Guide', '', `API ${diff.apiEndpointId} changed (v${diff.fromVersion} → v${diff.toVersion}).`, ''];
  for (const c of diff.breakingChanges) {
    lines.push('## ' + c.type, '', c.description, '');
    if (c.type === 'PARAM_REQUIRED_ADDED' && c.after) {
      lines.push('**Action:** Add the new required parameter to your requests.', '');
    }
    if (c.type === 'PARAM_REMOVED') {
      lines.push('**Action:** Stop sending this parameter; it may be ignored or cause errors.', '');
    }
    if (c.type === 'METHOD_CHANGED') {
      lines.push('**Action:** Update your HTTP method in all call sites.', '');
    }
    if (c.type === 'PATH_CHANGED') {
      lines.push('**Action:** Update the request URL path in all call sites.', '');
    }
    if (c.type === 'ENDPOINT_REMOVED') {
      lines.push('**Action:** Find the replacement endpoint or remove this integration.', '');
    }
  }
  return lines.join('\n');
}
