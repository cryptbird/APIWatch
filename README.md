# APIWatch

[![Build](https://github.com/your-org/apiwatch/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/apiwatch/actions)
[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](./LICENSE)

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
