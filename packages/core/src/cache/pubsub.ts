/**
 * Redis Pub/Sub manager for real-time events.
 */

import Redis from 'ioredis';

let subscriber: Redis | null = null;
let publisher: Redis | null = null;

export function getSubscriber(redisUrl: string): Redis {
  if (subscriber !== null) {
    return subscriber;
  }
  subscriber = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
  });
  return subscriber;
}

export function getPublisher(redisUrl: string): Redis {
  if (publisher !== null) {
    return publisher;
  }
  publisher = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
  });
  return publisher;
}

export async function publish(channel: string, message: string): Promise<number> {
  if (publisher === null) {
    throw new Error('Publisher not initialized');
  }
  return publisher.publish(channel, message);
}

export async function subscribe(
  channel: string,
  onMessage: (message: string) => void
): Promise<void> {
  if (subscriber === null) {
    throw new Error('Subscriber not initialized');
  }
  await subscriber.subscribe(channel);
  subscriber.on('message', (ch, message) => {
    if (ch === channel) {
      onMessage(message);
    }
  });
}

export async function closePubSub(): Promise<void> {
  if (subscriber !== null) {
    await subscriber.quit();
    subscriber = null;
  }
  if (publisher !== null) {
    await publisher.quit();
    publisher = null;
  }
}
