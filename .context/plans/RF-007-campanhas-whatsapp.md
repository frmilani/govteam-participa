# Plano de Implementação: Campanhas WhatsApp

Sistema completo de criação e disparo de campanhas WhatsApp com geração de tracking links únicos, segmentação de leads por tags, agendamento, e monitoramento de status de envio via BullMQ.

## Visão Geral

- **Wizard de Criação**: Fluxo guiado para criar campanha (enquete → leads → mensagem → agendamento)
- **Tracking Links**: Gerar hash único para cada lead com rastreamento de visualização e resposta
- **Segmentação**: Filtrar leads por tags, status de verificação, ou importar CSV específico
- **Template de Mensagem**: Suportar merge fields ({{nome}}, {{link_unico}})
- **Disparo via BullMQ**: Fila de jobs com controle de taxa e retry automático
- **Integração Evolution API**: Enviar mensagens via API WhatsApp

## Referências

- PRD Seção 4.1: [.context/inputs/PRD.md](../inputs/PRD.md#campanhas-e-tracking)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [agents/backend-development.md](../agents/backend-development.md)

## Pré-requisitos

1. **RF-004 Implementado**: Leads cadastrados
2. **RF-006 Implementado**: Enquete publicada
3. **Evolution API Configurada**: URL e API key
4. **Redis Configurado**: Para BullMQ
5. **BullMQ Instalado**: Worker rodando

## Passo 1: Dependências

- `bullmq@5.1.0`: Sistema de filas
- `nanoid@5.0.4`: Geração de hashes curtos

## Passo 2: Schema

**Modelo Campanha**:
- `id`, `organizationId`, `nome`, `enqueteId`
- `templateMensagem` (String): Template com merge fields
- `midiaUrl` (String?): URL de imagem/vídeo opcional
- `segmentacao` (Json): {tipo, tagIds, leadIds}
- `agendadoPara` (DateTime?), `intervaloSegundos` (Int @default(5))
- `status` (CampanhaStatus): RASCUNHO, AGENDADA, EM_ANDAMENTO, CONCLUIDA, CANCELADA
- Contadores: `totalLeads`, `totalEnviados`, `totalVisualizados`, `totalRespondidos`, `totalFalhados`
- `criadoEm`, `iniciadoEm`, `finalizadoEm`, `criadoPor`
- Relações: `enquete`, `trackingLinks[]`

**Modelo TrackingLink**:
- `id`, `campanhaId`, `leadId`
- `hash` (String @unique): 8 caracteres
- `formPublicId`: ID do formulário
- `enviadoEm`, `visualizadoEm`, `respondidoEm`, `expiraEm`
- `status` (LinkStatus): NAO_ENVIADO, ENVIADO, VISUALIZADO, RESPONDIDO, EXPIRADO
- Relação: `resposta?`

Migração: `npx prisma migrate dev --name add-campanha-models`

## Passo 3: Serviços

### 3.1 Tracking Service

`src/lib/campanhas/tracking-service.ts`:

**generateTrackingLinks**: Gerar links para array de leads
- Criar hash único de 8 chars com nanoid
- Calcular data de expiração baseada em enquete.linkExpiracaoDias
- Criar registros TrackingLink em batch

**validateTrackingLink**: Validar hash
- Verificar que existe e não expirou
- Verificar que não foi usado (status != RESPONDIDO)
- Retornar tracking link com lead e enquete

**registerView**: Registrar visualização
- Atualizar `visualizadoEm` e status para VISUALIZADO

**registerResponse**: Registrar resposta
- Atualizar `respondidoEm` e status para RESPONDIDO

### 3.2 Campanha Service

`src/lib/campanhas/campanha-service.ts`:

**createCampanha**: Criar campanha
- Validar enquete está publicada
- Validar leads existem
- Gerar tracking links
- Criar campanha com status RASCUNHO

**startCampanha**: Iniciar envio
- Alterar status para EM_ANDAMENTO
- Adicionar jobs na fila BullMQ (um por lead)
- Atualizar `iniciadoEm`

**scheduleCampanha**: Agendar campanha
- Alterar status para AGENDADA
- Criar job agendado no BullMQ

**getCampanhaStats**: Buscar estatísticas
- Contar links por status
- Calcular taxa de conversão

### 3.3 WhatsApp Service

`src/lib/whatsapp/whatsapp-client.ts`:

**sendMessage**: Enviar mensagem via Evolution API
- Endpoint: `POST /message/sendText/:instance`
- Body: {number, textMessage: {text}, options: {delay, presence}}
- Retry automático em caso de falha

**checkInstanceStatus**: Verificar status da instância
- Endpoint: `GET /instance/:instance/status`
- Retornar se conectada

## Passo 4: BullMQ Workers

Criar `jobs/send-whatsapp.ts`:

**Worker: send-whatsapp-queue**
- Processar job com {trackingLinkId, message}
- Buscar tracking link e lead
- Substituir merge fields no template
- Enviar via WhatsApp
- Atualizar status do tracking link
- Incrementar contadores da campanha
- Retry: 3 tentativas com backoff exponencial

**Configuração**:
- Concurrency: 1 (enviar um por vez)
- Rate limit: Configurável por organização
- Delay entre mensagens: `campanha.intervaloSegundos`

## Passo 5: API Routes

- `GET /api/campanhas`: Listar
- `POST /api/campanhas`: Criar
- `GET /api/campanhas/[id]`: Buscar com estatísticas
- `POST /api/campanhas/[id]/start`: Iniciar envio
- `POST /api/campanhas/[id]/schedule`: Agendar
- `PATCH /api/campanhas/[id]/cancel`: Cancelar
- `GET /api/tracking/[hash]`: Validar tracking link (público)
- `POST /api/tracking/[hash]/view`: Registrar visualização (público)

## Passo 6: Frontend

### 6.1 Wizard de Campanha

`src/components/admin/campanha-wizard.tsx`:

**Steps**:
1. **Selecionar Enquete**: Dropdown de enquetes publicadas
2. **Segmentar Leads**: Tags, todos, ou upload CSV
3. **Escrever Mensagem**: Template com merge fields, preview
4. **Agendar**: Imediato ou data/hora futura
5. **Revisar**: Resumo e confirmação

**Preview de Mensagem**:
- Substituir merge fields com dados de exemplo
- Exibir como aparecerá no WhatsApp

### 6.2 Página de Campanhas

`src/app/(admin)/admin/campanhas/page.tsx`:
- Cards com status, nome, enquete, estatísticas
- Filtros por status
- Ações: Ver Detalhes, Cancelar (se em andamento)

### 6.3 Detalhes da Campanha

`src/app/(admin)/admin/campanhas/[id]/page.tsx`:
- Estatísticas: Total, Enviados, Visualizados, Respondidos, Falhados
- Taxa de conversão
- Gráfico de progresso
- Lista de tracking links com status
- Logs de envio

### 6.4 Hooks

`src/hooks/use-campanhas.ts`:
- `useCampanhas()`, `useCampanha()`, `useCreateCampanha()`
- `useStartCampanha()`, `useScheduleCampanha()`, `useCancelCampanha()`

## Passo 7: Testes

**Cenário 1: Criar e iniciar campanha**
1. Criar campanha para 10 leads
2. Escrever template com merge fields
3. Iniciar envio imediato
4. Verificar jobs criados no BullMQ
5. Verificar mensagens enviadas
6. **Resultado**: 10 mensagens enviadas com links únicos

**Cenário 2: Agendar campanha**
1. Criar campanha
2. Agendar para daqui 1 hora
3. Verificar status AGENDADA
4. Aguardar horário
5. Verificar que iniciou automaticamente
6. **Resultado**: Campanha executada no horário

**Cenário 3: Tracking de links**
1. Lead recebe mensagem
2. Clica no link
3. Verificar visualização registrada
4. Submete formulário
5. Verificar resposta registrada
6. **Resultado**: Status atualizado corretamente

## Checklist

- [ ] Instalar BullMQ e nanoid
- [ ] Adicionar modelos Campanha e TrackingLink
- [ ] Implementar tracking-service.ts
- [ ] Implementar campanha-service.ts
- [ ] Implementar whatsapp-client.ts
- [ ] Criar worker BullMQ
- [ ] Implementar API routes
- [ ] Criar wizard de campanha
- [ ] Criar página de detalhes
- [ ] Implementar hooks
- [ ] Testar envio completo
- [ ] Testar agendamento
- [ ] Testar tracking

## Notas

1. **Rate Limiting**: Respeitar limites da Evolution API (recomendado 1 msg/5s)
2. **Retry Logic**: Máximo 3 tentativas com backoff exponencial
3. **Hash Único**: Usar nanoid para gerar hashes curtos e únicos
4. **Expiração**: Links expiram após N dias configurados na enquete
5. **Opt-out**: NUNCA enviar para leads com optOut=true
6. **Merge Fields**: Suportar {{nome}}, {{link_unico}}, {{enquete_titulo}}
