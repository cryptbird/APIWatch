# Plugin Installation

Install the APIWatch plugin in your Node.js API to register routes and report usage.

## Install

```bash
pnpm add @apiwatch/plugin
```

## Configure

Set environment variables:

- `APIWATCH_SERVER_URL` – APIWatch server base URL (e.g. `https://apiwatch.company.com`)
- `APIWATCH_API_KEY` – API key from the server (register repo first)

## Register Your Repo

Call the server to register your repo and get an API key:

```bash
curl -X POST https://apiwatch.company.com/api/repos/register \
  -H "Content-Type: application/json" \
  -d '{"name":"my-api","teamId":"team-1","orgId":"org-1"}'
```

Use the returned `apiKey` as `APIWATCH_API_KEY`.

## Use in Your App

- **Express:** Use the Express scanner and reporter (see package README).
- **Fastify / Nest / GraphQL / gRPC:** Use the corresponding scanner and register endpoints with the server.

After deployment, the plugin will sync your routes and record outbound calls for dependency tracking.
