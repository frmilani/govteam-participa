# Production Dockerfile for Premio-Destaque Spoke (Next.js)
# Build: docker build --build-arg GITHUB_TOKEN=... -t govteam-premio-destaque .

FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
RUN apk add --no-cache libc6-compat

COPY vendor ./vendor
COPY package.json package-lock.json* ./
RUN npm install --include=dev --legacy-peer-deps --ignore-scripts

COPY prisma ./prisma
RUN npx prisma generate

FROM deps AS builder
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app

COPY docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/prisma ./prisma

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs && chown -R nextjs:nextjs /app
USER nextjs

EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]
