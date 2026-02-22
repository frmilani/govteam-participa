# Setup do Projeto - Prêmio Destaque

## Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 15+ rodando
- FormBuilder Hub configurado e acessível
- Spoke registrado no Hub com `clientId` e `clientSecret`

## Instalação

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas configurações:

```env
# Database - Configure sua conexão PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/premio_destaque"

# NextAuth - Gere o secret com: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"

# FormBuilder Hub Integration
HUB_URL="https://formbuilder.plataforma.com"
HUB_INTERNAL_URL="http://hub:3000"
HUB_CLIENT_ID="spoke-premio-destaque"
HUB_CLIENT_SECRET="secret-fornecido-pelo-hub"

# Storage (MinIO/S3) - Configurar depois
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET="premio-destaque"
S3_REGION="us-east-1"

# Redis - Configurar depois
REDIS_URL="redis://localhost:6379"

# WhatsApp (Evolution API) - Configurar depois
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="your-evolution-api-key"
```

### 3. Configurar Banco de Dados

Gere o Prisma Client:

```bash
npm run db:generate
```

Crie as tabelas no banco (push schema):

```bash
npm run db:push
```

Ou crie uma migração (recomendado para produção):

```bash
npm run db:migrate
```

### 4. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## Verificação da Instalação

### Testar Autenticação SSO

1. Acesse `http://localhost:3000`
2. Clique em "Acessar Painel"
3. Você será redirecionado para `/auth/signin`
4. Clique em "Entrar com FormBuilder Hub"
5. Faça login no Hub
6. Você deve ser redirecionado de volta para `/admin`

### Verificar Sessão

Acesse `http://localhost:3000/api/auth/session` para ver os dados da sessão:

```json
{
  "user": {
    "name": "Seu Nome",
    "email": "seu@email.com",
    "organizationId": "org_123",
    "organizationName": "Sua Organização",
    "role": "ORG_ADMIN"
  },
  "expires": "2024-02-01T00:00:00.000Z"
}
```

## Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Compila para produção
npm run start            # Inicia servidor de produção
npm run lint             # Executa linter
npm run typecheck        # Verifica tipos TypeScript

# Banco de Dados
npm run db:generate      # Gera Prisma Client
npm run db:push          # Sincroniza schema com banco (dev)
npm run db:migrate       # Cria migração
npm run db:studio        # Abre Prisma Studio (GUI)
```

## Estrutura do Projeto

```
premio-destaque/
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── src/
│   ├── app/
│   │   ├── (auth)/            # Rotas de autenticação
│   │   │   ├── signin/
│   │   │   └── error/
│   │   ├── admin/             # Rotas protegidas
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/  # NextAuth endpoints
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── providers/
│   │       └── session-provider.tsx
│   ├── hooks/
│   │   └── use-auth.ts        # Hook de autenticação
│   ├── lib/
│   │   ├── auth.config.ts     # Configuração NextAuth
│   │   ├── auth-helpers.ts    # Helpers server-side
│   │   ├── prisma.ts          # Cliente Prisma
│   │   └── utils.ts           # Utilitários
│   └── middleware.ts          # Middleware de autenticação
├── .env.local                 # Variáveis de ambiente (não commitado)
├── .env.example               # Exemplo de variáveis
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Troubleshooting

### Erro: "Organization ID not found in profile"

**Causa:** O Spoke não está registrado corretamente no Hub ou o Hub não está retornando `org_id` no profile.

**Solução:**
1. Verifique se o Spoke está cadastrado em `/sys/spokes` no Hub
2. Verifique se o `clientId` e `clientSecret` estão corretos
3. Verifique os logs do Hub para erros OAuth2

### Erro: "Cannot find module '@prisma/client'"

**Causa:** Prisma Client não foi gerado.

**Solução:**
```bash
npm run db:generate
```

### Erro de conexão com o banco

**Causa:** PostgreSQL não está rodando ou `DATABASE_URL` está incorreta.

**Solução:**
1. Verifique se o PostgreSQL está rodando
2. Verifique a string de conexão em `.env.local`
3. Teste a conexão: `psql -U user -d premio_destaque`

### Redirecionamento infinito no login

**Causa:** `NEXTAUTH_URL` não está configurada ou está incorreta.

**Solução:**
1. Verifique se `NEXTAUTH_URL` está definida em `.env.local`
2. Certifique-se que a URL corresponde ao ambiente (localhost em dev)

## Próximos Passos

Após a instalação bem-sucedida:

1. ✅ **RF-001: Autenticação SSO** - Implementado
2. ⏳ **RF-002: Gestão de Segmentos** - Próximo
3. ⏳ **RF-003: Gestão de Estabelecimentos**
4. ⏳ **RF-004: Gestão de Leads**
5. ⏳ **RF-005: Integração com Hub**

Consulte `feature_list.json` para o progresso completo.

## Suporte

Para dúvidas ou problemas:
- Consulte a documentação em `.context/docs/`
- Revise o PRD em `.context/inputs/PRD.md`
- Verifique os planos de implementação em `.context/plans/`
