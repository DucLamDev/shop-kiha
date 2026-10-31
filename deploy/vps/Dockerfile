FROM node:24.21.0-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 MONGOMS_DISABLE_POSTINSTALL=1
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/api/package.json ./apps/api/package.json

FROM base AS web-build
RUN npm ci --workspace=@kiha/web --omit=dev --include-workspace-root=false --no-audit --no-fund
COPY apps/web ./apps/web
COPY data ./data
ARG SITE_URL=https://noithatkiha.vn
ENV SITE_URL=${SITE_URL} API_INTERNAL_URL=http://api:4000
RUN npm run build --workspace=@kiha/web

FROM base AS web
ENV NODE_ENV=production
COPY --from=web-build --chown=node:node /app/node_modules ./node_modules
COPY --from=web-build --chown=node:node /app/apps/web ./apps/web
USER node
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "apps/web", "--hostname", "0.0.0.0", "--port", "3000"]

FROM base AS api
RUN npm ci --workspace=@kiha/api --omit=dev --include-workspace-root=false --no-audit --no-fund
COPY --chown=node:node apps/api ./apps/api
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node data ./data
RUN mkdir -p /var/lib/kiha/videos && chown node:node /var/lib/kiha/videos
ENV NODE_ENV=production VIDEO_UPLOAD_DIR=/var/lib/kiha/videos
USER node
EXPOSE 4000
CMD ["node", "apps/api/src/server.mjs"]
