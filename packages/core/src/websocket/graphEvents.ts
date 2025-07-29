/**
 * Emit graph:updated event (Redis pub) when edges/nodes are added or removed.
 * Payload: { addedNodes, removedNodes, addedEdges, removedEdges }.
 * Dashboard or WS gateway can subscribe to channel and push to clients.
 */

import { getPublisher, publish } from '../cache/pubsub.js';

const CHANNEL = 'graph:updated';

export interface GraphUpdatedPayload {
  addedNodes: string[];
  removedNodes: string[];
  addedEdges: Array<{ source: string; target: string }>;
  removedEdges: Array<{ source: string; target: string }>;
}

export async function emitGraphUpdated(
  redisUrl: string,
  payload: GraphUpdatedPayload
): Promise<void> {
  try {
    getPublisher(redisUrl);
    await publish(CHANNEL, JSON.stringify(payload));
  } catch {
    // Pub/sub may not be initialized
  }
}
