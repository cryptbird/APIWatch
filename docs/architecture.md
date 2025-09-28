# Architecture

## Overview

APIWatch consists of:

- **Core server:** Fastify app that stores APIs, dependency graph, snapshots, change events, and notifications. It exposes REST and SSE for the dashboard and plugin.
- **Plugin:** Runs inside your API process; discovers routes (Express/Fastify/Nest/GraphQL/gRPC), syncs them to the server, and records usage events.
- **Dashboard:** React SPA for graph view, API detail, notifications, and analytics.

## Data Flow

1. Plugin scans routes and sends them to the server (registry).
2. Plugin intercepts outbound HTTP (and optionally gRPC) and sends usage events to `POST /api/usage/record`.
3. Server builds a dependency graph (BFS, centrality, cycles) and caches it (Redis).
4. When schema changes are detected (snapshot diff), the server classifies threat (LOW/NEUTRAL/CRITICAL), emits change events, and fans out notifications (in-app, email, Slack, Teams).
5. Dashboard consumes graph, changes, and notifications via REST and SSE.

## Key Components

- **GraphService:** Loads apis + dependency_edges, builds DependencyGraph, computes centrality and critical path.
- **SnapshotService / ChangeService:** Capture schema versions, diff, store change events.
- **NotificationService:** Fan-out to channels; deduplication and quiet hours.
- **AggregationJob:** Hourly rollup of usage_events into api_hourly_stats; prunes raw events after 7 days.
- **HealthScoreCalculator / StabilityAnalyzer / SlaMonitor:** Analytics and SLA breach detection.
