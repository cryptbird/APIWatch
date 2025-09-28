# APIWatch server - multi-stage build
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json packages/core/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile
COPY packages/shared packages/shared
COPY packages/core packages/core
RUN pnpm run build --filter=@apiwatch/core

FROM node:20-alpine
RUN addgroup -g 1000 apiwatch && adduser -u 1000 -G apiwatch -D apiwatch
WORKDIR /app
COPY --from=builder /app/packages/core/dist ./dist
COPY --from=builder /app/packages/core/package.json ./
COPY --from=builder /app/packages/shared/dist ./shared_dist
RUN npm install --omit=dev
USER apiwatch
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s CMD wget -q -O- http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
