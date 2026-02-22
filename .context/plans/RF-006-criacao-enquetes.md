# Plano de Implementação: Criação de Enquetes

Sistema de criação e gestão de enquetes vinculadas a formulários do Hub, com personalização visual completa, configuração de expiração de links, e controle de status (rascunho, publicada, pausada, encerrada).

## Visão Geral

- **Seleção de Formulário**: Escolher formulário existente no Hub via dropdown
- **Personalização Visual**: Configurar logo, cores, banner e template da landing page
- **Gestão de Status**: Controlar ciclo de vida (rascunho → publicada → pausada/encerrada)
- **Página de Agradecimento**: Customizar mensagem e ações pós-votação
- **Expiração de Links**: Configurar validade dos tracking links (padrão 30 dias)

## Referências

- PRD Seção 4.1: [.context/inputs/PRD.md](../inputs/PRD.md#enquetes)
- [agents/backend-development.md](../agents/backend-development.md)
- [agents/frontend-development.md](../agents/frontend-development.md)

## Pré-requisitos

1. **RF-001 a RF-005 Implementados**
2. **Formulários no Hub**: Pelo menos um formulário com storageMode=LOCAL

## Passo 1: Schema

**Agent:** [agents/database-development.md](../agents/database-development.md)

**Modelo Enquete**:
- `id`, `organizationId`, `titulo`, `descricao`
- `formPublicId` (string): ID público do formulário no Hub
- `hubFormId` (string): ID interno para analytics
- `configVisual` (Json): {logo, cores, banner, template}
- `paginaAgradecimento` (Json): {titulo, mensagem, botoes}
- `status` (EnqueteStatus): RASCUNHO, PUBLICADA, PAUSADA, ENCERRADA
- `linkExpiracaoDias` (Int @default(30))
- `criadoPor`, `criadoEm`, `publicadoEm`, `encerramentoEm`
- Relações: `campanhas[]`, `respostas[]`
- Índices: `[organizationId]`, `[organizationId, status]`
- Constraint: `@@unique([organizationId, formPublicId])`

**Enum EnqueteStatus**: RASCUNHO, PUBLICADA, PAUSADA, ENCERRADA

Migração: `npx prisma migrate dev --name add-enquete-model`

## Passo 2: Serviços

**Agent:** [agents/backend-development.md](../agents/backend-development.md)

Criar `src/lib/enquetes/enquete-service.ts`:

**getEnquetes**: Listar com filtros (status, search)
**getEnquete**: Buscar por ID com campanhas e estatísticas
**createEnquete**: Criar com validação de formulário no Hub
**updateEnquete**: Atualizar configurações
**publishEnquete**: Alterar status para PUBLICADA
**pauseEnquete**: Alterar status para PAUSADA
**closeEnquete**: Alterar status para ENCERRADA
**validateFormExists**: Verificar que formulário existe no Hub

## Passo 3: API Routes

**Agent:** [agents/backend-development.md](../agents/backend-development.md)

- `GET /api/enquetes`: Listar
- `POST /api/enquetes`: Criar
- `GET /api/enquetes/[id]`: Buscar uma
- `PUT /api/enquetes/[id]`: Atualizar
- `PATCH /api/enquetes/[id]/publish`: Publicar
- `PATCH /api/enquetes/[id]/pause`: Pausar
- `PATCH /api/enquetes/[id]/close`: Encerrar

## Passo 4: Frontend

**Agent:** [agents/frontend-development.md](../agents/frontend-development.md)

### 4.1 Página de Enquetes

`src/app/(admin)/admin/enquetes/page.tsx`:
- Cards com status, título, formulário vinculado
- Filtros por status
- Botão "Nova Enquete"
- Ações: Ver Resultados, Editar, Publicar/Pausar, Nova Campanha

### 4.2 Wizard de Criação

`src/components/admin/enquete-wizard.tsx`:

**Steps**:
1. **Informações Básicas**: Título, descrição, formulário (select)
2. **Personalização Visual**: Logo, cores primária/secundária, banner
3. **Página de Agradecimento**: Título, mensagem, botões de ação
4. **Configurações**: Dias de expiração, preview

### 4.3 Seletor de Formulário

`src/components/admin/form-selector.tsx`:
- Buscar formulários do Hub via API
- Exibir apenas formulários com storageMode=LOCAL
- Preview do formulário ao selecionar

### 4.4 Hooks

`src/hooks/use-enquetes.ts`:
- `useEnquetes()`, `useEnquete()`, `useCreateEnquete()`
- `useUpdateEnquete()`, `usePublishEnquete()`, `usePauseEnquete()`, `useCloseEnquete()`

## Passo 5: Testes

**Cenário 1: Criar enquete**
1. Clicar "Nova Enquete"
2. Seguir wizard
3. Selecionar formulário do Hub
4. Personalizar visual
5. Salvar como rascunho
6. **Resultado**: Enquete criada

**Cenário 2: Publicar enquete**
1. Selecionar enquete em rascunho
2. Clicar "Publicar"
3. Confirmar
4. **Resultado**: Status alterado para PUBLICADA

## Checklist

- [ ] Adicionar modelo Enquete
- [ ] Implementar enquete-service.ts
- [ ] Implementar todas as API routes
- [ ] Criar página de enquetes
- [ ] Criar wizard de criação
- [ ] Criar seletor de formulário
- [ ] Implementar hooks
- [ ] Testar ciclo de vida completo

## Notas

1. **Formulário Único**: Cada formulário do Hub pode ter apenas 1 enquete ativa por organização
2. **Validação de Publicação**: Só permitir publicar se houver estabelecimentos cadastrados
3. **Pausar vs Encerrar**: Pausada pode ser retomada, encerrada é final
4. **Preview**: Sempre mostrar preview da landing page antes de publicar
