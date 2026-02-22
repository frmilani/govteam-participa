<!-- agent-update:start:agent-database-specialist -->
# Especialista em Banco de Dados

**Tipo**: Agente Core (Específico do Projeto)

**INSTRUÇÃO**: Este é um agente CORE. Customize com detalhes específicos do PRD seção 7 (Modelo de Dados).

---

## Missão

Projetar e otimizar o schema do banco de dados, garantindo performance, integridade e suporte aos requisitos de busca do sistema.

---

## Responsabilidades

### 🔴 Críticas (Sempre Fazer)

- [ ] **Schema correto**: Modelo de dados reflete o PRD seção 7
- [ ] **Índices otimizados**: Queries principais < 100ms
- [ ] **Migrações seguras**: Sempre com rollback testado
- [ ] **Integridade**: Constraints e cascades corretos

### 🟡 Importantes

- [ ] **Backup**: Estratégia de backup documentada e testada
- [ ] **Monitoramento**: Queries lentas identificadas
- [ ] **Documentação**: Schema changes documentadas

### 🟢 Padrão

- [ ] **Seeds**: Dados de desenvolvimento atualizados
- [ ] **Manutenção**: VACUUM e ANALYZE regulares

---

## Pontos de Entrada

**INSTRUÇÃO**: Liste os arquivos principais de banco de dados do projeto.

- `[CAMINHO DO SCHEMA]` — Schema principal
- `[CAMINHO DAS MIGRATIONS]` — Histórico de migrações
- `[CAMINHO DOS SEEDS]` — Dados de desenvolvimento

---

## Instruções Específicas do Projeto

### ⚠️ CRITICAL: embeddingText Field Optimization

**Schema Definition (Prisma):**
```prisma
model Service {
  id                String   @id @default(uuid())
  name              String
  shortDescription  String
  fullDescription   String   @db.Text
  
  // CRITICAL: RAG-optimized field for AI agents
  embeddingText     String   @db.Text
  
  // ... other fields
  
  // Full-text search index (PostgreSQL GIN)
  @@index([embeddingText(ops: raw("gin_trgm_ops"))], type: Gin)
}
```

**Required PostgreSQL Extensions:**
```sql
-- Trigram matching for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Phase 2: Vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;
```

**Phase 1: Full-Text Search Indexes**
```sql
-- Primary full-text search index (Portuguese language)
CREATE INDEX service_embedding_text_search_idx 
ON "Service" 
USING GIN (to_tsvector('portuguese', embedding_text));

-- Trigram index for fuzzy matching and partial word search
CREATE INDEX service_embedding_text_trgm_idx 
ON "Service" 
USING GIN (embedding_text gin_trgm_ops);

-- Composite index for common filters
CREATE INDEX service_status_published_idx 
ON "Service" (status, published_at DESC)
WHERE status = 'ACTIVE';

CREATE INDEX service_category_dept_idx 
ON "Service" (category_id, department_id);
```

**Query Patterns (Phase 1):**
```sql
-- Full-text search with ranking
SELECT 
  id, name, short_description, embedding_text,
  ts_rank(to_tsvector('portuguese', embedding_text), 
          plainto_tsquery('portuguese', $1)) as rank
FROM "Service"
WHERE 
  status = 'ACTIVE'
  AND to_tsvector('portuguese', embedding_text) @@ plainto_tsquery('portuguese', $1)
ORDER BY rank DESC
LIMIT 10;

-- Fuzzy search with trigrams
SELECT 
  id, name, short_description,
  similarity(embedding_text, $1) as sim
FROM "Service"
WHERE 
  status = 'ACTIVE'
  AND embedding_text % $1  -- % operator uses trigram index
ORDER BY sim DESC
LIMIT 10;
```

**Performance Targets:**
- Full-text search query: < 100ms for 10,000 services
- Fuzzy search query: < 200ms for 10,000 services
- Index size: ~30% of table size (acceptable)

### Phase 2 Preparation: pgvector Migration

**Schema Addition (Future):**
```sql
-- Add vector column for embeddings (OpenAI ada-002 = 1536 dimensions)
ALTER TABLE "Service" 
ADD COLUMN embedding vector(1536);

-- Create HNSW index for fast cosine similarity search
CREATE INDEX service_embedding_hnsw_idx 
ON "Service" 
USING hnsw (embedding vector_cosine_ops);

-- Alternative: IVFFlat index (faster build, slower query)
CREATE INDEX service_embedding_ivfflat_idx 
ON "Service" 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**Migration Strategy:**
1. Add `embedding` column (nullable initially)
2. Backfill embeddings for existing services (background job)
3. Create vector index once backfill complete
4. Update API to use vector search
5. Monitor performance vs full-text search
6. Deprecate full-text search if vector performs better

**Vector Search Query (Phase 2):**
```sql
SELECT 
  id, name, short_description, embedding_text,
  1 - (embedding <=> $1::vector) as similarity
FROM "Service"
WHERE 
  status = 'ACTIVE'
  AND embedding IS NOT NULL
ORDER BY embedding <=> $1::vector  -- <=> is cosine distance operator
LIMIT 10;
```

### Database Constraints & Data Integrity

**Critical Constraints:**
```sql
-- Ensure embeddingText is never empty
ALTER TABLE "Service" 
ADD CONSTRAINT embedding_text_not_empty 
CHECK (LENGTH(embedding_text) > 0);

-- Ensure embeddingText is not too large (10,000 char limit)
ALTER TABLE "Service" 
ADD CONSTRAINT embedding_text_max_length 
CHECK (LENGTH(embedding_text) <= 10000);

-- Ensure published services have publishedAt timestamp
ALTER TABLE "Service" 
ADD CONSTRAINT published_has_timestamp 
CHECK (status != 'ACTIVE' OR published_at IS NOT NULL);

-- Ensure slugs are URL-safe
ALTER TABLE "Service" 
ADD CONSTRAINT slug_format 
CHECK (slug ~ '^[a-z0-9-]+$');
```

**Cascade Rules:**
```prisma
model ServiceRequirement {
  serviceId String
  service   Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  // Deleting a service deletes all requirements
}

model ServiceStep {
  serviceId String
  service   Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  // Deleting a service deletes all steps
}
```

### Backup & Recovery

**Automated Backup Strategy:**
```bash
# Daily full backup
pg_dump -Fc -d $DATABASE_URL -f backup_$(date +%Y%m%d).dump

# Continuous archiving (WAL)
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'
```

**Point-in-Time Recovery:**
```bash
# Restore from backup
pg_restore -d $DATABASE_URL backup_20251126.dump

# Replay WAL to specific timestamp
recovery_target_time = '2025-11-26 14:30:00'
```

**Backup Retention:**
- Daily backups: Keep 30 days
- Weekly backups: Keep 12 weeks
- Monthly backups: Keep 12 months

### Monitoring & Maintenance

**Key Metrics:**
```sql
-- Index usage statistics
SELECT 
  schemaname, tablename, indexname, 
  idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Table bloat (needs VACUUM)
SELECT 
  schemaname, tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Slow queries (requires pg_stat_statements extension)
SELECT 
  query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- queries slower than 100ms
ORDER BY mean_exec_time DESC
LIMIT 20;
```

**Maintenance Tasks:**
- **VACUUM:** Weekly (or auto-vacuum enabled)
- **ANALYZE:** After bulk data changes
- **REINDEX:** Monthly for heavily updated indexes

## Troubleshooting Common Issues

### Issue: Full-Text Search Slow (> 500ms)
**Symptoms:** `/context-search` API endpoint exceeds 500ms p99 latency
**Root Cause:** Missing index, index not being used, or table bloat
**Resolution:**
1. Verify index exists: `\d "Service"` in psql
2. Check if index is used: `EXPLAIN ANALYZE <query>`
3. If index not used, check query uses `to_tsvector` correctly
4. Run `VACUUM ANALYZE "Service";` to update statistics
5. Rebuild index if bloated: `REINDEX INDEX service_embedding_text_search_idx;`
**Prevention:** Enable auto-vacuum, monitor index usage, set `work_mem` appropriately

### Issue: pg_trgm Extension Not Found
**Symptoms:** Migration fails with "extension pg_trgm does not exist"
**Root Cause:** Extension not installed in PostgreSQL
**Resolution:**
1. Connect as superuser: `psql -U postgres`
2. Install extension: `CREATE EXTENSION IF NOT EXISTS pg_trgm;`
3. Verify: `SELECT * FROM pg_extension WHERE extname = 'pg_trgm';`
4. Re-run migration
**Prevention:** Add extension creation to initial migration, document in setup guide

### Issue: embeddingText Constraint Violation
**Symptoms:** Service creation fails with "embedding_text_not_empty" constraint error
**Root Cause:** `generateEmbeddingText()` returned empty string or null
**Resolution:**
1. Check service data has required fields (name, description)
2. Verify `generateEmbeddingText()` function logic
3. Add validation before database insert
4. Review Prisma middleware registration
**Prevention:** Add unit tests for `generateEmbeddingText()`, validate input data

### Issue: Connection Pool Exhausted
**Symptoms:** "remaining connection slots are reserved" or "too many clients"
**Root Cause:** Too many concurrent connections or connections not released
**Resolution:**
1. Check active connections: `SELECT count(*) FROM pg_stat_activity;`
2. Increase `max_connections` in postgresql.conf (default: 100)
3. Implement connection pooling (PgBouncer recommended)
4. Verify Prisma client properly closes connections
5. Set `connection_limit` in DATABASE_URL: `?connection_limit=10`
**Prevention:** Use connection pooler in production, monitor connection count

### Issue: Migration Rollback Needed
**Symptoms:** Migration applied but caused data loss or application errors
**Root Cause:** Migration not tested in staging or missing rollback plan
**Resolution:**
1. Identify migration to rollback: `npx prisma migrate status`
2. If data loss: Restore from backup before rollback
3. Create rollback migration manually (Prisma doesn't auto-generate)
4. Test rollback in staging first
5. Apply rollback in production
**Prevention:** Always test migrations in staging, create rollback scripts, backup before migrations

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work.

## Recursos

- [📋 Visão Geral](../docs/project-overview.md) — Stack tecnológica
- [🏗️ Arquitetura](../docs/architecture.md) — Decisões de dados
- [📊 Fluxo de Dados](../docs/data-flow.md) — Pipelines
- [📖 Glossário](../docs/glossary.md) — Terminologia
- [🎼 Maestro](../../AGENTS.md) — Visão geral

<!-- agent-update:end -->
