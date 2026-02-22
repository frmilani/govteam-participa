# PRD - Sistema de Enquetes e Premiações Online (Integrado ao FormBuilder Hub)

## SUMÁRIO EXECUTIVO

**Versão:** 3.0 - Arquitetura Hub & Spoke Atualizada  
**Data:** Janeiro 2025  
**Status:** Pronto para Implementação

### Visão Geral

Plataforma SaaS multi-tenant para distribuição e análise de enquetes online, com foco em premiações de destaque empresarial. O sistema funciona como **Spoke** integrado ao **FormBuilder Pro (Hub)**, que gerencia toda a camada de formulários via OAuth2 e APIs REST.

### Diferencial Competitivo

- ✅ **Reutilização Total** do engine de formulários do Hub
- ✅ **SSO Unificado** via OAuth2 (login único)
- ✅ **Multi-tenancy** por `organizationId` (alinhado com Hub)
- ✅ **Gestão de Estabelecimentos** com segmentação hierárquica
- ✅ **Disparo Massivo** via WhatsApp com tracking individual
- ✅ **Rankings Automáticos** por categoria com certificados digitais
- ✅ **Controle de Planos** via `SpokeSubscription` do Hub

### Stack Tecnológico

- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL 15+ (Prisma ORM)
- **Cache/Queue:** Redis + BullMQ
- **Storage:** MinIO/S3
- **Auth:** NextAuth + OAuth2 (Hub)
- **UI:** Tailwind CSS v4 + shadcn/ui

---

## 1. ARQUITETURA HUB & SPOKE

### 1.1 Diagrama de Integração

```mermaid
graph TD
    subgraph "FormBuilder Pro (HUB)"
        HubAPI[API Pública]
        HubOAuth[OAuth2 Server]
        FormDef[Definição de Formulários]
        HubAnalytics[Analytics Views/Submits]
        SpokeConfig[Spoke Subscriptions]
    end
    
    subgraph "Sistema de Enquetes (SPOKE)"
        Landing[Landing Pages]
        Estabelec[Gestão Estabelecimentos]
        Leads[Gestão Leads]
        WhatsApp[Campanhas WhatsApp]
        Results[Resultados & Rankings]
        LocalDB[(Banco Local)]
    end
    
    Admin[Admin] --> HubOAuth
    HubOAuth --> Landing
    Admin --> FormDef
    FormDef --> HubAPI
    Landing -- Consome Schema --> HubAPI
    Landing -- Telemetria --> HubAnalytics
    Landing -- Salva Respostas --> LocalDB
    
    Admin --> Estabelec
    Admin --> Leads
    Admin --> WhatsApp
    WhatsApp --> Landing
    
    Results --> LocalDB
    
    Estabelec -- Valida Limites --> SpokeConfig
    Leads -- Valida Limites --> SpokeConfig
```

### 1.2 Divisão de Responsabilidades

| Camada | Hub (FormBuilder) | Spoke (Enquetes) |
|--------|------------------|------------------|
| **Autenticação** | ✅ OAuth2 Server, Gestão de Usuários | ❌ Apenas consome via SSO |
| **Organizações** | ✅ CRUD, Multi-tenancy | ❌ Sincroniza via token |
| **Formulários** | ✅ Schema, Validação, Editor | ❌ Apenas consome |
| **Landing Page** | ❌ Não gerencia | ✅ Personalização visual completa |
| **Estabelecimentos** | ❌ Não conhece | ✅ CRUD + Segmentos + Votação |
| **Leads** | ❌ Não conhece | ✅ Gestão + Tags + WhatsApp |
| **Campanhas** | ❌ Não gerencia | ✅ Disparo + Tracking + Analytics |
| **Respostas** | ✅ Telemetria (count) | ✅ Dados completos (privacidade) |
| **Rankings** | ❌ Não calcula | ✅ Processamento + Certificados |
| **Planos/Limites** | ✅ SpokeSubscription | ✅ Valida antes de criar recursos |

---

## 2. AUTENTICAÇÃO E SSO

### 2.1 Fluxo OAuth2

```mermaid
sequenceDiagram
    participant U as Usuário
    participant S as Spoke (Enquetes)
    participant H as Hub (FormBuilder)
    
    U->>S: Acessa /admin
    S->>S: Verifica sessão (NextAuth)
    S->>H: Redireciona para /api/auth/oauth/authorize
    H->>U: Tela de login
    U->>H: Credenciais
    H->>H: Valida e gera code
    H->>S: Redireciona com code
    S->>H: POST /api/auth/oauth/token (troca code por token)
    H->>S: Retorna access_token + userinfo
    S->>S: Cria sessão local
    S->>U: Redireciona para /admin
```

### 2.2 Configuração NextAuth

```typescript
// src/lib/auth.config.ts
import NextAuth, { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "formbuilder-hub",
      name: "FormBuilder Hub",
      type: "oauth",
      authorization: {
        url: `${process.env.HUB_URL}/api/auth/oauth/authorize`,
        params: { 
          scope: "openid profile email organization",
          response_type: "code"
        } 
      },
      token: `${process.env.HUB_INTERNAL_URL}/api/auth/oauth/token`,
      userinfo: `${process.env.HUB_INTERNAL_URL}/api/auth/oauth/userinfo`,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          organizationId: profile.org_id, // CRÍTICO
          organizationName: profile.org_name,
          role: profile.role,
        }
      },
      clientId: process.env.HUB_CLIENT_ID, // "spoke-premio-destaque"
      clientSecret: process.env.HUB_CLIENT_SECRET,
    }
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.organizationId = profile.org_id
        token.organizationName = profile.org_name
        token.role = profile.role
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.user.organizationId = token.organizationId as string
      session.user.organizationName = token.organizationName as string
      session.user.role = token.role as string
      session.accessToken = token.accessToken as string
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}
```

### 2.3 Middleware de Tenant Resolution

```typescript
// middleware.ts
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Ignorar rotas públicas (/r/:hash, /vote/:hash, /api/public/*)
  if (req.nextUrl.pathname.match(/^\/(r|vote|api\/public)\//)) {
    return NextResponse.next()
  }
  
  const token = await getToken({ req })
  
  if (!token?.organizationId) {
    const loginUrl = new URL("/api/auth/signin", req.url)
    return NextResponse.redirect(loginUrl)
  }

  // Injeta o ID da organização nos headers
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-organization-id", token.organizationId as string)
  requestHeaders.set("x-user-id", token.sub as string)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}
```

---

## 3. VARIÁVEIS DE AMBIENTE

```bash
# .env.local

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/premio_destaque"

# URLs
NEXT_PUBLIC_APP_URL="https://enquetes.plataforma.com"
HUB_URL="https://formbuilder.plataforma.com"
HUB_INTERNAL_URL="http://hub:3000" # Docker network

# NextAuth
NEXTAUTH_URL="https://enquetes.plataforma.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth2 Credentials (registrado no Hub)
HUB_CLIENT_ID="spoke-premio-destaque"
HUB_CLIENT_SECRET="secret-from-hub-admin"

# MinIO/S3
S3_BUCKET="enquetes-uploads"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="minioadmin"
S3_SECRET_ACCESS_KEY="minioadmin"
S3_ENDPOINT="http://localhost:9000"
S3_PUBLIC_URL="http://localhost:9000/enquetes-uploads"

# Redis
REDIS_URL="redis://localhost:6379"

# WhatsApp API
EVOLUTION_API_URL="https://evolution.api.com"
EVOLUTION_API_KEY="your-api-key"

# Hub API (para service-to-service)
SPOKE_INTERNAL_API_KEY="spoke_internal_secret"
```

---

## 4. MODELO DE DADOS

### 4.1 Schema Prisma Completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ═══════════════════════════════════════════════════════════
// ENQUETES
// ═══════════════════════════════════════════════════════════

model Enquete {
  id              String   @id @default(cuid())
  organizationId  String   // CRÍTICO: Vindo do Hub via SSO
  
  titulo          String
  descricao       String?
  
  // Referência ao Hub
  formPublicId    String   // "premio-comercio-2025"
  hubFormId       String   // ID interno do Hub (para analytics)
  
  // Configuração visual
  configVisual    Json     // logo, cores, banner, template
  paginaAgradecimento Json
  
  status          EnqueteStatus @default(RASCUNHO)
  linkExpiracaoDias Int     @default(30)
  
  criadoPor       String
  criadoEm        DateTime @default(now())
  publicadoEm     DateTime?
  encerramentoEm  DateTime?
  
  campanhas       Campanha[]
  respostas       Resposta[]
  
  @@index([organizationId])
  @@index([organizationId, status])
  @@unique([organizationId, formPublicId])
}

enum EnqueteStatus {
  RASCUNHO
  PUBLICADA
  PAUSADA
  ENCERRADA
}

// ═══════════════════════════════════════════════════════════
// ESTABELECIMENTOS E SEGMENTOS
// ═══════════════════════════════════════════════════════════

model Segmento {
  id             String   @id @default(cuid())
  organizationId String
  
  nome      String
  slug      String
  paiId     String?
  pai       Segmento? @relation("SegmentoHierarquia", fields: [paiId], references: [id])
  filhos    Segmento[] @relation("SegmentoHierarquia")
  
  cor       String?  // hex
  icone     String?  // lucide icon name
  ordem     Int      @default(0)
  
  estabelecimentos EstabelecimentoSegmento[]
  
  @@unique([organizationId, slug])
  @@index([organizationId])
}

model Estabelecimento {
  id             String   @id @default(cuid())
  organizationId String
  
  nome        String
  logoUrl     String?
  descricao   String?
  
  endereco    String?
  telefone    String?
  whatsapp    String?
  website     String?
  instagram   String?
  facebook    String?
  
  ativo       Boolean  @default(true)
  criadoEm    DateTime @default(now())
  
  segmentos   EstabelecimentoSegmento[]
  votos       VotoEstabelecimento[]
  
  @@index([organizationId])
  @@index([organizationId, ativo])
}

model EstabelecimentoSegmento {
  estabelecimentoId String
  segmentoId        String
  estabelecimento   Estabelecimento @relation(fields: [estabelecimentoId], references: [id], onDelete: Cascade)
  segmento          Segmento @relation(fields: [segmentoId], references: [id], onDelete: Cascade)
  
  @@id([estabelecimentoId, segmentoId])
}

// ═══════════════════════════════════════════════════════════
// LEADS E TAGS
// ═══════════════════════════════════════════════════════════

model Lead {
  id                  String   @id @default(cuid())
  organizationId      String
  
  nome                String
  sexo                Sexo?
  email               String?
  telefone            String?
  whatsapp            String   // obrigatório
  facebook            String?
  instagram           String?
  
  tags                LeadTag[]
  statusVerificacao   VerificacaoStatus @default(NAO_VERIFICADO)
  
  optOut              Boolean  @default(false)
  optOutEm            DateTime?
  
  origem              OrigemLead @default(MANUAL)
  consentimentoEm     DateTime?
  
  criadoEm            DateTime @default(now())
  ultimaInteracao     DateTime?
  
  trackingLinks       TrackingLink[]
  respostas           Resposta[]
  
  @@index([organizationId])
  @@index([organizationId, whatsapp])
  @@index([organizationId, email])
}

enum Sexo {
  M
  F
  OUTRO
  NAO_INFORMAR
}

enum VerificacaoStatus {
  NAO_VERIFICADO
  VERIFICADO
  INVALIDO
}

enum OrigemLead {
  MANUAL
  IMPORTACAO
  FORMULARIO_WEB
}

model Tag {
  id             String   @id @default(cuid())
  organizationId String
  
  nome     String
  cor      String   // hex
  leads    LeadTag[]
  
  @@unique([organizationId, nome])
  @@index([organizationId])
}

model LeadTag {
  leadId   String
  tagId    String
  lead     Lead @relation(fields: [leadId], references: [id], onDelete: Cascade)
  tag      Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@id([leadId, tagId])
}

// ═══════════════════════════════════════════════════════════
// CAMPANHAS E TRACKING
// ═══════════════════════════════════════════════════════════

model Campanha {
  id                  String   @id @default(cuid())
  organizationId      String
  
  nome                String
  enqueteId           String
  enquete             Enquete  @relation(fields: [enqueteId], references: [id])
  
  templateMensagem    String
  midiaUrl            String?
  
  segmentacao         Json     // { tipo: 'tags', tagIds: [...] }
  
  agendadoPara        DateTime?
  intervaloSegundos   Int      @default(5)
  
  status              CampanhaStatus @default(RASCUNHO)
  
  totalLeads          Int      @default(0)
  totalEnviados       Int      @default(0)
  totalVisualizados   Int      @default(0)
  totalRespondidos    Int      @default(0)
  totalFalhados       Int      @default(0)
  
  criadoEm            DateTime @default(now())
  iniciadoEm          DateTime?
  finalizadoEm        DateTime?
    
  criadoPor           String   // userId
  
  trackingLinks       TrackingLink[]
  
  @@index([organizationId])
  @@index([organizationId, status])
}

enum CampanhaStatus {
  RASCUNHO
  AGENDADA
  EM_ANDAMENTO
  CONCLUIDA
  CANCELADA
}

model TrackingLink {
  id              String   @id @default(cuid())
  campanhaId      String
  campanha        Campanha @relation(fields: [campanhaId], references: [id])
  leadId          String
  lead            Lead     @relation(fields: [leadId], references: [id])
  
  hash            String   @unique // 8 chars
  formPublicId    String   // ID do formulário no Hub
  
  enviadoEm       DateTime?
  visualizadoEm   DateTime?
  respondidoEm    DateTime?
  expiraEm        DateTime
  
  status          LinkStatus @default(NAO_ENVIADO)
  
  resposta        Resposta?
  
  @@index([hash])
  @@index([campanhaId, status])
}

enum LinkStatus {
  NAO_ENVIADO
  ENVIADO
  VISUALIZADO
  RESPONDIDO
  EXPIRADO
}

// ═══════════════════════════════════════════════════════════
// RESPOSTAS E VOTOS
// ═══════════════════════════════════════════════════════════

model Resposta {
  id                    String   @id @default(cuid())
  enqueteId             String
  enquete               Enquete  @relation(fields: [enqueteId], references: [id])
  
  formPublicId          String   // ID do Hub
  
  leadId                String?
  lead                  Lead?    @relation(fields: [leadId], references: [id])
  
  trackingLinkId        String   @unique
  trackingLink          TrackingLink @relation(fields: [trackingLinkId], references: [id])
  
  ipAddress             String
  userAgent             String
  
  dadosJson             Json     // Payload completo do formulário
  
  tempoRespostaSegundos Int?
  respondidoEm          DateTime @default(now())
  
  votos                 VotoEstabelecimento[]
  
  @@index([enqueteId])
  @@index([respondidoEm])
}

model VotoEstabelecimento {
  id                  String   @id @default(cuid())
  respostaId          String
  resposta            Resposta @relation(fields: [respostaId], references: [id], onDelete: Cascade)
  
  estabelecimentoId   String
  estabelecimento     Estabelecimento @relation(fields: [estabelecimentoId], references: [id])
  
  segmentoId          String   // Para facilitar queries de ranking
  campoId             String   // ID do campo no formulário (para múltiplos campos de voto)
  
  criadoEm            DateTime @default(now())
  
  @@index([estabelecimentoId, segmentoId])
  @@index([segmentoId, criadoEm])
}
```

---

## 5. ESTRUTURA DO PROJETO

```
premio-destaque/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Rotas de autenticação
│   │   │   ├── signin/
│   │   │   └── error/
│   │   │
│   │   ├── (admin)/                  # Rotas protegidas (admin)
│   │   │   ├── layout.tsx            # Layout com sidebar
│   │   │   ├── dashboard/
│   │   │   ├── enquetes/
│   │   │   ├── estabelecimentos/
│   │   │   ├── segmentos/
│   │   │   ├── leads/
│   │   │   ├── campanhas/
│   │   │   └── configuracoes/
│   │   │
│   │   ├── (public)/                 # Rotas públicas
│   │   │   ├── r/[hash]/             # Redirect tracking
│   │   │   ├── vote/[hash]/          # Landing page votação
│   │   │   └── opt-out/[hash]/       # Descadastro
│   │   │
│   │   └── api/
│   │       ├── auth/[...nextauth]/
│   │       ├── enquetes/
│   │       ├── estabelecimentos/
│   │       ├── leads/
│   │       ├── campanhas/
│   │       ├── submissions/
│   │       ├── tracking/
│   │       └── upload/
│   │
│   ├── components/
│   │   ├── admin/
│   │   ├── forms/
│   │   ├── landing/
│   │   ├── analytics/
│   │   └── ui/
│   │
│   ├── lib/
│   │   ├── auth.config.ts
│   │   ├── prisma.ts
│   │   ├── s3.ts
│   │   ├── redis.ts
│   │   ├── hub-api.ts
│   │   ├── whatsapp.ts
│   │   └── spoke-limits.ts
│   │
│   └── middleware.ts
│
├── jobs/                             # BullMQ workers
│   ├── send-whatsapp.ts
│   └── process-campaign.ts
│
└── docker-compose.yml
```

---

## 6. PLANOS E PRICING

| Recurso | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| **Preço/mês** | R$ 297 | R$ 797 | Customizado |
| **Leads** | 1.000 | 10.000 | Ilimitado |
| **Estabelecimentos** | 100 | 500 | Ilimitado |
| **Campanhas/mês** | 10 | 50 | Ilimitado |
| **Respostas/mês** | 5.000 | 50.000 | Ilimitado |
| **Enquetes Ativas** | 3 | 10 | Ilimitado |
| **Usuários Admin** | 2 | 5 | Ilimitado |
| **WhatsApp** | ✅ | ✅ | ✅ |
| **Certificados** | ❌ | ✅ | ✅ |
| **Analytics Avançado** | ❌ | ✅ | ✅ |
| **Custom Domain** | ❌ | ❌ | ✅ |
| **API Access** | ❌ | ✅ | ✅ |
| **White Label** | ❌ | ❌ | ✅ |

---

**Documento elaborado por:** Product Manager + AI Assistant  
**Data:** Janeiro 2025  
**Versão:** 3.0 - Arquitetura Hub & Spoke Completa  
**Próxima Revisão:** Após validação com stakeholders
