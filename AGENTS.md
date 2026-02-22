<!-- manifest:type:maestro -->
<!-- manifest:status:HYDRATED -->
<!-- manifest:updated:2025-01-06 -->

# AGENTS.md

> **Maestro** — Ponto de entrada único para IAs trabalhando neste repositório.

<!-- instruction:for-ai -->
Este é o PRIMEIRO arquivo que você deve ler ao iniciar trabalho neste projeto.
Ele conecta os objetivos de alto nível às ferramentas de baixo nível.
Após ler este arquivo, navegue para os índices específicos conforme sua tarefa.
<!-- /instruction -->

---

## Project Identity

**Project Name:** Sistema de Enquetes e Premiações Online (Prêmio Destaque)

**What We're Building:** Plataforma SaaS multi-tenant para distribuição e análise de enquetes online, com foco em premiações de destaque empresarial. Sistema Spoke integrado ao FormBuilder Pro (Hub) para gestão de estabelecimentos, leads, campanhas WhatsApp e rankings automáticos.

**Tech Stack:** Next.js 15 (App Router), PostgreSQL 15+ (Prisma ORM), Redis + BullMQ, MinIO/S3, NextAuth + OAuth2 (Hub), Tailwind CSS v4 + shadcn/ui

**Critical Innovation:** Arquitetura Hub & Spoke com SSO unificado via OAuth2, reutilização total do engine de formulários do Hub, controle de planos via SpokeSubscription, e sistema completo de tracking de campanhas WhatsApp com analytics avançado.

---

## Quick Start

### For AI Agents

1. **Read this file** — Entenda o contexto geral
2. **Read PRD.md** — Requisitos de negócio completos
3. **Check status** — `/status` para ver progresso
4. **Pick a task** — Escolha próxima RF do `feature_list.json`
5. **Plan** — `/plan RF-XXX` para criar plano detalhado
6. **Implement** — `/implement RF-XXX` para executar

### For Humans

1. Leia este arquivo para overview
2. Revise `PRD.md` para requisitos
3. Consulte `.context/docs/` para arquitetura
4. Siga os workflows em `.agent/workflows/`

---

## Dev Environment

**Initial Setup:**
```bash
npm install
npx prisma generate
npx prisma db push
docker-compose up -d  # Redis + MinIO
```

**Development Commands:**
```bash
npm run dev           # Start Next.js dev server
npx prisma studio     # Open DB GUI
npm run jobs:dev      # Start BullMQ workers
```

**Environment Variables:**
- `DATABASE_URL` — PostgreSQL connection string
- `HUB_URL` — FormBuilder Hub URL (https://formbuilder.plataforma.com)
- `HUB_CLIENT_ID` — OAuth2 Client ID (spoke-premio-destaque)
- `HUB_CLIENT_SECRET` — OAuth2 Client Secret
- `NEXTAUTH_SECRET` — NextAuth secret key
- `S3_BUCKET` — MinIO/S3 bucket name
- `REDIS_URL` — Redis connection string
- `EVOLUTION_API_URL` — WhatsApp API endpoint
- `EVOLUTION_API_KEY` — WhatsApp API key

---

## Repository Map

```
premia-destaque/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/           # Rotas de autenticação
│   │   ├── (admin)/          # Rotas protegidas
│   │   ├── (public)/         # Landing pages públicas
│   │   └── api/              # API routes
│   ├── components/
│   │   ├── admin/
│   │   ├── forms/
│   │   ├── landing/
│   │   └── ui/
│   ├── lib/
│   │   ├── auth.config.ts
│   │   ├── prisma.ts
│   │   ├── hub-api.ts
│   │   ├── whatsapp.ts
│   │   └── spoke-limits.ts
│   └── middleware.ts
├── jobs/                     # BullMQ workers
└── .context/                 # Documentação e contexto
```

**Key Files:**
- **`PRD.md`** — Requisitos de produto (Single Source of Truth)
- **`feature_list.json`** — Lista de testes e progresso
- **`AGENTS.md`** — Este arquivo (Maestro)

---

## Context Navigation

| Folder | Index | Purpose |
|--------|-------|---------|
| `.context/agents/` | [🤖 README.md](.context/agents/README.md) | Playbooks de especialistas |
| `.context/docs/` | [📚 README.md](.context/docs/README.md) | Documentação técnica |
| `.context/design/` | [🎨 README.md](.context/design/README.md) | Tokens e componentes |
| `.context/plans/` | [📋 README.md](.context/plans/README.md) | Planos de implementação |
| `.agent/workflows/` | [Workflows](.agent/workflows/) | Comandos automatizados |

---

## Available Workflows

| Command | Purpose |
|---------|---------|
| `/init-project` | Inicializa projeto a partir do PRD |
| `/extract-design` | Extrai tokens dos wireframes |
| `/hydrate-agents` | Preenche playbooks com dados do projeto |
| `/plan RF-XXX` | Cria plano detalhado para uma RF |
| `/implement RF-XXX` | Implementa e verifica uma RF |
| `/status` | Mostra progresso atual |

---

## Alignment: High Level → Low Level

**High Level Goal:**
Criar uma plataforma SaaS completa para gestão de enquetes e premiações que reutilize 100% da infraestrutura do FormBuilder Hub, permitindo que organizações realizem premiações de destaque empresarial com disparo massivo via WhatsApp, tracking individual de respostas e geração automática de rankings por categoria.

**Critical Success Factors:**
1. **Integração Perfeita com Hub:** SSO via OAuth2, consumo de formulários via API pública, telemetria de analytics
2. **Alta Taxa de Conversão:** > 20% de respostas através de links rastreáveis e landing pages otimizadas
3. **Escalabilidade:** Suportar múltiplos tenants com isolamento por organizationId, controle de limites via SpokeSubscription

**Low Level Tools (Agents):**

| Agent | Primary Responsibility |
|-------|------------------------|
| Frontend Specialist | UI, componentes, acessibilidade |
| Backend Specialist | APIs, validação, serviços |
| Database Specialist | Schema, índices, migrações |
| Test Writer | Testes automatizados |
| Security Auditor | Auth, LGPD, secrets |

---

## Quality Gates

- [ ] **OAuth2 Integration:** Login via Hub funcional com organizationId correto
- [ ] **Multi-tenancy:** Todas as queries filtradas por organizationId
- [ ] **Spoke Limits:** Validação de limites antes de criar recursos
- [ ] **WhatsApp Delivery:** Taxa de entrega > 95%
- [ ] **Performance:** Latência API p95 < 200ms
- [ ] **Security:** Secrets em variáveis de ambiente, rate limiting ativo

---

## Validation

- [ ] Project identity preenchida
- [ ] Dev environment documentado
- [ ] Repository map atualizado
- [ ] Todos os links de navegação funcionam
- [ ] Workflows listados existem
