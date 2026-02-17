# APIWatch server - minimal for docker-compose; full image in Phase 7
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build --filter=@apiwatch/core
EXPOSE 3000
CMD ["node", "packages/core/dist/server.js"]
