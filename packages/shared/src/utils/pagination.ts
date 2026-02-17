/**
 * Pagination and API response types.
 */

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  cursor?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  requestId?: string;
}

export function createPaginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
  cursor?: string
): Paginated<T> {
  const hasMore = page * pageSize < total;
  const result: Paginated<T> = {
    items,
    total,
    page,
    pageSize,
    hasMore,
  };
  if (cursor !== undefined) {
    result.cursor = cursor;
  }
  return result;
}
