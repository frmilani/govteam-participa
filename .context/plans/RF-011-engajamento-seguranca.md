# Plano de Implementação: Engajamento e Segurança (RF-011)

Este plano define a implementação do módulo de Engajamento e Segurança para o sistema de votação `premio-destaque`. O objetivo é equilibrar a integridade do processo eleitoral (evitando fraudes e robôs) com a maximização da captura de dados (leads) através de gamificação.

## Visão Geral

O sistema permitirá:
- **Identificação e Validação (Core)**: Gate de entrada exigindo Nome, CPF e WhatsApp, com validação via OTP para votos "Sérios" (Modo `HIGH`).
- **Engajamento Gamificado (Bonus)**: Estratégia de "Progressive Profiling" onde o usuário ganha cupons para sorteios ao completar missões (validar e-mail, instagram, etc.).
- **Regra de Qualidade (70%)**: Feedback visual (Barra de Progresso) incentivando o preenchimento mínimo de 70% das categorias para validar o voto.
- **Modos de Atuação Flexíveis**: Suporte a enquetes Públicas (Livre ou Identificada), Restritas (Link Único) e Híbridas.

## Referências

- [Evolution API Docs](https://doc.evolution-api.com/v2/en) - Para envio de WhatsApp OTP.
- Documentação do projeto: [docs/README.md](../docs/README.md)
- Guias de agents: [agents/README.md](../agents/README.md)
- [docs/backend.md](../docs/backend.md) - Padrões de API routes
- [docs/frontend.md](../docs/frontend.md) - Padrões de componentes
- [docs/database.md](../docs/database.md) - Padrões de schema Prisma

## Arquitetura

```mermaid
graph TB
    Client[Client UI<br/>(Gate & Voting Page)]
    
    subgraph "Backend API"
        LeadsAPI[API Leads<br/>/api/leads]
        OtpAPI[API OTP<br/>/api/otp/*]
        VoteAPI[API Vote<br/>/api/tracking/submit]
    end
    
    subgraph "External Services"
        Evolution[Evolution API<br/>WhatsApp Sender]
    end
    
    subgraph "Database"
        DB[(PostgreSQL)]
    end
    
    Client -->|Identificação| LeadsAPI
    Client -->|Request OTP| OtpAPI
    OtpAPI -->|Send Code| Evolution
    Client -->|Verify OTP| OtpAPI
    OtpAPI -->|Update Status| DB
    Client -->|Submit Vote| VoteAPI
    VoteAPI -->|Validate 70%| DB
    
    style Client fill:#e1f5ff
    style Api fill:#fff4e1
    style DB fill:#e8f5e9
    style Evolution fill:#f3e5f5
```

**Notas sobre a arquitetura:**
- **Core vs. Bonus**: A validação de OTP é obrigatória para o voto contar (Core), mas a adição de e-mail/instagram é opcional e gera recompensas (Bonus).
- **Gate Lógico**: O "Gate" de identificação é exibido condicionalmente. Se o usuário chega via Hash (Modo Restrito), o Gate é pulado.
- **Persistência Local**: O progresso do formulário é salvo no `localStorage` para evitar perda de dados em formulários longos.

## Pré-requisitos

1. **Evolution API**: Instância configurada e conectada com um número de WhatsApp.
2. **Variáveis de Ambiente**: `EVOLUTION_API_URL` e `EVOLUTION_API_KEY`.

## Passo 1: Configuração Inicial

**Agent:** [agents/backend-development.md](../agents/backend-development.md)

### 1.1 Variáveis de Ambiente

Adicionar ao `.env` as variáveis necessárias:
- `EVOLUTION_API_URL` (obrigatória): URL da API do Evolution - Exemplo: `https://api.whatsapp.com`
- `EVOLUTION_API_KEY` (obrigatória): Chave de API Global - Exemplo: `global-api-key`

## Passo 2: Schema do Banco de Dados

**Agent:** [agents/database-development.md](../agents/database-development.md)

### 2.1 Adicionar/Modificar Modelos no Prisma Schema

**Lead**: Atualização do modelo existente
**Campos:**
- `cpf` (String?): CPF único por organização (validado por algoritmo no frontend).
- `cupons` (Int @default(0)): Contador de cupons para sorteio.

**Enquete**: Atualização do modelo existente
**Campos:**
- `securityLevel` (Enum: NONE, HIGH): Nível de segurança exigido.
- `minCompleteness` (Int @default(70)): Percentual mínimo para voto válido.
- `exigirIdentificacao` (Boolean @default(true)): Se false, permite modo anônimo (Livre).

**Resposta**: Atualização do modelo existente
**Campos:**
- `percentualConclusao` (Float): Percentual preenchido no momento do envio.
- `votoValido` (Boolean): Se atendeu aos critérios de validação (OTP + 70%).
- `otpVerified` (Boolean @default(false)): Se o OTP foi validado.

**Indices:**
- `@@unique([organizationId, cpf])` no modelo Lead.

### 2.2 Executar Migração

Executar migração usando `npm run db:migrate`.

## Passo 3: Criar Serviços (Server-Side Logic)

**Agent:** [agents/backend-development.md](../agents/backend-development.md)

### 3.1 Serviço OTP (WhatsApp)

Criar `src/lib/whatsapp/otp-service.ts`:

**Função Principal:** `sendOtp(phone: string): Promise<void>`
**Lógica:**
1. Gerar código numérico de 6 dígitos.
2. Salvar código no Redis/Banco com expiração (5 min).
3. Chamar Evolution API para enviar mensagem.

**Função Principal:** `verifyOtp(phone: string, code: string): Promise<boolean>`
**Lógica:**
1. Buscar código no Redis/Banco.
2. Comparar com código recebido.
3. Se válido, marcar `Lead` como verificado e adicionar cupons (+2).

## Passo 4: API Routes

**Agent:** [agents/backend-development.md](../agents/backend-development.md)

### 4.1 OTP Send - POST

Criar `src/app/api/otp/send/route.ts`:
- **Endpoint:** `POST /api/otp/send`
- **Body:** `{ phone: string }`
- **Lógica:** Chama `otp-service.sendOtp`.
- **Resposta:** `200 OK`.

### 4.2 OTP Verify - POST

Criar `src/app/api/otp/verify/route.ts`:
- **Endpoint:** `POST /api/otp/verify`
- **Body:** `{ phone: string, code: string }`
- **Lógica:** Chama `otp-service.verifyOtp`. Se sucesso, gera token de sessão/cookie.
- **Resposta:** `200 OK` + Token.

### 4.3 Leads Partial - POST

Criar `src/app/api/leads/partial/route.ts`:
- **Endpoint:** `POST /api/leads/partial`
- **Body:** `{ nome, whatsapp, cpf, email?, instagram? }`
- **Lógica:** Cria ou atualiza Lead. Calcula cupons baseados nos campos preenchidos.
- **Resposta:** `200 OK` + `{ leadId, cupons }`.

## Passo 5: Interface Frontend

**Agent:** [agents/frontend-development.md](../agents/frontend-development.md)

### 5.1 Componente GamifiedGate

Criar `src/components/voting/GamifiedGate.tsx`:
- **Estado 1 (Identificação)**: Inputs Nome, CPF, WhatsApp. Botão "Iniciar".
- **Estado 2 (Missões)**: Cards interativos.
    - "Você ganhou 1 cupom! 🎟️"
    - "Valide seu WhatsApp para ganhar +2 cupons 🔒"
    - "Siga no Instagram para ganhar +1 cupom 📸"
- **Estado 3 (OTP)**: Input 6 dígitos.

### 5.2 Barra de Progresso e Persistência

Atualizar `src/app/(public)/vote/[hash]/page.tsx`:
- Adicionar `ProgressBar` no topo (fixed).
- Implementar lógica que conta campos preenchidos vs total.
- Mostrar mensagens de incentivo: "Falta pouco para concorrer a prêmios!".
- **Persistence:** Usar `useEffect` para salvar `formData` no `localStorage` e recuperar no mount.

## Passo 8: Testes

**Agent:** [agents/qa-agent.md](../agents/qa-agent.md)

### 8.1 Testes de Fluxo
**Cenário 1: Voto Seguro (Public High)**
1. Acessar link público.
2. Verificar Gate de Identificação.
3. Preencher CPF/Whats.
4. Receber e validar OTP.
5. Votar em < 70% -> Tentar enviar -> Ver alerta.
6. Votar em > 70% -> Enviar -> Sucesso (Voto Válido).

**Cenário 2: Gamificação**
1. Identificar-se.
2. Verificar contador de cupons (1).
3. Completar missão (Email).
4. Verificar contador de cupons (2).

## Checklist de Implementação

### Setup
- [ ] Configurar Evolution API Keys

### Banco de Dados
- [ ] Atualizar Schema (Lead, Enquete, Resposta)
- [ ] Migrar Banco

### Backend
- [ ] Serviço de OTP (Geração + Envio)
- [ ] API Route `otp/send`
- [ ] API Route `otp/verify`
- [ ] API Route `leads/partial`

### Frontend
- [ ] Componente `GamifiedGate`
- [ ] Componente `ProgressBar` (com lógica 70%)
- [ ] Integração com `localStorage`
- [ ] Página de Votação atualizada com Gate condicional

### Qualidade
- [ ] Validar fluxo E2E (Identificação -> Voto -> Sucesso)
- [ ] Testar persistência de dados (Refresh page)
