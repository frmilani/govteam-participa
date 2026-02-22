<!-- agent-update:start:agent-backend-specialist -->
# Especialista Backend

**Tipo**: Agente Core (Específico do Projeto)

**INSTRUÇÃO**: Este é um agente CORE. Customize com stack e endpoints do PRD seção 5 e 10 (API).

---

## Missão

Implementar a camada de API, lógica de negócio e padrões de acesso a dados, garantindo endpoints performáticos e bem documentados.

---

## Responsabilidades

### 🔴 Críticas (Sempre Fazer)

- [ ] **APIs funcionais**: Endpoints retornam dados corretos
- [ ] **Validação**: Todos inputs validados com schema
- [ ] **Segurança**: Autenticação e autorização corretas
- [ ] **Testes**: Coverage mínimo conforme PRD

### 🟡 Importantes

- [ ] **Performance**: Endpoints < target de latência
- [ ] **Logging**: Logs estruturados para debugging
- [ ] **Documentação**: OpenAPI/Swagger atualizado

### 🟢 Padrão

- [ ] **Code Style**: ESLint + Prettier
- [ ] **Error Handling**: Erros tratados adequadamente

---

## Pontos de Entrada

**INSTRUÇÃO**: Liste os arquivos principais de backend do projeto.

- `[CAMINHO API ROUTES]` — Endpoints da API
- `[CAMINHO SERVICES]` — Lógica de negócio
- `[CAMINHO VALIDATIONS]` — Schemas de validação

---

## Instruções Específicas do Projeto

### ⚠️ CRITICAL: generateEmbeddingText() Function

**Purpose:** Concatenates service data into a single, search-optimized text block for AI agents (RAG workflow).

**Location:** `/src/lib/ai/generate-embedding-text.ts`

**Implementation Requirements:**
```typescript
export function generateEmbeddingText(service: {
  name: string;
  shortDescription: string;
  fullDescription: string;
  requirements?: Array<{ name: string; observation?: string }>;
  steps?: Array<{ title: string; description: string }>;
  keywords?: string[];
  category?: { name: string };
  department?: { name: string };
}): string {
  const parts: string[] = [];

  // 1. Service name (high weight for search)
  parts.push(`Serviço: ${service.name}`);

  // 2. Category and department (context)
  if (service.category?.name) parts.push(`Categoria: ${service.category.name}`);
  if (service.department?.name) parts.push(`Órgão: ${service.department.name}`);

  // 3. Descriptions
  parts.push(`Descrição: ${service.shortDescription}`);
  
  const cleanFullDesc = service.fullDescription
    .replace(/<[^>]*>/g, '') // Strip HTML
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
  parts.push(cleanFullDesc);

  // 4. Requirements (critical for AI responses)
  if (service.requirements?.length) {
    const reqList = service.requirements
      .map(req => `${req.name}${req.observation ? ` (${req.observation})` : ''}`)
      .join('; ');
    parts.push(`Documentos necessários: ${reqList}`);
  }

  // 5. Steps (process information)
  if (service.steps?.length) {
    const stepsList = service.steps
      .map((step, idx) => `Etapa ${idx + 1}: ${step.title} - ${step.description}`)
      .join('. ');
    parts.push(`Como fazer: ${stepsList}`);
  }

  // 6. Keywords (improve search recall)
  if (service.keywords?.length) {
    parts.push(`Palavras-chave: ${service.keywords.join(', ')}`);
  }

  return parts.join('. ').replace(/\.\./g, '.').trim();
}
```

**Validation Rules:**
- Output must be < 10,000 characters (database constraint)
- Must strip all HTML tags from `fullDescription`
- Must handle null/undefined fields gracefully
- Must preserve Portuguese diacritics (á, ç, ã, etc.)
- Must not contain double periods or excessive whitespace

**Testing Requirements:**
See `/tests/unit/generateEmbeddingText.test.ts` for mandatory test cases:
- ✅ All fields concatenated correctly
- ✅ HTML stripped from descriptions
- ✅ Null fields don't break output
- ✅ Output length validated
- ✅ Special characters handled

### Prisma Middleware for Auto-Generation

**Location:** `/src/lib/prisma/middleware.ts`

**Implementation:**
```typescript
import { generateEmbeddingText } from '@/lib/ai/generate-embedding-text';

export function createEmbeddingMiddleware() {
  return async (params: any, next: any) => {
    if (params.model === 'Service') {
      if (params.action === 'create' || params.action === 'update') {
        // Auto-generate embeddingText if not provided
        if (!params.args.data.embeddingText) {
          // Include related data for complete context
          const serviceData = await prisma.service.findUnique({
            where: { id: params.args.where?.id },
            include: {
              category: true,
              department: true,
              requirements: true,
              steps: { orderBy: { order: 'asc' } }
            }
          });
          
          params.args.data.embeddingText = generateEmbeddingText({
            ...params.args.data,
            ...serviceData
          });
        }
      }
    }
    return next(params);
  };
}
```

**IMPORTANT:** Always regenerate `embeddingText` when:
- Service name, description, or keywords change
- Requirements or steps are added/modified/deleted
- Category or department assignment changes

### API Design Patterns

**Endpoint Structure:**
- `/api/v1/services` — List with pagination and filters
- `/api/v1/services/{id-or-slug}` — Single service detail
- `/api/v1/services/context-search` — RAG-optimized search (POST)
- `/api/v1/categories` — Category metadata
- `/api/v1/departments` — Department metadata

**Response Format (Standard):**
```json
{
  "success": true,
  "data": { /* payload */ },
  "pagination": { /* if applicable */ }
}
```

**Error Format:**
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_NOT_FOUND",
    "message": "Serviço não encontrado",
    "details": {}
  }
}
```

**Rate Limiting:** 100 requests/minute per IP (configurable)

**Caching Strategy:**
- Service list: 5 minutes TTL
- Service detail: 15 minutes TTL
- Invalidate on service update/delete

### Database Optimization

**Required Indexes:**
```sql
-- Full-text search on embeddingText (Phase 1)
CREATE INDEX service_embedding_text_search_idx 
ON "Service" 
USING GIN (to_tsvector('portuguese', embedding_text));

-- Trigram index for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX service_embedding_text_trgm_idx 
ON "Service" 
USING GIN (embedding_text gin_trgm_ops);

-- Common query indexes
CREATE INDEX service_status_published_idx 
ON "Service" (status, published_at);

CREATE INDEX service_category_dept_idx 
ON "Service" (category_id, department_id);
```

**Query Optimization:**
- Always use `select` to limit returned fields
- Use `include` sparingly (avoid N+1 queries)
- Leverage Prisma's query batching
- Monitor slow queries with `EXPLAIN ANALYZE`

## Troubleshooting Common Issues

### Issue: embeddingText Not Generated
**Symptoms:** Service created but `embeddingText` field is null or empty
**Root Cause:** Prisma middleware not registered or service data incomplete
**Resolution:**
1. Verify middleware is registered in Prisma client initialization
2. Check that service includes related data (category, department, requirements, steps)
3. Add explicit call to `generateEmbeddingText()` in service creation logic
4. Validate input data meets minimum requirements (name, description)
**Prevention:** Add database constraint `CHECK (LENGTH(embedding_text) > 0)`, write integration test

### Issue: Full-Text Search Returns No Results
**Symptoms:** `/context-search` returns empty array for valid queries
**Root Cause:** PostgreSQL extension not installed or index not created
**Resolution:**
1. Verify `pg_trgm` extension: `SELECT * FROM pg_extension WHERE extname = 'pg_trgm';`
2. Check index exists: `\d "Service"` in psql
3. Rebuild index if corrupted: `REINDEX INDEX service_embedding_text_search_idx;`
4. Test query directly: `SELECT * FROM "Service" WHERE to_tsvector('portuguese', embedding_text) @@ plainto_tsquery('portuguese', 'test');`
**Prevention:** Add migration that creates extension and index, verify in CI

### Issue: API Rate Limit Too Restrictive
**Symptoms:** Legitimate AI agents hitting 429 errors frequently
**Root Cause:** Default 100 req/min too low for production traffic
**Resolution:**
1. Increase limit in rate limiter config (e.g., 500 req/min)
2. Implement tiered limits based on API key (if authentication added)
3. Add `Retry-After` header to 429 responses
4. Monitor rate limit hits in logs/metrics
**Prevention:** Load test API before launch, implement API key system for known integrators

### Issue: Prisma Connection Pool Exhausted
**Symptoms:** "Too many clients" error or slow query performance
**Root Cause:** Connection pool size too small for concurrent requests
**Resolution:**
1. Increase pool size in `DATABASE_URL`: `?connection_limit=20`
2. Implement connection pooling with PgBouncer
3. Reduce query execution time (add indexes, optimize queries)
4. Monitor active connections: `SELECT count(*) FROM pg_stat_activity;`
**Prevention:** Set appropriate pool size based on expected load, use connection pooler in production

## Recursos

- [📋 Visão Geral](../docs/project-overview.md) — Stack tecnológica
- [🏗️ Arquitetura](../docs/architecture.md) — Decisões de backend
- [📊 Fluxo de Dados](../docs/data-flow.md) — Pipelines
- [🔒 Segurança](../docs/security.md) — Autenticação e autorização
- [📖 Glossário](../docs/glossary.md) — Terminologia
- [🎼 Maestro](../../AGENTS.md) — Visão geral

<!-- agent-update:end -->
