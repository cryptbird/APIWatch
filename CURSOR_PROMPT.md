# APIWatch — Cursor AI Development Prompt
> Paste the contents of this file into Cursor's **Rules for AI** (`.cursor/rules/apiwatch.mdc`) or as your **System Prompt** in Cursor Settings.

---

## 🧠 Project Identity

You are building **APIWatch** — an enterprise-grade API Dependency Management Framework.

**Problem it solves:** In large MNCs, hundreds of teams build thousands of APIs daily. When Team A changes a required parameter in their API and forgets to notify Team B (who depends on it), systems crash, tickets are raised, meetings are scheduled — 2–3 days wasted on something that should be instant. APIWatch eliminates this entirely.

**Core capabilities:**
1. Plugin installed in every repo → auto-scans and registers APIs into a central registry
2. Builds a live dependency graph: who calls what, how often, from where
3. Detects schema changes and classifies them as `LOW / NEUTRAL / CRITICAL` threat
4. Notifies all dependent teams instantly via Slack, email, Teams, or in-app
5. Provides a rich dashboard with force-graph visualization, KPI analytics, usage trends

---

## 🏗️ Tech Stack (Non-negotiable)

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Language | TypeScript 5.x (strict mode everywhere) |
| Core/Server | Node.js + Fastify v4 |
| ORM | Drizzle ORM |
| Database | PostgreSQL 15 |
| Cache / Pub-Sub | Redis 7 |
| Plugin Scanner | chokidar + ts-morph + acorn |
| Schema Diff | Custom SchemaDiff engine |
| Auth | JWT + API keys |
| Dashboard | React 18 + Vite 5 + TailwindCSS v3 |
| Graph Viz | react-force-graph-2d |
| Charts | Recharts |
| Notifications | Nodemailer + Slack Bolt + Teams Webhooks |
| Testing | Vitest (unit) + Supertest (integration) + Playwright (e2e) |
| CI/CD | GitHub Actions |
| Containerization | Docker + Docker Compose |
| Deployment | Kubernetes + Helm |
| Docs | Typedoc + Starlight (Astro) |

---

## 📁 Monorepo Structure

```
apiwatch/
├── .cursor/
│   └── rules/
│       └── apiwatch.mdc          ← this file lives here
├── packages/
│   ├── core/                     ← Fastify server, registry, graph engine
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── registry/
│   │   │   │   ├── ApiRegistry.ts
│   │   │   │   └── registry.routes.ts
│   │   │   ├── graph/
│   │   │   │   ├── DependencyGraph.ts
│   │   │   │   └── graph.routes.ts
│   │   │   ├── diff/
│   │   │   │   ├── SchemaDiff.ts
│   │   │   │   └── ThreatClassifier.ts
│   │   │   ├── notifications/
│   │   │   │   ├── NotificationService.ts
│   │   │   │   ├── channels/
│   │   │   │   │   ├── EmailChannel.ts
│   │   │   │   │   ├── SlackChannel.ts
│   │   │   │   │   └── TeamsChannel.ts
│   │   │   ├── analytics/
│   │   │   │   ├── UsageTracker.ts
│   │   │   │   └── analytics.routes.ts
│   │   │   ├── db/
│   │   │   │   ├── schema.ts
│   │   │   │   └── migrations/
│   │   │   └── config.ts
│   │   └── package.json
│   ├── plugin/                   ← npm installable plugin for client repos
│   │   ├── src/
│   │   │   ├── index.ts          ← plugin entry point
│   │   │   ├── installer.ts      ← hooks into repo build lifecycle
│   │   │   ├── scanners/
│   │   │   │   ├── ExpressScanner.ts
│   │   │   │   ├── FastifyScanner.ts
│   │   │   │   ├── NestScanner.ts
│   │   │   │   └── OpenApiScanner.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── AxiosInterceptor.ts
│   │   │   │   └── FetchInterceptor.ts
│   │   │   └── reporter.ts       ← sends discovered apis to core server
│   │   └── package.json
│   ├── cli/                      ← `npx apiwatch` CLI tool
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── commands/
│   │   │   │   ├── init.ts
│   │   │   │   ├── scan.ts
│   │   │   │   ├── status.ts
│   │   │   │   └── diff.ts
│   │   └── package.json
│   ├── dashboard/                ← React SPA
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── ApiDetail.tsx
│   │   │   │   ├── Graph.tsx
│   │   │   │   ├── Notifications.tsx
│   │   │   │   └── TeamView.tsx
│   │   │   ├── components/
│   │   │   │   ├── ForceGraph.tsx
│   │   │   │   ├── ThreatBadge.tsx
│   │   │   │   ├── ChangeFeed.tsx
│   │   │   │   └── KpiWidget.tsx
│   │   │   └── api/
│   │   │       └── client.ts
│   │   └── package.json
│   └── shared/                   ← shared types and utilities
│       ├── src/
│       │   ├── types/
│       │   │   ├── api.types.ts
│       │   │   ├── graph.types.ts
│       │   │   ├── diff.types.ts
│       │   │   └── notification.types.ts
│       │   └── utils/
│       └── package.json
├── docker-compose.yml
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## 🔧 Development Rules (ALWAYS Follow)

### Code Quality
- **NEVER** use `any` type. Use `unknown` with type guards or define proper interfaces.
- Every function must have explicit return types.
- Use **Zod** for all runtime validation (API inputs, config files, env vars).
- Prefer `const` over `let`. Never use `var`.
- All async functions must have `try/catch` or propagate errors explicitly.
- Use **Result types** (discriminated unions) for error handling — not raw throws in service layer.
- All database queries go through Drizzle ORM — no raw SQL strings.
- Every module must have a barrel export (`index.ts`).

### File Conventions
- One class or major function concept per file.
- Filename = PascalCase for classes, camelCase for utilities.
- All imports use path aliases: `@apiwatch/core`, `@apiwatch/shared`, etc.
- Environment variables must be validated at startup via `env.ts` using Zod.

### Testing Rules
- Write unit tests **alongside** every new file (`*.test.ts` in same folder).
- Minimum coverage for service/engine files: 80%.
- Integration tests live in `packages/core/tests/integration/`.
- Mock external services (Slack, email, DB) in unit tests.

### Git Rules (CRITICAL — Read the `git_commits.json` file)
- After completing each step defined in `git_commits.json`, run **exactly** the git command provided.
- The git commands include precise `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` timestamps — use them verbatim.
- Stage all changes before running the commit: `git add -A && <git_command_from_json>`
- Never squash or reorder commits.
- Push to GitHub after every 5–7 commits: `git push origin main`

---

## 📋 Development Phases — Step-by-Step Instructions

### ═══ PHASE 1: Bootstrap & Setup (Jun 17–30) ═══

**Goal:** Working monorepo skeleton with all tooling configured.

#### Step 1.1 — Monorepo Initialization
```bash
mkdir apiwatch && cd apiwatch
git init
pnpm init
```
Create `pnpm-workspace.yaml`:
```yaml
packages:
  - 'packages/*'
```
Create `turbo.json` with build, test, lint pipeline definitions.
Create root `package.json` with scripts: `dev`, `build`, `test`, `lint`.
➤ **Commit:** `initial commit: project scaffold for apiwatch framework`

#### Step 1.2 — TypeScript Configuration
Create `tsconfig.base.json` at root with:
- `"strict": true`
- `"exactOptionalPropertyTypes": true`
- `"noUncheckedIndexedAccess": true`
- Path aliases for all packages
Each package gets its own `tsconfig.json` extending the base.
➤ **Commit:** `add typescript config with strict mode and path aliases`

#### Step 1.3 — Linting & Formatting
Install and configure:
- ESLint with `@typescript-eslint` rules (error on `any`, enforce return types)
- Prettier with `.prettierrc` (single quotes, 2 spaces, trailing comma)
- `lint-staged` + `husky` for pre-commit hooks
➤ **Commit:** `configure eslint and prettier for consistent code style`

#### Step 1.4 — Shared Types Package
Create `packages/shared/src/types/`:
```typescript
// api.types.ts
export interface ApiEndpoint {
  id: string
  repoId: string
  path: string
  method: HttpMethod
  params: ApiParam[]
  requestBody?: JsonSchema
  responses: Record<string, JsonSchema>
  tags: string[]
  deprecated: boolean
  teamId: string
  squadId: string
  locationId: string
  createdAt: Date
  updatedAt: Date
}

export interface ApiParam {
  name: string
  in: 'query' | 'path' | 'header' | 'body'
  required: boolean
  schema: JsonSchema
  description?: string
}

export type ThreatLevel = 'LOW' | 'NEUTRAL' | 'CRITICAL'
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS'
```
Define all shared types: graph, diff, notification, analytics.
➤ **Commit:** `add ApiEndpoint and ApiSchema type definitions`

#### Step 1.5 — Database Schema
Create `packages/core/src/db/schema.ts` using Drizzle:
```typescript
// Tables: repos, apis, api_params, dependency_edges,
//         api_snapshots, change_events, notifications,
//         teams, subscribers, usage_events
```
Write first migration file.
Setup `packages/core/src/db/index.ts` with connection pool.
➤ **Commit:** `initial database migration: create apis table`

#### Step 1.6 — Docker & Environment
Create `docker-compose.yml` with:
- `postgres:15-alpine` with volume
- `redis:7-alpine`
- `apiwatch-server` service
Create `.env.example` with all required vars.
Create `packages/core/src/env.ts` validating all env vars with Zod at startup.
➤ **Commit:** `setup docker-compose for local development dependencies`

#### Step 1.7 — GitHub Actions CI
Create `.github/workflows/ci.yml`:
- Triggers on push and PR to main
- Jobs: lint → build → test → docker-build
- Cache pnpm store between runs
➤ **Commit:** `add basic CI pipeline with github actions`

---

### ═══ PHASE 2: Plugin Core & API Scanner (Jul 1–20) ═══

**Goal:** A working npm plugin that can be installed in any Node.js repo, scans all API routes, and registers them with the core server.

#### Step 2.1 — Plugin Entry Point
Create `packages/plugin/src/index.ts`:
```typescript
export interface ApiWatchConfig {
  serverUrl: string
  repoId: string
  apiKey: string
  scanPaths: string[]
  ignorePaths?: string[]
  framework: 'express' | 'fastify' | 'nest' | 'auto'
  trackOutbound: boolean
}

export async function initApiWatch(config: ApiWatchConfig): Promise<void>
export async function scanAndReport(): Promise<ScanResult>
```
➤ **Commit:** `scaffold core plugin package with basic entry point`

#### Step 2.2 — CLI: init command
Create `packages/cli/src/commands/init.ts`:
- Interactive prompt (inquirer) asking: server URL, repo name, framework, scan paths
- Generates `apiwatch.config.ts` in the target project
- Adds `postinstall` hook to `package.json`
- Installs the plugin automatically
```bash
npx apiwatch init
```
➤ **Commit:** `cli: add apiwatch init command for first time setup`

#### Step 2.3 — Express Route Scanner
Create `packages/plugin/src/scanners/ExpressScanner.ts`:
- Uses `ts-morph` to parse TypeScript AST
- Finds all `app.get()`, `app.post()`, `router.use()` etc.
- Extracts: path, method, middleware list, request type annotations
- Handles nested routers recursively
- Extracts JSDoc `@deprecated` markers
```typescript
export class ExpressScanner {
  async scan(rootDir: string): Promise<ApiEndpoint[]>
  private extractRoutes(sourceFile: SourceFile): RawRoute[]
  private resolveNestedRouters(route: RawRoute): RawRoute[]
  private extractParams(handler: FunctionDeclaration): ApiParam[]
}
```
➤ **Commit:** `add express route scanner: extracts path method and params`

#### Step 2.4 — OpenAPI Parser
Create `packages/plugin/src/scanners/OpenApiScanner.ts`:
- Accepts swagger 2.0 and openapi 3.0/3.1 JSON/YAML
- Converts to internal `ApiEndpoint[]` format
- Handles `$ref` resolution
- Uses `@apidevtools/swagger-parser` for validation
➤ **Commit:** `implement OpenAPI spec parser for existing api docs`

#### Step 2.5 — Fastify & NestJS Scanners
Create `FastifyScanner.ts`: parses fastify schema decorators and route registrations.
Create `NestScanner.ts`: parses `@Controller`, `@Get`, `@Post`, `@Body`, `@Param` decorators using ts-morph.
➤ **Commit:** `add fastify route scanner plugin`
➤ **Commit:** `add support for typescript decorator based routes (nestjs)`

#### Step 2.6 — Param Type Extractor
Create `packages/plugin/src/scanners/ParamExtractor.ts`:
- Given a handler function AST node, extract all parameters
- Resolve TypeScript generic types (e.g. `Request<{}, {}, CreateUserDto>`)
- Convert to `JsonSchema` using `typescript-json-schema`
- Classify each param as required vs optional
- Support path params, query params, headers, body
➤ **Commit:** `implement param type extraction from typescript generics`
➤ **Commit:** `handle optional vs required param classification`

#### Step 2.7 — Registry Sync
Create `packages/plugin/src/reporter.ts`:
```typescript
export class ApiReporter {
  async register(endpoints: ApiEndpoint[]): Promise<void>
  async heartbeat(): Promise<void>
  async deregister(endpointId: string): Promise<void>
}
```
- Batches API registrations (max 50 per request)
- Implements exponential backoff retry (3 attempts)
- Uses API key auth header
- Stores registered endpoint IDs in `.apiwatch-cache.json`
➤ **Commit:** `implement registry sync: push local apis to central server`

#### Step 2.8 — Core Registry Server Routes
In `packages/core/src/registry/`:
```
POST   /api/repos/register
POST   /api/endpoints/batch-upsert
GET    /api/endpoints/:repoId
DELETE /api/endpoints/:endpointId
GET    /api/endpoints/search?q=
```
All routes validated with Zod schemas. Store in Postgres via Drizzle.
➤ **Commit:** `add authentication token system for repo identification`

#### Step 2.9 — CLI: scan command
```bash
npx apiwatch scan [--dry-run] [--verbose]
```
- Runs all scanners
- Shows found endpoints in a beautiful table (cli-table3)
- Shows diff from last scan
- Asks confirmation before syncing (unless --yes flag)
➤ **Commit:** `cli: add apiwatch scan command to discover all apis`

#### Step 2.10 — File Watcher (Dev Mode)
Create `packages/plugin/src/watcher.ts`:
- Uses chokidar to watch route files
- On change: re-scan affected file only
- Debounce 2s to batch rapid changes
- Show desktop notification via `node-notifier`
➤ **Commit:** `implement file watcher using chokidar for route file changes`

---

### ═══ PHASE 3: Dependency Graph Engine (Jul 21–Aug 10) ═══

**Goal:** Build the live dependency graph — know exactly which API calls which, how often, and from where.

#### Step 3.1 — Graph Data Model
Create `packages/core/src/graph/DependencyGraph.ts`:
```typescript
export interface GraphNode {
  id: string              // apiEndpointId
  repoId: string
  teamId: string
  squadId: string
  locationId: string
  label: string           // e.g. "POST /users/create"
  inDegree: number
  outDegree: number
  centralityScore: number
  threatLevel: ThreatLevel
}

export interface GraphEdge {
  id: string
  sourceApiId: string     // the API making the call
  targetApiId: string     // the API being called
  callCount: number       // total historical calls
  lastCalledAt: Date
  avgLatencyMs: number
  errorRate: number
}

export class DependencyGraph {
  addNode(node: GraphNode): void
  addEdge(edge: GraphEdge): void
  getDependents(apiId: string): GraphNode[]
  getDependencies(apiId: string): GraphNode[]
  detectCycles(): string[][]            // Tarjan SCC
  getCriticalPath(): GraphNode[]
  computeCentrality(): void             // PageRank-style
  serialize(): SerializedGraph
  diff(other: DependencyGraph): GraphDiff
}
```
Add `dependency_edges` table to Drizzle schema.
➤ **Commit:** `design dependency graph data model with adjacency list`
➤ **Commit:** `implement DependencyGraph class with addNode and addEdge`

#### Step 3.2 — Outbound Call Interceptors
Create `packages/plugin/src/interceptors/AxiosInterceptor.ts`:
```typescript
// Installed via plugin init, wraps axios globally
axios.interceptors.request.use(trackOutboundCall)
axios.interceptors.response.use(recordResponse, recordError)

// Sends to core server:
// POST /api/usage/record
// { sourceApiId, targetUrl, method, statusCode, latencyMs, timestamp }
```
Create `FetchInterceptor.ts` — monkey-patches global `fetch`.
Resolve `targetUrl` to registered `ApiEndpoint.id` via URL matching.
➤ **Commit:** `implement API call interceptor for runtime dependency tracking`
➤ **Commit:** `add axios interceptor plugin for outgoing http call tracking`
➤ **Commit:** `add fetch wrapper for dependency tracking without axios`

#### Step 3.3 — Graph REST API
```
GET  /api/graph/full                    → full org graph (paginated)
GET  /api/graph/:apiId/dependents       → all APIs that call this one
GET  /api/graph/:apiId/dependencies     → all APIs this one calls
GET  /api/graph/:apiId/critical-path    → upstream critical path
GET  /api/graph/team/:teamId            → subgraph for team
GET  /api/graph/stats                   → node count, edge count, cycle count
GET  /api/graph/export?format=dot|csv   → export graph
```
Implement `GraphService.ts` with all business logic.
Cache all graph responses in Redis (TTL: 5 min, invalidated on edge add/remove).
➤ **Commit:** `add REST endpoints: GET /graph/:apiId/dependents`
➤ **Commit:** `implement graph caching with redis (5 min TTL)`

#### Step 3.4 — Graph Algorithms
Implement in `DependencyGraph.ts`:
- **Cycle detection** using Tarjan's SCC algorithm
- **Topological sort** for dependency ordering
- **Centrality score** = weighted sum of in-degree + transitive dependents
- **Critical API score** = centrality × change frequency × error rate
Add background job (runs every 1hr) to recompute centrality scores.
➤ **Commit:** `implement strongly connected components (Tarjan algorithm)`
➤ **Commit:** `add critical path analysis for high-dependency apis`
➤ **Commit:** `implement graph versioning with snapshots`

#### Step 3.5 — Graph Metrics & Analytics
Track per-edge:
- Call frequency (calls/hour, calls/day, calls/week)
- P50/P95/P99 latency
- Error rate (4xx vs 5xx)
- Geographic distribution of calls
Store raw events in `usage_events` table, aggregate hourly into `usage_hourly_stats`.
➤ **Commit:** `add graph metrics: in-degree out-degree centrality scores`
➤ **Commit:** `add graph statistics endpoint for dashboard metrics`

---

### ═══ PHASE 4: Change Detection & Threat Classification (Aug 11–25) ═══

**Goal:** Detect every meaningful change to an API schema and instantly know if it will break downstream consumers.

#### Step 4.1 — API Snapshots
Create `api_snapshots` table:
```typescript
{
  id: string
  apiEndpointId: string
  version: number         // auto-increment per endpoint
  schema: JsonObject      // full ApiEndpoint snapshot
  capturedAt: Date
  capturedBy: string      // repoId that triggered scan
}
```
On every scan/sync: compare incoming schema against latest snapshot. If different, create new snapshot.
➤ **Commit:** `implement ApiSnapshot model to store api schema at each version`

#### Step 4.2 — SchemaDiff Engine
Create `packages/core/src/diff/SchemaDiff.ts`:
```typescript
export interface SchemaDiff {
  apiEndpointId: string
  fromVersion: number
  toVersion: number
  changes: SchemaChange[]
  breakingChanges: SchemaChange[]
  nonBreakingChanges: SchemaChange[]
  timestamp: Date
}

export interface SchemaChange {
  type: ChangeType
  path: string        // e.g. "params.userId", "requestBody.email"
  before: unknown
  after: unknown
  description: string // human readable
}

export type ChangeType =
  | 'PARAM_REQUIRED_ADDED'    // CRITICAL
  | 'PARAM_REMOVED'           // CRITICAL
  | 'PARAM_TYPE_CHANGED'      // CRITICAL
  | 'ENDPOINT_REMOVED'        // CRITICAL
  | 'METHOD_CHANGED'          // CRITICAL
  | 'PATH_CHANGED'            // CRITICAL
  | 'PARAM_OPTIONAL_ADDED'    // NEUTRAL
  | 'RESPONSE_SCHEMA_EXTENDED'// NEUTRAL
  | 'RATE_LIMIT_CHANGED'      // NEUTRAL
  | 'AUTH_SCHEME_CHANGED'     // CRITICAL
  | 'DESCRIPTION_CHANGED'     // LOW
  | 'DEPRECATION_ADDED'       // NEUTRAL
```
➤ **Commit:** `implement SchemaDiff engine comparing two ApiSnapshot objects`
➤ **Commit:** `detect added required parameters (breaking change)`
➤ **Commit:** `detect removed parameters (breaking change)`
➤ **Commit:** `detect changed parameter types (breaking change)`

#### Step 4.3 — Threat Classifier
Create `packages/core/src/diff/ThreatClassifier.ts`:
```typescript
export class ThreatClassifier {
  classify(diff: SchemaDiff): ThreatLevel
  computeRiskScore(diff: SchemaDiff, graph: DependencyGraph): number  // 0–100
  generateMigrationGuide(diff: SchemaDiff): string  // markdown
  generateChangeSummary(diff: SchemaDiff): string   // 1-2 sentence plain english
}
```

**Classification rules:**
- Any `CRITICAL` ChangeType → `CRITICAL` threat level
- Only `NEUTRAL` changes → `NEUTRAL`
- Only `LOW` changes → `LOW`
- Risk score = `threatLevel × dependentCount × centralityScore`
- Risk score > 75 → trigger immediate webhook

Allow custom rules override in `apiwatch.config.ts`:
```typescript
threatRules: {
  overrides: [
    { changeType: 'RATE_LIMIT_CHANGED', threatLevel: 'CRITICAL' }
  ]
}
```
➤ **Commit:** `implement ThreatClassifier: input diff output LOW/NEUTRAL/CRITICAL`
➤ **Commit:** `add migration guide auto-generator for breaking changes`

#### Step 4.4 — Change Events
Create `change_events` table. On new diff detected:
1. Save change event with full diff payload
2. Classify threat level
3. Emit `change:detected` event
4. Trigger notification fan-out

REST endpoints:
```
GET /api/changes/:apiId              → change history for one api
GET /api/changes/recent?limit=50    → org-wide change feed
GET /api/changes/:apiId/diff/:v1/:v2 → specific version diff
```
➤ **Commit:** `implement change event system with EventEmitter`
➤ **Commit:** `add REST endpoint: GET /changes/:apiId for change history`

---

### ═══ PHASE 5: Notification System (Aug 26–Sep 10) ═══

**Goal:** When a CRITICAL change is detected, every affected team is notified within 30 seconds, with full context to understand and act.

#### Step 5.1 — Notification Service Core
Create `packages/core/src/notifications/NotificationService.ts`:
```typescript
export class NotificationService {
  async notify(event: ChangeEvent): Promise<void>
  async fanOut(event: ChangeEvent, subscribers: Subscriber[]): Promise<void>
  async scheduleDigest(teamId: string): Promise<void>
  async acknowledge(notificationId: string, userId: string): Promise<void>
  async escalate(notificationId: string): Promise<void>
}
```
**Fan-out logic:**
1. Get all edges where `targetApiId === changedApiId` from graph
2. For each unique `repoId` in those edges → get team subscribers
3. Deduplicate subscribers
4. Send through preferred channel
5. For CRITICAL: also send to team lead, CC manager
6. If unacknowledged after 2h: escalate
➤ **Commit:** `implement NotificationService with pluggable channels`
➤ **Commit:** `implement subscriber management: team subscribes to api changes`
➤ **Commit:** `add auto-subscription: if your api depends on X subscribe to X changes`

#### Step 5.2 — Email Channel
Create `packages/core/src/notifications/channels/EmailChannel.ts`.

Email templates (HTML with inline CSS, use MJML or handlebars):
- **CRITICAL template:** Red header, affected params table, migration guide, one-click acknowledge button
- **NEUTRAL template:** Yellow header, change summary, no action required
- **DAILY DIGEST template:** Summary table of all changes in last 24h

Config:
```typescript
email: {
  provider: 'smtp' | 'sendgrid' | 'ses'
  from: 'apiwatch@yourorg.com'
  replyTo: 'devops@yourorg.com'
}
```
➤ **Commit:** `add email notification channel using nodemailer`
➤ **Commit:** `create email templates for LOW NEUTRAL CRITICAL threats`

#### Step 5.3 — Slack Channel
Create `packages/core/src/notifications/channels/SlackChannel.ts` using Slack Bolt SDK.

Slack Block Kit message for CRITICAL:
```
🚨 CRITICAL API Change Detected
─────────────────────────────────
API:    POST /users/create (Team: Auth)
Change: Required parameter `organizationId` added
Affects: 7 dependent APIs across 3 teams

[ View Full Diff ]  [ Acknowledge ]  [ Open Dashboard ]
```

Add slash command: `/apiwatch status <api-name>` → returns current health.
➤ **Commit:** `implement Slack notification channel with block kit UI`
➤ **Commit:** `add Slack slash command /apiwatch status <api-name>`

#### Step 5.4 — Real-time (SSE + WebSocket)
Create SSE endpoint: `GET /api/notifications/stream`
- Auth with JWT
- Sends `data:` events on new notifications for user's team
- Client reconnects with `Last-Event-ID`

Create WebSocket endpoint: `WS /api/ws`
- Used by dashboard for live graph updates and notification badges
➤ **Commit:** `implement push notifications via Server-Sent Events`
➤ **Commit:** `add websocket support for real-time dashboard alerts`

#### Step 5.5 — JIRA & GitHub Integration
On CRITICAL change event:
- Auto-create JIRA ticket with: API name, change description, affected teams, migration guide, link to dashboard
- Auto-create GitHub issue in the **dependent repo** (if GitHub token available)

Config:
```typescript
integrations: {
  jira: { host, email, apiToken, projectKey },
  github: { token, createIssuesInDependentRepos: true }
}
```
➤ **Commit:** `add JIRA integration: auto-create ticket on CRITICAL change`
➤ **Commit:** `add GitHub issue auto-creation on CRITICAL breaking change`

---

### ═══ PHASE 6: Dashboard UI (Sep 11–25) ═══

**Goal:** A stunning, enterprise-grade React dashboard that makes the API dependency landscape instantly understandable.

#### Design Direction
- **Aesthetic:** Dark industrial/utilitarian — deep charcoal backgrounds, amber/orange accents for critical, electric blue for neutral, muted green for healthy.
- **Typography:** JetBrains Mono for API paths and code, Inter for UI text.
- **Layout:** Full-bleed sidebar (dark), main content area with contextual panels.
- **Graph:** Force-directed, animated, with glow effects on critical nodes.

#### Step 6.1 — Auth & Routing
Setup React Router v6 with:
- `/login` — JWT login page
- `/` — redirect to `/dashboard`
- `/dashboard` — main KPI view
- `/graph` — full org graph
- `/graph/:apiId` — focused subgraph
- `/apis/:apiId` — API detail
- `/notifications` — notification center
- `/team/:teamId` — team dashboard
- `/settings` — org settings, channels, preferences

Protected routes redirect to login. Store JWT in memory (not localStorage).
➤ **Commit:** `setup React router with layout and auth routes`

#### Step 6.2 — Force Graph Component
Create `packages/dashboard/src/components/ForceGraph.tsx`:
```typescript
// Uses react-force-graph-2d
// Node rendering:
//   - Size = centralityScore (larger = more critical)
//   - Color = threatLevel (green/amber/red)
//   - Label = method + path
//   - Pulsing animation on CRITICAL nodes
// Edge rendering:
//   - Width = callFrequency (thicker = more calls)
//   - Color = errorRate (green→red)
//   - Direction arrows
// Interactions:
//   - Click node → navigate to /apis/:apiId
//   - Hover node → tooltip with stats
//   - Ctrl+click → multi-select for subgraph isolation
//   - Right-click → context menu (notify team, view diff)
//   - Scroll → zoom
//   - Double-click background → reset view
```
➤ **Commit:** `implement API graph visualization using react-force-graph`
➤ **Commit:** `add zoom pan and node click interactions to graph`
➤ **Commit:** `color code graph nodes by threat level (green/yellow/red)`

#### Step 6.3 — API Detail Page
`/apis/:apiId` shows:
- Full schema with syntax-highlighted JSON
- Current threat level badge
- Dependency list (what this API calls + what calls this API)
- Change history timeline (visual diff between versions)
- Usage chart (calls over time, recharts LineChart)
- P50/P95/P99 latency chart
- Top callers table with call count and error rate
- Geographic heatmap of calls by office location
➤ **Commit:** `create API detail page with full schema view`
➤ **Commit:** `add change history timeline on API detail page`
➤ **Commit:** `implement usage analytics chart: calls per api over time`

#### Step 6.4 — Dashboard KPIs
Main dashboard widgets:
```
┌─────────────────────────────────────────────────────┐
│ 📊 Org Health Score: 87/100     ⚠ 3 Critical Alerts │
├──────────────┬──────────────┬──────────────┬────────┤
│ Total APIs   │ Dependencies │ Changes Today│ Teams  │
│ 2,847        │ 14,203 edges │ 47           │ 64     │
├──────────────┴──────────────┴──────────────┴────────┤
│ [CRITICAL ALERTS BANNER - if any]                   │
├─────────────────────────┬───────────────────────────┤
│ Dependency Graph        │ Change Feed               │
│ [force graph mini]      │ [live scrolling events]   │
├─────────────────────────┼───────────────────────────┤
│ Top APIs by Centrality  │ Recent Notifications      │
└─────────────────────────┴───────────────────────────┘
```
➤ **Commit:** `add KPI widgets: total apis, active dependencies, critical alerts`
➤ **Commit:** `create org-wide health score dashboard`

#### Step 6.5 — Notification Center
- Filter tabs: ALL / CRITICAL / NEUTRAL / LOW / UNREAD
- Each notification card shows: threat badge, API name, change summary, affected count, timestamp, acknowledge button
- Bulk acknowledge
- Real-time: new notifications appear at top via SSE without page refresh
- Notification preferences page: choose channels, quiet hours, digest frequency
➤ **Commit:** `create notifications center page with filter tabs`
➤ **Commit:** `implement real-time alert toast on CRITICAL changes via SSE`

---

### ═══ PHASE 7: Analytics, Hardening & Release (Sep 26–28) ═══

#### Step 7.1 — Analytics Pipeline
Create `packages/core/src/analytics/`:
- Hourly aggregation job: compute per-API stats from raw `usage_events`
- `GET /api/analytics/api/:id/usage?from=&to=&granularity=hour|day|week`
- `GET /api/analytics/org/summary` — org-wide trends
- API Stability Index = inverse of change frequency (updates weekly)
- SLA breach detection: if error rate > threshold → alert
➤ **Commit:** `implement usage analytics aggregation pipeline`
➤ **Commit:** `compute dependency health score per api`

#### Step 7.2 — Performance & Security Hardening
- Rate limiting on all public endpoints (fastify-rate-limit)
- Input sanitization (fastify-sanitize)
- Helmet headers
- Request logging with correlation IDs (X-Request-Id)
- Graceful shutdown handling
- Memory leak detection in graph engine
- Load test with k6: 1000 concurrent users on `/graph/full`
➤ **Commit:** `add load tests for graph endpoint under 1000 concurrent users`

#### Step 7.3 — Kubernetes Deployment
Create `helm/apiwatch/`:
```
Chart.yaml
values.yaml           ← configurable: replicas, image tags, DB creds
templates/
  deployment.yaml     ← core server
  service.yaml
  ingress.yaml
  configmap.yaml
  secret.yaml
  hpa.yaml            ← autoscale on CPU/memory
  pdb.yaml            ← pod disruption budget
```
➤ **Commit:** `add kubernetes helm chart for self-hosted deployment`

#### Step 7.4 — Documentation
Create `docs/` using Astro + Starlight:
- Getting Started guide
- Plugin installation + configuration
- Dashboard walkthrough
- Notification setup for each channel
- API Reference (auto-generated from Typedoc)
- Architecture deep dive
- Enterprise deployment guide
➤ **Commit:** `write comprehensive API documentation with examples`

#### Step 7.5 — v1.0.0 Release
- Full changelog in `CHANGELOG.md`
- Tag `v1.0.0` in git
- Build and push Docker images to registry
- Publish `@apiwatch/plugin` and `@apiwatch/cli` to npm
➤ **Commit:** `v1.0.0 release: APIWatch - API Dependency Management Framework`

---

## 🚦 After Each Phase: GitHub Push Checklist

```bash
# After every 5-7 commits:
git push origin main

# After completing a full phase:
git push origin main
git tag phase-{N}-complete
git push origin --tags
```

---

## ⚡ Cursor-Specific Instructions

1. **Always read the JSON commit file** (`git_commits.json`) before starting any step. Match your work to the step description and run the exact git command when done.

2. **When generating files:** Create the actual file first, then ask if adjustments are needed. Don't just describe what to create.

3. **When you're unsure about the approach:** Implement the simpler version first, commit it, then iterate. Never leave uncommitted work.

4. **For tests:** Write the test file immediately after the implementation file. Don't batch tests at the end.

5. **For complex algorithms** (graph traversal, schema diff): Start with a failing test → implement until green → refactor → commit.

6. **Database changes:** Always create a new migration file. Never modify existing migrations.

7. **If a step is ambiguous:** Default to the more explicit, verbose implementation. Optimize later.
