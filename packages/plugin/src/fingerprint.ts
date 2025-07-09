/**
 * Endpoint fingerprint: SHA-256 of (repoId + method + path + sorted-param-names).
 * Changes only when API contract changes (not description/docs). Used for breaking vs non-breaking detection.
 */

import { createHash } from 'node:crypto';
import type { ApiEndpoint } from '@apiwatch/shared';

export function fingerprint(ep: ApiEndpoint): string {
  const paramNames = ep.params.map((p) => p.name).sort();
  const payload = [ep.repoId, ep.method, ep.path, ...paramNames].join('\0');
  return createHash('sha256').update(payload, 'utf8').digest('hex');
}

export function fingerprintFromParts(
  repoId: string,
  method: string,
  path: string,
  paramNames: string[]
): string {
  const sorted = [...paramNames].sort();
  const payload = [repoId, method, path, ...sorted].join('\0');
  return createHash('sha256').update(payload, 'utf8').digest('hex');
}
