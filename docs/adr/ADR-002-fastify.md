# ADR-002: Fastify over Express

## Status

Accepted (2025-06-18)

## Context

The core server needs to handle high throughput (graph queries, usage events, notifications) with low latency and good TypeScript support.

## Decision

Use **Fastify v4** as the HTTP server framework instead of Express.

## Consequences

- Better performance out of the box (schema-based serialization, async by default).
- First-class TypeScript and JSON Schema validation (Zod can be integrated).
- Plugin architecture aligns with our registry, graph, and notification modules.
- Ecosystem (rate-limit, helmet, etc.) is sufficient for our needs.
