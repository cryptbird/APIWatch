import { describe, it, expect } from 'vitest';
import { generateMigrationGuide } from './migrationGuide.js';
import type { SchemaDiff } from '@apiwatch/shared';

function diff(breaking: Array<{ type: SchemaDiff['breakingChanges'][0]['type']; description: string }>): SchemaDiff {
  return {
    apiEndpointId: 'ep1',
    fromVersion: 1,
    toVersion: 2,
    changes: breaking.map((b) => ({ ...b, path: '', before: undefined, after: undefined })),
    breakingChanges: breaking.map((b) => ({ ...b, path: '', before: undefined, after: undefined })),
    nonBreakingChanges: [],
    timestamp: new Date(),
  };
}

describe('migrationGuide', () => {
  it('generates markdown with PARAM_REQUIRED_ADDED hint', () => {
    const d = diff([{ type: 'PARAM_REQUIRED_ADDED', description: 'Required param orgId added.' }]);
    d.breakingChanges[0] = { ...d.breakingChanges[0]!, after: {} };
    const md = generateMigrationGuide(d);
    expect(md).toContain('Migration Guide');
    expect(md).toContain('PARAM_REQUIRED_ADDED');
    expect(md).toContain('Add the new required parameter');
  });
});
