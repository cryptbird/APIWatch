/**
 * Resolve target URL to targetApiId via prefix matching against registered endpoints.
 */

import type { ApiEndpoint } from '@apiwatch/shared';

/**
 * Normalize a full URL to a path (pathname only) for matching.
 */
export function urlToPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname;
  } catch {
    return url;
  }
}

/**
 * Resolve targetUrl to an endpoint id by matching path against registered endpoints.
 * Uses longest prefix match: /api/users/1 matches /api/users/:id before /api/users.
 */
export function resolveTargetApiId(
  targetUrl: string,
  endpoints: ApiEndpoint[]
): string | undefined {
  const path = urlToPath(targetUrl);
  let best: ApiEndpoint | undefined;
  let bestLen = 0;
  for (const ep of endpoints) {
    const epPath = ep.path.replace(/:\w+/g, '[^/]+');
    const re = new RegExp(`^${epPath}(?:/|$)`);
    if (re.test(path) && ep.path.length > bestLen) {
      best = ep;
      bestLen = ep.path.length;
    }
  }
  return best?.id;
}
