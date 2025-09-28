# Getting Started

APIWatch helps teams track API dependencies, detect breaking changes, and notify affected services.

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- pnpm

## Quick Start

1. Clone and install:

   ```bash
   git clone https://github.com/your-org/apiwatch.git
   cd apiwatch && pnpm install
   ```

2. Copy environment and start dependencies:

   ```bash
   cp .env.example .env
   docker compose up -d
   ```

3. Run migrations (apply SQL in `packages/core/src/db/migrations/` in order).

4. Start the server:

   ```bash
   pnpm run build --filter=@apiwatch/core
   node packages/core/dist/server.js
   ```

5. Install the plugin in your API repo and register with the server (see Plugin Installation).

## Next Steps

- [Plugin Installation](plugin-installation.md)
- [Configuration Reference](configuration.md)
- [Architecture](architecture.md)
