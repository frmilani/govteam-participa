# API Reference - Prêmio Destaque

> **Spoke:** premio-destaque
> **Base URL:** `https://{organization}.premio.aios.gov.br`
> **Versão:** v1
> **Última atualização:** 2026-02-14

---

## 📋 Endpoints Principais (54 total)

### ENQUETES

**GET /api/enquetes** - Lista enquetes (admin, HPAC)
**POST /api/enquetes** - Cria enquete
**GET /api/enquetes/{id}** - Detalhes
**PATCH /api/enquetes/{id}** - Atualiza
**DELETE /api/enquetes/{id}** - Exclui
**POST /api/enquetes/{id}/duplicate** - Duplica
**GET /api/enquetes/{id}/resultados** - Resultados
**GET /api/enquetes/{id}/rankings** - Rankings
**POST /api/enquetes/{id}/sorteio** - Sortear vencedores
**GET /api/enquetes/{id}/winners** - Lista vencedores

**GET /api/enquetes/public/{slug}/resultados** - Resultados públicos
**GET /api/enquetes/public/{slug}/winners** - Vencedores públicos

### ESTABELECIMENTOS

**GET /api/estabelecimentos** - Lista (admin)
**POST /api/estabelecimentos** - Cria
**GET /api/estabelecimentos/{id}** - Detalhes
**PATCH /api/estabelecimentos/{id}** - Atualiza
**DELETE /api/estabelecimentos/{id}** - Exclui
**POST /api/estabelecimentos/{id}/toggle** - Ativa/desativa
**POST /api/estabelecimentos/import** - Importa CSV/Excel

**GET /api/public/candidates** - Lista públicos

### LEADS

**GET /api/leads** - Lista (admin)
**POST /api/leads** - Cria
**POST /api/leads/partial** - Cria parcial (público)
**GET /api/leads/{id}** - Detalhes
**PATCH /api/leads/{id}** - Atualiza
**DELETE /api/leads/{id}** - Exclui
**POST /api/leads/{id}/opt-out** - Opt-out LGPD
**POST /api/leads/check-duplicate** - Verifica duplicado
**POST /api/leads/import** - Importa CSV
**GET /api/leads/{id}/lucky-numbers** - Cupons do lead

### OTP (Verificação)

**POST /api/otp/send** - Envia código OTP
**POST /api/otp/verify** - Valida código

### TRACKING

**GET /api/tracking/{hash}/validate** - Valida link
**POST /api/tracking/{hash}/view** - Registra visualização
**POST /api/tracking/{hash}/submit** - Submete voto

### CAMPANHAS WhatsApp

**GET /api/campanhas** - Lista campanhas
**POST /api/campanhas** - Cria campanha
**GET /api/campanhas/{id}** - Detalhes
**PATCH /api/campanhas/{id}** - Atualiza
**DELETE /api/campanhas/{id}** - Exclui
**POST /api/campanhas/{id}/start** - Inicia envio
**POST /api/campanhas/{id}/pause** - Pausa
**POST /api/campanhas/{id}/cancel** - Cancela

### WHATSAPP INSTANCES

**GET /api/whatsapp/instances** - Lista instâncias
**POST /api/whatsapp/instances** - Cria instância
**GET /api/whatsapp/instances/{id}** - Detalhes
**DELETE /api/whatsapp/instances/{id}** - Remove
**POST /api/whatsapp/instances/{id}/connect** - Conecta
**POST /api/whatsapp/instances/{id}/disconnect** - Desconecta
**GET /api/whatsapp/instances/{id}/status** - Status

**POST /api/webhooks/whatsapp** - Webhook Evolution API

### SEGMENTOS

**GET /api/segmentos** - Lista segmentos
**POST /api/segmentos** - Cria
**GET /api/segmentos/{id}** - Detalhes
**PATCH /api/segmentos/{id}** - Atualiza
**DELETE /api/segmentos/{id}** - Exclui
**POST /api/segmentos/reorder** - Reordena

### TAGS

**GET /api/tags** - Lista tags
**POST /api/tags** - Cria
**GET /api/tags/{id}** - Detalhes
**DELETE /api/tags/{id}** - Exclui

### ANALYTICS

**POST /api/analytics/track** - Track evento
**GET /api/enquetes/{id}/analytics/overview** - Visão geral
**GET /api/enquetes/{id}/metrics** - Métricas
**GET /api/enquetes/{id}/audit/votes** - Auditoria de votos
**POST /api/enquetes/{id}/audit/batch-action** - Ação em lote

---

## 📊 Códigos de Status

200 - Sucesso
201 - Criado
400 - Requisição inválida
401 - Não autenticado
403 - Não autorizado (HPAC)
404 - Não encontrado
429 - Rate limit

---

**Documentação criada por:** @architect (Aria) - Fase 8
**Atualizado em:** 2026-02-14
