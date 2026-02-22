# Plano de Implementação: Controle de Limites (Spoke Subscription)

Sistema de validação de limites do plano antes de criar recursos, integração com SpokeSubscription do Hub, indicadores visuais de uso, e bloqueios automáticos ao atingir limites.

## Visão Geral

- **Buscar Configuração do Plano**: Consultar Hub para obter limites e features
- **Validação Pré-criação**: Verificar limite antes de criar lead, estabelecimento, campanha
- **Indicadores Visuais**: Barras de progresso mostrando uso atual vs limite
- **Bloqueios Automáticos**: Impedir criação ao atingir limite com mensagem de upgrade
- **Cache de Config**: Cachear configuração do plano para reduzir chamadas ao Hub

## Referências

- PRD Seção 7.4: [.context/inputs/PRD.md](../inputs/PRD.md#74-integração-com-spoke-subscription)
- Hub: `prisma/schema.prisma` - Modelo SpokeSubscription
- [agents/backend-development.md](../agents/backend-development.md)

## Pré-requisitos

1. **RF-001 Implementado**: organizationId disponível
2. **Hub Configurado**: Spoke registrado no Hub
3. **API Key Interna**: Para chamadas service-to-service

## Passo 1: Cliente da API Interna do Hub

**Agent:** [agents/backend-development.md](../agents/backend-development.md)

### 1.1 Spoke Config Client

Criar `src/lib/hub/spoke-config-client.ts` (server-only):

**Função: getSpokeConfig**
- Parâmetros: `organizationId` (string)
- Endpoint: `GET ${HUB_INTERNAL_URL}/api/internal/spokes/premio-destaque/config`
- Headers: `x-organization-id`, `x-api-key` (internal)
- Retorno: Objeto com {plan, limits, features, config}
- Cache: Redis com TTL de 15 minutos
- Tratamento de erros: Se Hub offline, usar valores padrão conservadores

**Estrutura de Resposta**:
```typescript
{
  organizationId: string
  spokeType: "premio-destaque"
  plan: "starter" | "professional" | "enterprise"
  isActive: boolean
  limits: {
    maxLeads: number
    maxCampanhas: number
    maxEstabelecimentos: number
    maxEnquetesAtivas: number
    maxRespostasPorMes: number
  }
  features: {
    whatsappIntegration: boolean
    certificadosDigitais: boolean
    analyticsAvancado: boolean
    customDomain: boolean
    apiAccess: boolean
  }
  config: {
    brandColor: string
    logoUrl: string
  }
}
```

## Passo 2: Serviço de Validação de Limites

**Agent:** [agents/backend-development.md](../agents/backend-development.md)

### 2.1 Limits Service

Criar `src/lib/limits/limits-service.ts` (server-only):

**Função: checkLimit**
- Parâmetros: `organizationId`, `resource` ("leads" | "campanhas" | "estabelecimentos" | "enquetes"), `currentCount` (number)
- Lógica:
  1. Buscar config do plano via `getSpokeConfig(organizationId)`
  2. Obter limite para o recurso
  3. Se `currentCount >= limit`, lançar `PlanLimitError`
  4. Retornar true se dentro do limite

**Função: getUsageStats**
- Parâmetros: `organizationId`
- Retorno: Objeto com uso atual e limites de cada recurso
- Formato: `{leads: {current: 50, limit: 100, percentage: 50}, ...}`

**Função: checkFeature**
- Parâmetros: `organizationId`, `feature` (string)
- Retorno: boolean indicando se feature está habilitada

**Classe: PlanLimitError**
- Extends Error
- Propriedades: `resource`, `limit`, `current`, `plan`
- Mensagem: "Limite de {limit} {resource} atingido. Faça upgrade do plano."

## Passo 3: Integração nos Serviços

**Agent:** [agents/backend-development.md](../agents/backend-development.md)

### 3.1 Atualizar Serviços Existentes

**lead-service.ts**:
- Em `createLead()`, antes de criar:
  ```typescript
  const currentCount = await prisma.lead.count({where: {organizationId}})
  await checkLimit(organizationId, 'leads', currentCount)
  ```

**estabelecimento-service.ts**:
- Em `createEstabelecimento()`, validar limite

**campanha-service.ts**:
- Em `createCampanha()`, validar limite
- Considerar limite mensal (contar campanhas do mês atual)

**enquete-service.ts**:
- Em `createEnquete()`, validar limite de enquetes ativas
- Contar apenas enquetes com status PUBLICADA

### 3.2 Tratamento de Erros

Nas API routes, capturar `PlanLimitError`:
```typescript
try {
  await createLead(data, organizationId)
} catch (error) {
  if (error instanceof PlanLimitError) {
    return NextResponse.json({
      error: error.message,
      limit: error.limit,
      current: error.current,
      plan: error.plan,
      upgradeUrl: "/configuracoes/billing"
    }, {status: 409})
  }
  throw error
}
```

## Passo 4: API Routes

**Agent:** [agents/backend-development.md](../agents/backend-development.md)

### 4.1 Buscar Configuração do Plano

Criar `src/app/api/subscription/config/route.ts`:

**Endpoint:** `GET /api/subscription/config`

**Lógica:**
1. Extrair organizationId
2. Chamar `getSpokeConfig(organizationId)`
3. Retornar configuração

**Respostas:**
- `200 OK`: Configuração do plano

### 4.2 Buscar Estatísticas de Uso

Criar `src/app/api/subscription/usage/route.ts`:

**Endpoint:** `GET /api/subscription/usage`

**Lógica:**
1. Extrair organizationId
2. Chamar `getUsageStats(organizationId)`
3. Retornar estatísticas

**Respostas:**
- `200 OK`: Estatísticas de uso

## Passo 5: Frontend

**Agent:** [agents/frontend-development.md](../agents/frontend-development.md)

### 5.1 Hook de Subscription

Criar `src/hooks/use-subscription.ts`:

**useSubscriptionConfig**: Buscar configuração do plano
- Query key: `['subscription', 'config', organizationId]`
- API: `GET /api/subscription/config`
- staleTime: 15 minutos

**useUsageStats**: Buscar estatísticas de uso
- Query key: `['subscription', 'usage', organizationId]`
- API: `GET /api/subscription/usage`
- staleTime: 1 minuto

### 5.2 Componente de Indicador de Limite

Criar `src/components/admin/LimitIndicator.tsx`:

**Props**:
- `resource` (string): Nome do recurso
- `current` (number): Uso atual
- `limit` (number): Limite do plano
- `upgradeUrl` (string): URL para upgrade

**Implementação**:
- Barra de progresso colorida
- Verde: < 70%
- Amarelo: 70-90%
- Vermelho: > 90%
- Texto: "{current} / {limit} {resource}"
- Botão "Upgrade" se > 90%

### 5.3 Modal de Limite Atingido

Criar `src/components/admin/LimitReachedModal.tsx`:

**Props**:
- `resource` (string)
- `limit` (number)
- `plan` (string)
- `onClose` (função)

**Implementação**:
- Ícone de alerta
- Mensagem: "Você atingiu o limite de {limit} {resource} do plano {plan}"
- Comparação de planos
- Botão "Fazer Upgrade"
- Botão "Cancelar"

### 5.4 Integração no Dashboard

Atualizar `src/app/(admin)/admin/dashboard/page.tsx`:

**Seção de Uso do Plano**:
- Card com título "Uso do Plano"
- Indicadores para cada recurso (leads, campanhas, estabelecimentos)
- Link para página de billing

### 5.5 Validação Pré-criação

Nos formulários de criação:
- Antes de abrir modal, verificar limite
- Se limite atingido, exibir `LimitReachedModal`
- Não permitir criação

## Passo 6: Testes

**Agent:** [agents/qa-agent.md](../agents/qa-agent.md)

### 6.1 Validação de Limites

**Cenário 1: Criar dentro do limite**
1. Plano com limite de 100 leads
2. Organização tem 50 leads
3. Tentar criar novo lead
4. **Resultado**: Lead criado com sucesso

**Cenário 2: Atingir limite**
1. Plano com limite de 100 leads
2. Organização tem 100 leads
3. Tentar criar novo lead
4. Verificar erro 409
5. Verificar modal de upgrade
6. **Resultado**: Criação bloqueada

**Cenário 3: Indicadores visuais**
1. Acessar dashboard
2. Verificar indicadores de uso
3. Verificar cores apropriadas
4. **Resultado**: Indicadores corretos

### 6.2 Cache de Configuração

**Cenário 1: Cache funcionando**
1. Buscar config do plano
2. Verificar chamada ao Hub
3. Buscar novamente em < 15 min
4. Verificar que não chamou Hub
5. **Resultado**: Cache reduzindo chamadas

## Checklist

- [ ] Criar spoke-config-client.ts
- [ ] Implementar getSpokeConfig()
- [ ] Criar limits-service.ts
- [ ] Implementar checkLimit()
- [ ] Implementar getUsageStats()
- [ ] Criar PlanLimitError class
- [ ] Atualizar lead-service com validação
- [ ] Atualizar estabelecimento-service
- [ ] Atualizar campanha-service
- [ ] Atualizar enquete-service
- [ ] Implementar API routes
- [ ] Criar hook useSubscriptionConfig
- [ ] Criar hook useUsageStats
- [ ] Criar LimitIndicator
- [ ] Criar LimitReachedModal
- [ ] Atualizar dashboard
- [ ] Integrar validação nos formulários
- [ ] Testar limites
- [ ] Testar indicadores
- [ ] Testar cache

## Notas

1. **Cache Importante**: Cachear config para não sobrecarregar Hub
2. **Fallback**: Se Hub offline, usar limites conservadores (ex: 10 de cada)
3. **Mensagens Claras**: Sempre indicar qual limite foi atingido e qual plano atual
4. **UX**: Mostrar indicadores ANTES de atingir limite (avisar em 90%)
5. **Billing**: Link para upgrade deve levar para página de planos
6. **Features**: Validar features antes de exibir funcionalidades premium
