FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY apps/api/package.json ./apps/api/package.json
RUN corepack enable && pnpm install --filter @buscador/api... --frozen-lockfile=false
COPY . .
RUN corepack enable && pnpm --filter @buscador/api build
EXPOSE 4000
CMD ["pnpm", "--filter", "@buscador/api", "start"]
