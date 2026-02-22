<!-- template:troubleshooting -->
<!-- hydration:required -->

# Troubleshooting

> Problemas comuns e suas soluções.

---

## Quick Fixes

### "Module not found" Error

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Prisma Client Issues

```bash
# Regenerate client
npx prisma generate

# If schema changed
npx prisma migrate dev
```

### Port Already in Use

```bash
# Find process using port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

---

## Common Issues

<!-- placeholder:needs-hydration -->

### Issue: [TÍTULO DO PROBLEMA]

**Symptoms:** [O que você vê]

**Root Cause:** [Por que acontece]

**Resolution:**
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

**Prevention:** [Como evitar no futuro]

---

### Issue: [TÍTULO DO PROBLEMA 2]

**Symptoms:** [O que você vê]

**Root Cause:** [Por que acontece]

**Resolution:**
1. [Passo 1]
2. [Passo 2]

**Prevention:** [Como evitar no futuro]

<!-- /placeholder -->

---

## Environment Issues

### Missing Environment Variable

**Symptoms:** `Error: Missing required env var: VARIABLE_NAME`

**Resolution:**
1. Check `.env.local` exists
2. Add missing variable
3. Restart dev server

### Database Connection Failed

**Symptoms:** `Error: Can't reach database server`

**Resolution:**
1. Check DATABASE_URL is correct
2. Verify database is running
3. Check network connectivity

---

## Build Issues

### TypeScript Errors

```bash
# Check types
npm run typecheck

# Fix common issues
npx tsc --noEmit
```

### Tailwind Classes Not Applied

**Resolution:**
1. Verify Tailwind config
2. Check class exists in content paths
3. Restart dev server

---

## Getting Help

1. Check this document first
2. Search existing issues
3. Ask in team chat
4. Create new issue with:
   - Error message
   - Steps to reproduce
   - Environment info

---

## Related Documents

- [🛠️ Tooling](./tooling.md) — Ferramentas
- [🔄 Dev Workflow](./development-workflow.md) — Fluxo de trabalho
- [🔙 Docs Index](./README.md) — Índice de documentação
