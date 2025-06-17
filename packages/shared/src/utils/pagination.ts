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
  return {
    items,
    total,
    page,
    pageSize,
    hasMore,
    cursor,
  };
}
