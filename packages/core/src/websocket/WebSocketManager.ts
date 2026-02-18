/**
 * WebSocket manager: graph:nodeUpdated, graph:edgeAdded, notification:critical, dashboard:refresh.
 */

export interface WsClient {
  id: string;
  send(payload: unknown): void;
}

const wsClients = new Map<string, WsClient>();

export function registerClient(id: string, client: WsClient): void {
  wsClients.set(id, client);
}

export function unregisterClient(id: string): void {
  wsClients.delete(id);
}

export function broadcast(event: string, data: unknown): void {
  const payload = JSON.stringify({ event, data });
  for (const client of wsClients.values()) {
    try {
      client.send(payload);
    } catch {
      // ignore
    }
  }
}
