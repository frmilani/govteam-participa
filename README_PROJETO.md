# Prêmio Destaque - Sistema de Enquetes e Premiações

## 🎯 Visão Geral

Plataforma SaaS multi-tenant para distribuição e análise de enquetes online, com foco em premiações de destaque empresarial. Sistema Spoke integrado ao FormBuilder Pro (Hub) para gestão de estabelecimentos, leads, campanhas WhatsApp e rankings automáticos.

## 🚀 Status Atual

### ✅ RF-001: Autenticação SSO - **IMPLEMENTADO**

Sistema completo de autenticação Single Sign-On via OAuth2 integrado ao FormBuilder Hub.

**Funcionalidades:**
- Login unificado via Hub OAuth2
- Sincronização automática de organizações
- Middleware de proteção de rotas
- Multi-tenancy com isolamento por `organizationId`
- Rotas públicas para landing pages de votação

**Arquivos principais:**
- `src/lib/auth.config.ts` - Configuração OAuth2
- `src/middleware.ts` - Proteção e injeção de headers
- `src/app/auth/signin/page.tsx` - Página de login
- `src/app/admin/page.tsx` - Dashboard protegido

## 📋 Próximas Implementações

1. **RF-002**: Gestão de Segmentos (Categorias)
2. **RF-003**: Gestão de Estabelecimentos
3. **RF-004**: Gestão de Leads
4. **RF-005**: Integração com FormBuilder Hub
5. **RF-006**: Criação de Enquetes
6. **RF-007**: Campanhas WhatsApp
7. **RF-008**: Landing Page de Votação
8. **RF-009**: Resultados e Rankings
9. **RF-010**: Controle de Limites (Spoke Subscription)

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL 15+ (Prisma ORM)
- **Autenticação**: NextAuth.js 5 (OAuth2)
- **Estilização**: Tailwind CSS v4 + shadcn/ui
- **Ícones**: Lucide React
- **Storage**: MinIO/S3 (futuro)
- **Queue**: BullMQ + Redis (futuro)
- **WhatsApp**: Evolution API (futuro)

## 📦 Instalação Rápida

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas configurações

# 3. Gerar Prisma Client
npm run db:generate

# 4. Criar banco e sincronizar schema
npm run db:push

# 5. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`

## 📚 Documentação

- **Setup Completo**: `SETUP.md`
- **Status de Implementação**: `IMPLEMENTATION_STATUS.md`
- **PRD Completo**: `.context/inputs/PRD.md`
- **Planos de Implementação**: `.context/plans/`
- **Arquitetura**: `.context/docs/architecture.md`

## 🔑 Variáveis de Ambiente Obrigatórias

```env
DATABASE_URL="postgresql://user:password@localhost:5432/premio_destaque"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere-com-openssl-rand-base64-32"
HUB_URL="https://formbuilder.plataforma.com"
HUB_INTERNAL_URL="http://hub:3000"
HUB_CLIENT_ID="spoke-premio-destaque"
HUB_CLIENT_SECRET="secret-do-hub"
```

## 🧪 Testes

### Validar Autenticação SSO

1. Acesse `http://localhost:3000/admin`
2. Será redirecionado para login
3. Clique em "Entrar com FormBuilder Hub"
4. Faça login no Hub
5. Deve retornar para `/admin` autenticado

### Verificar Sessão

```bash
curl http://localhost:3000/api/auth/session
```

Deve retornar:
```json
{
  "user": {
    "name": "Nome",
    "email": "email@exemplo.com",
    "organizationId": "org_123",
    "organizationName": "Organização",
    "role": "ORG_ADMIN"
  }
}
```

## 📂 Estrutura do Projeto

```
premio-destaque/
├── .context/              # Documentação e contexto
│   ├── agents/           # Playbooks de especialistas
│   ├── docs/             # Documentação técnica
│   ├── inputs/           # PRD e requisitos
│   └── plans/            # Planos de implementação
├── prisma/
│   └── schema.prisma     # Schema do banco
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── admin/        # Rotas protegidas
│   │   ├── auth/         # Autenticação
│   │   └── api/          # API routes
│   ├── components/       # Componentes React
│   ├── hooks/            # Custom hooks
│   └── lib/              # Utilitários e configs
├── AGENTS.md             # Maestro (ponto de entrada)
├── SETUP.md              # Guia de instalação
└── package.json
```

## 🔐 Segurança

- ✅ OAuth2 flow completo server-side
- ✅ Secrets não expostos no client
- ✅ Sessions armazenadas no PostgreSQL
- ✅ Middleware protege rotas administrativas
- ✅ Multi-tenancy com isolamento por organização
- ✅ CSRF protection via NextAuth

## 🎨 Design System

Tokens de design configurados em `src/app/globals.css`:
- Cores primárias, secundárias e de estado
- Tipografia responsiva
- Espaçamentos consistentes
- Modo claro/escuro preparado

## 🤝 Contribuindo

Este projeto segue o framework AI Development Template:
1. Leia `AGENTS.md` para contexto geral
2. Consulte `.context/plans/` para planos de implementação
3. Siga os padrões definidos em `.context/agents/`
4. Atualize `feature_list.json` após implementar

## 📞 Suporte

- Documentação: `.context/docs/`
- PRD: `.context/inputs/PRD.md`
- Issues: Consulte os planos de implementação

## 📄 Licença

ISC
