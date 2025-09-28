# Changelog

All notable changes to APIWatch are documented here.

## [1.0.0] - 2025-09-28

### Added

- **Core server:** Fastify API with health check, registry, usage recording, graph engine (BFS, centrality, cycles, critical path), snapshots, change detection (SchemaDiff, ThreatClassifier), notifications (in-app, email, Slack, Teams), SSE stream, maintenance windows, analytics endpoints.
- **Plugin:** Express, Fastify, Nest, GraphQL, gRPC scanners; Axios/Fetch interceptors; reporter to sync routes and record usage.
- **Dashboard:** React app with login, org selector, sidebar, force-directed graph (react-force-graph-2d), API detail (overview, dependencies, change timeline), notifications center, KPI widgets, dark theme.
- **Analytics:** Hourly aggregation job (api_hourly_stats), frequency analyzer, health score calculator, stability index, SLA monitor, REST endpoints for usage, health-history, stability, org summary, top-apis, change-velocity.
- **Deployment:** Dockerfile for server and plugin, Helm chart (Deployment, Service, HPA, PDB).
- **Documentation:** Getting started, plugin installation, architecture.

### Security

- API key hashing; JWT and env validation via Zod.

[1.0.0]: https://github.com/your-org/apiwatch/releases/tag/v1.0.0
