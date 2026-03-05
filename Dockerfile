# Production Dockerfile for Participa Spoke (Next.js + BullMQ Worker)
# Standalone output mode — reduz imagem de ~2GB para ~500MB
# Next.js 16: standalone gerado em .next/standalone/app/ (não mais .next/standalone/)

FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# -----------------------------------------------------------------------------
# deps: instala todas as dependências e gera o Prisma client (query engine binary)
# -----------------------------------------------------------------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl

COPY vendor ./vendor
COPY package.json package-lock.json* ./
RUN npm install --include=dev --legacy-peer-deps --ignore-scripts

COPY prisma ./prisma
RUN npx prisma@5.22.0 generate

# -----------------------------------------------------------------------------
# builder: compila o Next.js
# -----------------------------------------------------------------------------
FROM deps AS builder
COPY . .
RUN npm run build

# -----------------------------------------------------------------------------
# tools: instala prisma CLI + @prisma/engines + tsx em package.json limpo
#        openssl obrigatório para download dos binários dos engines (Alpine)
#        SEM --ignore-scripts para que @prisma/engines baixe os binários corretos
# -----------------------------------------------------------------------------
FROM base AS tools
WORKDIR /tools
RUN apk add --no-cache openssl
RUN npm init -y && npm install prisma@5.22.0 tsx@4.21.0 --no-audit

# -----------------------------------------------------------------------------
# runner: imagem final de produção
# -----------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

RUN apk add --no-cache openssl dos2unix

COPY docker/entrypoint.sh ./entrypoint.sh
RUN dos2unix ./entrypoint.sh && chmod +x ./entrypoint.sh

# Standalone (Next.js 14): copiar de standalone/ para /app/
# Resultado: server.js, node_modules/ e .next/ ficam direto em /app/
COPY --from=builder /app/.next/standalone/ ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
RUN touch .env

# Modules that the worker needs (BullMQ, Redis, etc) from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Worker: código TypeScript (tsx executa os arquivos fonte diretamente)
COPY --from=builder /app/jobs ./jobs
COPY --from=builder /app/src ./src

# .prisma: query engine binary gerado por prisma generate (Alpine, do deps)
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

# @prisma + prisma CLI + tsx: vindos do tools (migration engine Alpine incluído)
COPY --from=tools /tools/node_modules/ ./node_modules/

# Symlink do tsx para npm run jobs:dev encontrar o binário
RUN mkdir -p ./node_modules/.bin && \
    ln -sf ../tsx/dist/cli.mjs ./node_modules/.bin/tsx && \
    chmod +x ./node_modules/tsx/dist/cli.mjs

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs && chown -R nextjs:nextjs /app
USER nextjs

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "server.js"]
