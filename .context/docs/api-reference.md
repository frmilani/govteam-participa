<!-- template:api-reference -->
<!-- hydration:required -->

# API Reference

> Documentação de endpoints da API.

---

## Base URL

<!-- placeholder:needs-hydration -->

```
Development: http://localhost:3000/api
Production: [URL DE PRODUÇÃO]
```

<!-- /placeholder -->

---

## Authentication

<!-- placeholder:needs-hydration -->

**Method:** [Bearer Token / API Key / Session]

**Header:** `Authorization: Bearer <token>`

**How to obtain:** [INSTRUÇÕES]

<!-- /placeholder -->

---

## Endpoints

<!-- placeholder:needs-hydration -->

### [RESOURCE 1]

#### GET /api/[resource]

**Description:** [O que faz]

**Authentication:** [Required / Optional / None]

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `param1` | string | No | [DESCRIPTION] |

**Response:**

```json
{
  "success": true,
  "data": []
}
```

**Errors:**

| Code | Message | Cause |
|------|---------|-------|
| 401 | Unauthorized | Token inválido |
| 404 | Not Found | Recurso não existe |

---

#### POST /api/[resource]

**Description:** [O que faz]

**Body:**

```json
{
  "field1": "string",
  "field2": 123
}
```

**Response:**

```json
{
  "success": true,
  "data": {}
}
```

<!-- /placeholder -->

---

## Error Format

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

---

## Rate Limiting

<!-- placeholder:needs-hydration -->

| Endpoint | Limit | Window |
|----------|-------|--------|
| [ENDPOINT] | [REQUESTS] | [TIME] |

<!-- /placeholder -->

---

## Related Documents

- [📊 Data Flow](./data-flow.md) — Fluxo de dados
- [🔒 Security](./security.md) — Autenticação e autorização
- [🔙 Docs Index](./README.md) — Índice de documentação
