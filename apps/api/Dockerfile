# Dockerfile de produção — apps/api
# Multi-stage build para manter a imagem final enxuta.

FROM node:20-alpine AS builder
WORKDIR /repo

COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY packages/database/package.json packages/database/package.json

RUN npm install

COPY packages/database packages/database
COPY apps/api apps/api
COPY tsconfig.base.json tsconfig.base.json

RUN npm run db:generate --workspace=packages/database
RUN npm run build --workspace=apps/api

FROM node:20-alpine AS runner
WORKDIR /repo
ENV NODE_ENV=production

COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/apps/api/dist ./apps/api/dist
COPY --from=builder /repo/apps/api/package.json ./apps/api/package.json
COPY --from=builder /repo/packages/database ./packages/database

EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
