# Plano de Implementação: Autenticação e SSO via OAuth2

Implementar sistema completo de autenticação Single Sign-On (SSO) integrado ao FormBuilder Hub via OAuth2. O sistema permitirá que usuários façam login uma única vez no Hub e acessem automaticamente o sistema de Enquetes, com sincronização de organizações e permissões. Esta é a fundação crítica para todo o sistema Spoke, garantindo isolamento multi-tenant e controle de acesso.

## Visão Geral

O sistema permitirá:
- **Login Unificado**: Usuários fazem login no Hub e são automaticamente autenticados no Spoke sem necessidade de credenciais separadas
- **Sincronização de Organizações**: `organizationId` é extraído do token OAuth2 e usado para isolar dados entre tenants
- **Proteção de Rotas**: Middleware automático protege rotas administrativas e injeta contexto de organização
- **Rotas Públicas**: Landing pages de votação acessíveis sem autenticação para maximizar conversão

## Referências

- [NextAuth.js Documentation](https://next-auth.js.org/configuration/providers/oauth) - Configuração de providers OAuth2
- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749) - Especificação OAuth2
- PRD Seção 2: [.context/inputs/PRD.md](../inputs/PRD.md#2-autenticação-e-sso) - Fluxo OAuth2 e configuração
- Documentação do Hub: `Hub/docs/SPOKE_IMPLEMENTATION_GUIDE.md` - Guia de integração Spoke
- [agents/backend-development.md](../agents/backend-development.md) - Padrões de API e middleware
- [agents/security-check.md](../agents/security-check.md) - Validação de segurança

## Arquitetura

```mermaid
sequenceDiagram
    participant U as Usuário
    participant S as Spoke (Enquetes)
    participant M as Middleware
    participant NA as NextAuth
    participant H as Hub OAuth2
    participant DB as PostgreSQL
    
    U->>S: GET /admin
    S->>M: Intercepta requisição
    M->>NA: getToken()
    NA-->>M: Token não encontrado
    M->>U: Redirect /api/auth/signin
    
    U->>NA: Inicia login
    NA->>H: GET /api/auth/oauth/authorize
    H->>U: Tela de login Hub
    U->>H: Credenciais
    H->>H: Valida usuário
    H->>NA: Redirect com code
    
    NA->>H: POST /api/auth/oauth/token
    H-->>NA: access_token + refresh_token
    NA->>H: GET /api/auth/oauth/userinfo
    H-->>NA: {sub, email, org_id, role}
    
    NA->>NA: Cria sessão local
    NA->>DB: Salva session token
    NA->>U: Redirect /admin
    
    U->>S: GET /admin (com cookie)
    S->>M: Intercepta requisição
    M->>NA: getToken()
    NA-->>M: {organizationId, sub, role}
    M->>M: Injeta headers
    M->>S: Continue com headers
    S->>DB: Query WHERE organizationId=X
    S-->>U: Renderiza dashboard
    
    style NA fill:#e1f5ff
    style H fill:#fff4e1
    style M fill:#e8f5e9
    style DB fill:#f3e5f5
```

**Notas sobre a arquitetura:**
- **Stateless Sessions**: NextAuth gerencia sessões via JWT armazenado em cookie httpOnly
- **Token Refresh**: Hub fornece refresh_token para renovação automática sem re-login
- **Middleware Injection**: `organizationId` injetado em headers para todas as rotas protegidas
- **Public Routes**: Rotas `/r/*`, `/vote/*` e `/opt-out/*` bypassam autenticação para maximizar conversão

## Pré-requisitos

1. **Spoke Registrado no Hub**: Spoke "premio-destaque" deve estar cadastrado no Hub via `/sys/spokes` com `clientId` e `clientSecret` gerados
2. **Variáveis de Ambiente do Hub**: URLs do Hub (público e interno) configuradas
3. **NextAuth Secret**: Chave secreta gerada via `openssl rand -base64 32`
4. **Organização de Teste**: Pelo menos uma organização criada no Hub para testes

## Passo 1: Configuração Inicial

**Agent:** [agents/backend-development.md](../agents/backend-development.md)

### 1.1 Instalar Dependências

**Dependências necessárias:**
- `next-auth@5.0.0-beta.30`: Framework de autenticação para Next.js com suporte a OAuth2
- `@auth/prisma-adapter@2.11.1`: Adapter para persistir sessões no PostgreSQL via Prisma

### 1.2 Variáveis de Ambiente

Adicionar ao `.env.local`:
- `NEXTAUTH_URL` (obrigatória): URL pública do Spoke - Exemplo: `NEXTAUTH_URL="https://enquetes.plataforma.com"`
- `NEXTAUTH_SECRET` (obrigatória): Secret key para criptografia de tokens - Exemplo: `NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"`
- `HUB_URL` (obrigatória): URL pública do Hub para redirecionamentos - Exemplo: `HUB_URL="https://formbuilder.plataforma.com"`
- `HUB_INTERNAL_URL` (obrigatória): URL interna do Hub para comunicação server-to-server - Exemplo: `HUB_INTERNAL_URL="http://hub:3000"`
- `HUB_CLIENT_ID` (obrigatória): Client ID do Spoke registrado no Hub - Exemplo: `HUB_CLIENT_ID="spoke-premio-destaque"`
- `HUB_CLIENT_SECRET` (obrigatória): Client Secret fornecido pelo Hub - Exemplo: `HUB_CLIENT_SECRET="secret-from-hub-admin"`

**Referência:** Seguir padrão de variáveis de ambiente conforme PRD Seção 3. Atualizar `.env.example` com todas as variáveis.

## Passo 2: Schema do Banco de Dados

**Agent:** [agents/database-development.md](../agents/database-development.md)

### 2.1 Adicionar Modelos NextAuth ao Prisma Schema

**Account**: Armazena conexões OAuth2 de usuários

**Campos:**
- `userId` (String): ID do usuário (referência)
- `type` (String): Tipo de conta (sempre "oauth")
- `provider` (String): Nome do provider (sempre "formbuilder-hub")
- `providerAccountId` (String): ID do usuário no Hub
- `refresh_token` (String?): Token para renovação (opcional)
- `access_token` (String?): Token de acesso atual (opcional)
- `expires_at` (Int?): Timestamp de expiração do token (opcional)
- `token_type` (String?): Tipo do token (geralmente "Bearer")
- `scope` (String?): Escopos concedidos (opcional)
- `id_token` (String?): ID token JWT (opcional)
- `session_state` (String?): Estado da sessão (opcional)
- `createdAt` (DateTime @default(now())): Data de criação
- `updatedAt` (DateTime @updatedAt): Data de atualização

**Relações:**
- `user` (User): Relação com usuário, onDelete: Cascade

**Constraints:**
- `@@id([provider, providerAccountId])`: Chave primária composta

**Session**: Armazena sessões ativas de usuários

**Campos:**
- `sessionToken` (String @unique): Token único da sessão
- `userId` (String): ID do usuário
- `expires` (DateTime): Data de expiração da sessão
- `createdAt` (DateTime @default(now())): Data de criação
- `updatedAt` (DateTime @updatedAt): Data de atualização

**Relações:**
- `user` (User): Relação com usuário, onDelete: Cascade

**User**: Representa usuários sincronizados do Hub

**Campos:**
- `id` (String @id @default(cuid())): ID único local
- `name` (String?): Nome completo (opcional)
- `email` (String @unique): Email do usuário
- `emailVerified` (DateTime?): Data de verificação do email (opcional)
- `image` (String?): URL da foto de perfil (opcional)
- `createdAt` (DateTime @default(now())): Data de criação
- `updatedAt` (DateTime @updatedAt): Data de atualização

**Relações:**
- `accounts` (Account[]): Contas OAuth2 vinculadas
- `sessions` (Session[]): Sessões ativas

**VerificationToken**: Tokens de verificação de email

**Campos:**
- `identifier` (String): Identificador (geralmente email)
- `token` (String): Token único
- `expires` (DateTime): Data de expiração

**Constraints:**
- `@@id([identifier, token])`: Chave primária composta

**Índices:**
- Account: `@@index([userId])` - Buscar contas por usuário
- Session: `@@index([userId])` - Buscar sessões por usuário

**Padrões a seguir:**
- Usar schema padrão do NextAuth Prisma Adapter
- Não modificar campos obrigatórios do adapter
- Adicionar campos customizados apenas se necessário

### 2.2 Executar Migração

Executar migração usando `npx prisma migrate dev --name add-nextauth-models`.

**Referência:** [agents/database-development.md](../agents/database-development.md) - seção "Migration"

## Passo 3: Configuração NextAuth

**Agent:** [agents/backend-development.md](../agents/backend-development.md)

### 3.1 Criar Configuração NextAuth

Criar `src/lib/auth.config.ts` (server-only):

**Configuração Principal:**
- Tipo: Objeto NextAuthOptions exportado como `authOptions`
- Provider: OAuth2 customizado apontando para Hub
- Adapter: PrismaAdapter para persistência de sessões
- Callbacks: jwt e session para injetar `organizationId`

**Provider OAuth2:**
- `id`: "formbuilder-hub"
- `name`: "FormBuilder Hub"
- `type`: "oauth"
- `authorization.url`: `${HUB_URL}/api/auth/oauth/authorize`
- `authorization.params`: scope "openid profile email organization", response_type "code"
- `token`: `${HUB_INTERNAL_URL}/api/auth/oauth/token`
- `userinfo`: `${HUB_INTERNAL_URL}/api/auth/oauth/userinfo`
- `profile`: Função que mapeia resposta do Hub para formato NextAuth
- `clientId`: Variável de ambiente `HUB_CLIENT_ID`
- `clientSecret`: Variável de ambiente `HUB_CLIENT_SECRET`

**Profile Mapping:**
- Extrair `sub` (user ID), `name`, `email`, `picture` (avatar)
- **CRÍTICO**: Extrair `org_id` e mapear para `organizationId`
- Extrair `org_name` para exibição
- Extrair `role` para controle de permissões

**JWT Callback:**
- Ao receber account e profile, adicionar `organizationId`, `organizationName` e `role` ao token
- Retornar token atualizado

**Session Callback:**
- Extrair `organizationId`, `organizationName` e `role` do token
- Adicionar ao objeto session.user
- Retornar session atualizada

**Pages:**
- `signIn`: "/auth/signin" - Página customizada de login
- `error`: "/auth/error" - Página de erros de autenticação

**Tratamento de Erros:**
- Validar presença de `org_id` no profile, lançar erro se ausente
- Tratar erros de conexão com Hub gracefully
- Logar erros detalhados para debugging

**Padrões:**
- Usar PrismaAdapter do `@auth/prisma-adapter`
- Não expor tokens ou secrets em logs
- Validar todos os campos obrigatórios do profile
- Usar variáveis de ambiente para todas as URLs

**Referência:** PRD Seção 2.2 - Configuração NextAuth completa

### 3.2 Criar Route Handler NextAuth

Criar `src/app/api/auth/[...nextauth]/route.ts`:

**Endpoint:** `GET/POST /api/auth/[...nextauth]`

**Implementação:**
- Importar NextAuth e authOptions
- Criar handler usando NextAuth(authOptions)
- Exportar como GET e POST handlers

**Lógica:**
- NextAuth gerencia automaticamente todas as rotas OAuth2
- `/api/auth/signin` - Inicia fluxo OAuth2
- `/api/auth/callback/formbuilder-hub` - Recebe callback do Hub
- `/api/auth/signout` - Encerra sessão
- `/api/auth/session` - Retorna sessão atual

**Padrões:**
- Seguir estrutura padrão do NextAuth para App Router
- Não adicionar lógica customizada no handler
- Deixar NextAuth gerenciar o fluxo OAuth2

**Referência:** [NextAuth.js App Router Documentation](https://next-auth.js.org/configuration/initialization#route-handlers-app)

## Passo 4: Middleware de Proteção de Rotas

**Agent:** [agents/backend-development.md](../agents/backend-development.md)

### 4.1 Criar Middleware Principal

Criar `src/middleware.ts`:

**Função:** Interceptar todas as requisições e proteger rotas administrativas

**Lógica a implementar:**
1. Verificar se rota é pública (match regex para `/r/`, `/vote/`, `/opt-out/`, `/api/public/`)
2. Se pública, permitir acesso sem autenticação
3. Se protegida, buscar token usando `getToken()` do next-auth/jwt
4. Se token não existe ou não tem `organizationId`, redirecionar para `/api/auth/signin`
5. Se token válido, injetar `x-organization-id` e `x-user-id` nos headers da requisição
6. Continuar processamento com headers injetados

**Matcher Configuration:**
- Incluir todas as rotas exceto `_next/static`, `_next/image`, `favicon.ico`, `api/auth`
- Usar regex pattern: `/((?!_next/static|_next/image|favicon.ico|api/auth).*)`

**Tratamento de Erros:**
- Se getToken() falhar, redirecionar para login
- Se organizationId ausente no token, redirecionar para erro de configuração
- Logar tentativas de acesso não autorizado

**Padrões:**
- Usar `getToken()` ao invés de `getSession()` para performance
- Não fazer queries ao banco no middleware
- Manter middleware leve e rápido
- Usar NextResponse.redirect() para redirecionamentos

**Referência:** PRD Seção 2.3 - Middleware de Tenant Resolution

## Passo 5: Páginas de Autenticação

**Agent:** [agents/frontend-development.md](../agents/frontend-development.md)

### 5.1 Página de Login

Criar `src/app/auth/signin/page.tsx`:

**Rota:** `/auth/signin`

**Page Metadata:**
- Título: "Login - Prêmio Destaque"
- Descrição: "Faça login para acessar o sistema de enquetes"

**Implementação:**
- Componente Client Component ('use client')
- Exibir logo da plataforma
- Botão "Entrar com FormBuilder Hub"
- Ao clicar, chamar `signIn("formbuilder-hub", { callbackUrl: "/admin" })`
- Exibir loading state durante redirecionamento

**UI Components:**
- Card centralizado com sombra
- Botão primário com ícone de login
- Texto explicativo sobre SSO
- Link para suporte se necessário

**Padrões:**
- Usar `signIn()` do next-auth/react
- Não implementar formulário de credenciais (OAuth2 only)
- Seguir design system do projeto
- Responsivo para mobile

**Referência:** [agents/frontend-development.md](../agents/frontend-development.md) - padrões de páginas

### 5.2 Página de Erro

Criar `src/app/auth/error/page.tsx`:

**Rota:** `/auth/error`

**Implementação:**
- Receber `error` via searchParams
- Mapear códigos de erro para mensagens amigáveis
- Exibir mensagem de erro apropriada
- Botão para tentar novamente

**Erros Possíveis:**
- `Configuration`: Erro de configuração OAuth2
- `AccessDenied`: Usuário negou acesso
- `Verification`: Erro de verificação
- `Default`: Erro genérico

**UI Components:**
- Card de erro com ícone
- Mensagem clara do problema
- Botão "Tentar Novamente" que redireciona para `/auth/signin`
- Link para suporte

## Passo 6: Helpers de Autenticação

**Agent:** [agents/backend-development.md](../agents/backend-development.md)

### 6.1 Helper para Server Components

Criar `src/lib/auth-helpers.ts` (server-only):

**getServerSession**: Função para buscar sessão em Server Components
- Tipo: Função assíncrona que retorna Promise<Session | null>
- Implementação: Usar `getServerSession(authOptions)` do next-auth
- Retorno: Objeto session com user.organizationId ou null

**requireAuth**: Função para proteger Server Components
- Tipo: Função assíncrona que retorna Promise<Session>
- Implementação: Chamar getServerSession, se null redirecionar para login
- Retorno: Session garantida ou redirect

**getOrganizationId**: Função para extrair organizationId
- Tipo: Função assíncrona que retorna Promise<string>
- Implementação: Chamar requireAuth e extrair organizationId
- Retorno: organizationId garantido ou redirect

**Padrões:**
- Marcar todas as funções como server-only
- Usar redirect() do next/navigation para redirecionamentos
- Validar sempre a presença de organizationId
- Não expor dados sensíveis

### 6.2 Hook para Client Components

Criar `src/hooks/use-auth.ts`:

**useAuth**: Hook para acessar sessão em Client Components
- Tipo: Hook que retorna objeto com session, status e organizationId
- Implementação: Usar `useSession()` do next-auth/react
- Retorno: `{ session, status: "loading" | "authenticated" | "unauthenticated", organizationId, isAdmin }`

**Lógica:**
- Extrair organizationId de session.user.organizationId
- Verificar se role é "ORG_ADMIN" ou "SUPER_ADMIN" para isAdmin
- Retornar loading state apropriado

**Padrões:**
- Usar SessionProvider do next-auth/react
- Não fazer queries adicionais
- Memoizar valores derivados

## Passo 7: Session Provider

**Agent:** [agents/frontend-development.md](../agents/frontend-development.md)

### 7.1 Criar Provider Wrapper

Criar `src/components/providers/session-provider.tsx`:

**Implementação:**
- Client Component que wraps SessionProvider do next-auth/react
- Receber session via props (passada do Server Component)
- Passar session para SessionProvider

**Uso:**
- Adicionar no root layout `src/app/layout.tsx`
- Buscar session no Server Component usando getServerSession
- Passar para SessionProvider wrapper

**Padrões:**
- Seguir padrão de providers do Next.js 15
- Não fazer fetch de session no client
- Usar session do server para hidratação inicial

## Passo 8: Testes

**Agent:** [agents/qa-agent.md](../agents/qa-agent.md)

### 8.1 Testes de Fluxo OAuth2

**Cenário 1: Login bem-sucedido**
1. Acessar `/admin` sem estar logado
2. Verificar redirecionamento para `/api/auth/signin`
3. Clicar em "Entrar com FormBuilder Hub"
4. Verificar redirecionamento para Hub OAuth2
5. Fazer login no Hub com credenciais válidas
6. Verificar redirecionamento de volta para `/admin`
7. Verificar que dashboard é exibido
8. **Resultado esperado**: Usuário autenticado e dashboard acessível

**Cenário 2: Token contém organizationId**
1. Fazer login via Hub
2. Acessar `/api/auth/session`
3. Verificar resposta JSON contém `user.organizationId`
4. Verificar resposta contém `user.organizationName`
5. Verificar resposta contém `user.role`
6. **Resultado esperado**: Todos os campos presentes e válidos

**Cenário 3: Middleware injeta headers**
1. Fazer login via Hub
2. Acessar qualquer rota protegida
3. No Server Component, ler headers da requisição
4. Verificar presença de `x-organization-id`
5. Verificar presença de `x-user-id`
6. **Resultado esperado**: Headers injetados corretamente

### 8.2 Testes de Proteção de Rotas

**Cenário 1: Rota protegida sem autenticação**
1. Limpar cookies
2. Tentar acessar `/admin/enquetes`
3. Verificar redirecionamento para `/api/auth/signin`
4. **Resultado esperado**: Acesso negado, redirecionamento para login

**Cenário 2: Rotas públicas acessíveis**
1. Limpar cookies
2. Acessar `/r/abc123`
3. Verificar que página carrega sem redirecionamento
4. Acessar `/vote/abc123`
5. Verificar que landing page carrega
6. **Resultado esperado**: Rotas públicas acessíveis sem autenticação

**Cenário 3: Logout**
1. Fazer login
2. Acessar `/api/auth/signout`
3. Confirmar logout
4. Tentar acessar `/admin`
5. Verificar redirecionamento para login
6. **Resultado esperado**: Sessão encerrada, acesso negado

### 8.3 Testes de Isolamento Multi-tenant

**Cenário 1: Queries filtradas por organizationId**
1. Fazer login com usuário da Org A
2. Criar enquete
3. Fazer logout
4. Fazer login com usuário da Org B
5. Listar enquetes
6. Verificar que enquete da Org A não aparece
7. **Resultado esperado**: Dados isolados por organização

## Checklist de Implementação

### Setup Inicial
- [ ] Instalar dependência `next-auth@5.0.0-beta.30`
- [ ] Instalar dependência `@auth/prisma-adapter@2.11.1`
- [ ] Gerar NEXTAUTH_SECRET com `openssl rand -base64 32`
- [ ] Configurar variável `NEXTAUTH_URL` no `.env.local`
- [ ] Configurar variável `NEXTAUTH_SECRET` no `.env.local`
- [ ] Configurar variável `HUB_URL` no `.env.local`
- [ ] Configurar variável `HUB_INTERNAL_URL` no `.env.local`
- [ ] Configurar variável `HUB_CLIENT_ID` no `.env.local`
- [ ] Configurar variável `HUB_CLIENT_SECRET` no `.env.local`
- [ ] Atualizar `.env.example` com todas as variáveis

### Banco de Dados
- [ ] Adicionar modelo `Account` ao Prisma schema
- [ ] Adicionar modelo `Session` ao Prisma schema
- [ ] Adicionar modelo `User` ao Prisma schema
- [ ] Adicionar modelo `VerificationToken` ao Prisma schema
- [ ] Adicionar índices apropriados
- [ ] Executar migração `npx prisma migrate dev --name add-nextauth-models`
- [ ] Verificar que tabelas foram criadas no banco

### Configuração NextAuth
- [ ] Criar arquivo `src/lib/auth.config.ts`
- [ ] Configurar provider OAuth2 "formbuilder-hub"
- [ ] Configurar URLs de authorization, token e userinfo
- [ ] Implementar função profile() para mapear dados do Hub
- [ ] Implementar callback jwt() para adicionar organizationId
- [ ] Implementar callback session() para expor organizationId
- [ ] Configurar PrismaAdapter
- [ ] Configurar páginas customizadas (signIn, error)
- [ ] Criar arquivo `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Exportar handlers GET e POST

### Middleware
- [ ] Criar arquivo `src/middleware.ts`
- [ ] Implementar lógica de verificação de rotas públicas
- [ ] Implementar busca de token com getToken()
- [ ] Implementar injeção de headers x-organization-id e x-user-id
- [ ] Configurar matcher para excluir rotas estáticas
- [ ] Testar redirecionamento para login em rotas protegidas
- [ ] Testar acesso a rotas públicas sem autenticação

### Páginas de Autenticação
- [ ] Criar página `src/app/auth/signin/page.tsx`
- [ ] Implementar UI de login com botão OAuth2
- [ ] Adicionar loading state
- [ ] Criar página `src/app/auth/error/page.tsx`
- [ ] Implementar mapeamento de códigos de erro
- [ ] Adicionar botão "Tentar Novamente"
- [ ] Testar fluxo completo de login
- [ ] Testar exibição de erros

### Helpers e Hooks
- [ ] Criar arquivo `src/lib/auth-helpers.ts`
- [ ] Implementar função `getServerSession()`
- [ ] Implementar função `requireAuth()`
- [ ] Implementar função `getOrganizationId()`
- [ ] Marcar arquivo como server-only
- [ ] Criar arquivo `src/hooks/use-auth.ts`
- [ ] Implementar hook `useAuth()`
- [ ] Testar hooks em componentes

### Session Provider
- [ ] Criar arquivo `src/components/providers/session-provider.tsx`
- [ ] Implementar wrapper do SessionProvider
- [ ] Adicionar no root layout
- [ ] Buscar session inicial no server
- [ ] Testar hidratação de session

### Qualidade
- [ ] Executar `npm run lint` e corrigir erros
- [ ] Executar `npm run typecheck` e corrigir erros
- [ ] Executar `npm run build` e verificar compilação
- [ ] Testar login completo end-to-end
- [ ] Testar logout
- [ ] Testar proteção de rotas
- [ ] Testar rotas públicas
- [ ] Testar isolamento multi-tenant
- [ ] Verificar que organizationId está presente em todas as requisições
- [ ] Revisar segurança conforme [agents/security-check.md](../agents/security-check.md)
- [ ] Verificar que secrets não são expostos em logs
- [ ] Testar em diferentes navegadores

## Notas Importantes

1. **OAuth2 Flow**: O fluxo OAuth2 é gerenciado automaticamente pelo NextAuth. Não implementar lógica customizada de troca de tokens.
2. **organizationId é Crítico**: Todas as queries ao banco DEVEM filtrar por organizationId. Nunca permitir acesso cross-tenant.
3. **Rotas Públicas**: Landing pages de votação devem ser acessíveis sem autenticação para maximizar conversão. Validar hash do tracking link ao invés de sessão.
4. **Token Refresh**: NextAuth gerencia refresh automático de tokens. Configurar `expires_at` corretamente no Account model.
5. **Performance**: Usar `getToken()` no middleware ao invés de `getSession()` para evitar queries desnecessárias ao banco.
6. **Segurança**: NUNCA expor `HUB_CLIENT_SECRET` no client. Todas as chamadas OAuth2 devem ser server-side.
7. **Erro de Configuração**: Se `org_id` não estiver presente no profile do Hub, significa que o Spoke não foi registrado corretamente. Verificar cadastro no Hub.
8. **Session Storage**: Sessions são armazenadas no PostgreSQL via Prisma. Considerar Redis para alta escala no futuro.

## Referências de Documentação

- **Agents:**
  - [agents/backend-development.md](../agents/backend-development.md) - Configuração NextAuth e middleware
  - [agents/database-development.md](../agents/database-development.md) - Schema Prisma
  - [agents/frontend-development.md](../agents/frontend-development.md) - Páginas de autenticação
  - [agents/qa-agent.md](../agents/qa-agent.md) - Testes de autenticação
  - [agents/security-check.md](../agents/security-check.md) - Revisão de segurança OAuth2

- **Documentação:**
  - [.context/inputs/PRD.md](../inputs/PRD.md) - Seção 2: Autenticação e SSO
  - [NextAuth.js Documentation](https://next-auth.js.org) - Documentação oficial
  - Hub: `docs/SPOKE_IMPLEMENTATION_GUIDE.md` - Guia de integração Spoke

- **Código de Referência:**
  - Hub: `src/app/api/auth/oauth/authorize/route.ts` - Endpoint de autorização
  - Hub: `src/app/api/auth/oauth/token/route.ts` - Endpoint de token
  - Hub: `src/app/api/auth/oauth/userinfo/route.ts` - Endpoint de userinfo
  - Hub: `prisma/schema.prisma` - Models OAuth2 e SpokeSubscription

---

## Validação Final

- [x] Todos os marcadores foram substituídos com informações específicas
- [x] Todas as referências aos agents estão corretas
- [x] Todos os caminhos de arquivos estão corretos
- [x] O diagrama Mermaid está correto e renderiza
- [x] O checklist está completo e específico
- [x] Seções não aplicáveis foram mantidas (todas são aplicáveis)
- [x] Nenhum código foi incluído - apenas orientações descritivas
- [x] Referências à documentação estão completas
- [x] Instruções são claras e acionáveis
