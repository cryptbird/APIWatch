/**
 * API key hashing and validation. Store hashed keys in DB.
 */

import { createHash, timingSafeEqual } from 'node:crypto';

const SALT = process.env.API_KEY_SALT ?? 'apiwatch-default-salt';

export function hashApiKey(plain: string): string {
  return createHash('sha256').update(SALT + plain).digest('hex');
}

export function verifyApiKey(plain: string, hashed: string): boolean {
  const h = hashApiKey(plain);
  if (h.length !== hashed.length) return false;
  try {
    return timingSafeEqual(Buffer.from(h), Buffer.from(hashed));
  } catch {
    return false;
  }
}
