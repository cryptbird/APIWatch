# ADR-005: Graph storage and computation strategy

## Status

Accepted (2025-06-18)

## Context

The dependency graph can grow to millions of edges. We need to serve full-graph and subgraph queries, detect cycles, and compute centrality/critical path without blocking the API.

## Decision

- **Storage:** Persist edges and aggregates in PostgreSQL (`dependency_edges`, `usage_events`). Keep a **materialized in-memory graph** in the core server (loaded on startup, updated incrementally on new usage events).
- **Computation:** Run Tarjan SCC and centrality (PageRank-style) in-process. Background job (e.g. every 1 hour) recomputes centrality and critical path; results cached in Redis (5 min TTL).
- **APIs:** Full graph and team subgraphs are paginated (cursor-based). Dependents/dependencies for a single API are served from the in-memory graph.

## Consequences

- Single server can hold the full graph in RAM for fast traversal; for very large orgs we may later shard by team.
- Redis reduces DB load for hot paths (e.g. `/api/graph/stats`).
- Cycle detection and centrality are eventually consistent with the latest usage data.
