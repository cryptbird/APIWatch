/**
 * Normalize path segments: Express :id and OpenAPI {id} both map to {id}.
 * Optional path segments :id?, trailing slashes normalized.
 */

export function normalizePath(path: string): string {
  let p = path.trim();
  if (!p.startsWith('/')) p = '/' + p;
  p = p.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  p = p.replace(/:(\w+)\??/g, '{$1}');
  return p;
}

export function mergeDuplicatePathMethod(path: string, method: string): string {
  return `${method}:${normalizePath(path)}`;
}
