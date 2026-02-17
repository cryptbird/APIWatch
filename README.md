# APIWatch
01001000 01100101 01101100 01101100 01101111 00100000 01010100 01100001 01101110 01101101 01100001 01111001 00100001 00100000 01000100 01010101 01000100 01010101 00100000 01000001 01010011 01010011 01000101 01001101 01000010 01001100 01000101 01000100

# APIWatch

Enterprise-grade API Dependency Management Framework.

## Problem

In large organizations, hundreds of teams build thousands of APIs daily. When Team A changes a required parameter and forgets to notify Team B (who depends on it), systems crash and days are wasted. APIWatch eliminates this by:

1. **Plugin** in every repo → auto-scans and registers APIs to a central registry
2. **Dependency graph** → who calls what, how often, from where
3. **Change detection** → schema changes classified as LOW / NEUTRAL / CRITICAL
4. **Notifications** → Slack, email, Teams, in-app alerts to affected teams
5. **Dashboard** → force-graph visualization, KPI analytics, usage trends

## Monorepo structure

- `packages/core` — Fastify server, registry, graph engine, notifications
- `packages/plugin` — npm plugin for client repos (scanners, interceptors, reporter)
- `packages/cli` — `npx apiwatch` (init, scan, status, diff)
- `packages/dashboard` — React SPA (graph viz, KPIs, notifications)
- `packages/shared` — shared types and utilities

## Quick start

```bash
pnpm install
docker-compose up -d   # Postgres + Redis
pnpm dev
```

## License

Proprietary.
