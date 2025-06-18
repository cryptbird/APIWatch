# ADR-003: Drizzle ORM

## Status

Accepted (2025-06-18)

## Context

We need a TypeScript-first ORM for PostgreSQL with type-safe queries, migrations, and no raw SQL in application code.

## Decision

Use **Drizzle ORM** for all database access. No raw SQL strings in the codebase.

## Consequences

- Schema defined in TypeScript (`schema.ts`) with full type inference.
- Migrations generated or hand-written in SQL; applied via drizzle-kit or custom runner.
- Query builder and relations keep code readable and refactor-safe.
- Aligns with "zero raw SQL" rule and strict TypeScript.
