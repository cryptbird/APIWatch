/**
 * WebSocket event names and payload types.
 */

export const WS_EVENTS = {
  GRAPH_NODE_UPDATED: 'graph:nodeUpdated',
  GRAPH_EDGE_ADDED: 'graph:edgeAdded',
  NOTIFICATION_CRITICAL: 'notification:critical',
  DASHBOARD_REFRESH: 'dashboard:refresh',
} as const;
