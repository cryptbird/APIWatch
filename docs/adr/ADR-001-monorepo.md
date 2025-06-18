# ADR-001: Monorepo with pnpm

## Status

Accepted (2025-06-18)

## Context

APIWatch consists of multiple packages (core, plugin, cli, dashboard, shared) that share types and need to be versioned and built together.

## Decision

Use a **pnpm workspace** monorepo with all packages under `packages/*`. Use **Turborepo** for task orchestration (build, test, lint) with dependency-aware caching.

## Consequences

- Single `pnpm install` at root installs all dependencies.
- Shared code lives in `@apiwatch/shared`; other packages depend on it via `workspace:*`.
- Turborepo caches build/test outputs and skips unchanged packages.
- We use pnpm for strict dependency resolution and disk efficiency.
