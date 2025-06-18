# ADR-004: Plugin architecture for client repos

## Status

Accepted (2025-06-18)

## Context

Teams need to install APIWatch in many repos (Express, Fastify, Nest, etc.) without forking the main repo. Scanners and interceptors must run inside the client's build/runtime.

## Decision

Ship a single **npm-installable plugin** (`@apiwatch/plugin`) that:

- Is configured via `apiwatch.config.ts` in the client repo.
- Provides scanners (Express, Fastify, Nest, OpenAPI, GraphQL, gRPC) that run at scan time.
- Provides interceptors (axios, fetch) that run at runtime to record outbound calls.
- Reports discovered APIs and usage to the core server via REST.

The **CLI** (`npx apiwatch`) invokes the plugin for `init`, `scan`, `status`, and `diff`.

## Consequences

- One package to install in client repos; framework is auto-detected or configured.
- Scanners use ts-morph/acorn for AST parsing; no runtime framework coupling.
- Interceptors are optional (trackOutbound) and can be disabled for privacy.
