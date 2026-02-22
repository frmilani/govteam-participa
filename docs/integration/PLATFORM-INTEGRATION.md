# Integração com Hub - Prêmio Destaque

> **Spoke:** premio-destaque
> **Hub Version:** 1.0.0
> **Integration Type:** OAuth2 SSO + HPAC
> **Última atualização:** 2026-02-14

---

## 🎯 Integração Padrão AIOS

O spoke **premio-destaque** usa o padrão AIOS completo de integração.

**Referência completa:** [HUB-INTEGRATION.md do carta-servicos](../../../carta-servicos/docs/integration/HUB-INTEGRATION.md)

---

## 🔒 Recursos HPAC

```typescript
export const SPOKE_RESOURCES = [
  {
    resource: 'enquete',
    displayName: 'Enquetes',
    actions: ['list', 'create', 'read', 'update', 'delete', 'publish'],
  },
  {
    resource: 'campanha',
    displayName: 'Campanhas',
    actions: ['list', 'create', 'read', 'update', 'delete'],
  },
  {
    resource: 'lead',
    displayName: 'Leads',
    actions: ['list', 'create', 'read', 'update', 'delete', 'export'],
  },
  {
    resource: 'segmento',
    displayName: 'Segmentos',
    actions: ['list', 'create', 'read', 'update', 'delete'],
  },
  {
    resource: 'estabelecimento',
    displayName: 'Estabelecimentos',
    actions: ['list', 'create', 'read', 'update', 'delete'],
  },
  {
    resource: 'voto',
    displayName: 'Votos',
    actions: ['list', 'read', 'export'],
  },
];
```

---

## 🔧 Environment Variables

```bash
HUB_URL=https://hub.aios.gov.br
HUB_INTERNAL_URL=http://hub:3000
HUB_CLIENT_ID=premio-destaque
HUB_CLIENT_SECRET=premio-destaque-secret-2026

AUTH_SECRET=nextauth-secret-premio-2026
NEXTAUTH_URL=http://localhost:3008

DATABASE_URL=postgresql://user:password@localhost:5432/premio_destaque

# WhatsApp Evolution API
EVOLUTION_API_URL=https://evolution.api.com
EVOLUTION_API_TOKEN=evo-token-2026
```

---

**Documentação criada por:** @architect (Aria) - Fase 8
**Atualizado em:** 2026-02-14
