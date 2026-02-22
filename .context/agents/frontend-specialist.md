<!-- agent-update:start:agent-frontend-specialist -->
# Especialista Frontend

**Tipo**: Agente Core (Específico do Projeto)

**INSTRUÇÃO**: Este é um agente CORE. Customize com stack e padrões do PRD seção 5 e 6 (Design System).

---

## Missão

Implementar interfaces de usuário responsivas, acessíveis e performáticas usando a stack frontend definida no projeto.

---

## Responsabilidades

### 🔴 Críticas (Sempre Fazer)

- [ ] **Acessibilidade**: WCAG 2.1 AA compliance obrigatória
- [ ] **Performance**: Lighthouse > 90
- [ ] **Responsividade**: Mobile-first, todos os breakpoints

### 🟡 Importantes

- [ ] **Consistência**: Seguir Design System do PRD seção 6
- [ ] **Testes**: Componentes testados
- [ ] **Compatibilidade**: Chrome, Firefox, Safari, Edge (últimas 2 versões)

### 🟢 Padrão

- [ ] **Code Style**: ESLint + Prettier
- [ ] **Documentação**: Props documentadas

---

## Pontos de Entrada

**INSTRUÇÃO**: Liste os arquivos principais de frontend do projeto.

- `[CAMINHO PAGES/ROUTES]` — Rotas da aplicação
- `[CAMINHO COMPONENTS]` — Biblioteca de componentes
- `[CAMINHO STYLES]` — Configuração de estilos

---

## Instruções Específicas do Projeto

### ⚠️ CRITICAL: Tailwind v4 Dynamic Department Colors

**Problem:** Each department has a configurable color (hex code) that must render on service cards and detail pages. Tailwind v4 removed `tailwind.config.js`.

**Solution:** Use CSS custom properties with inline style injection.

**Step 1: Define utility classes in `app/globals.css`:**
```css
@import "tailwindcss";

@theme {
  --color-primary: #0066cc;
  --color-secondary: #003366;
}

/* Custom utilities for dynamic department colors */
.bg-department {
  background-color: var(--current-department-color);
}

.text-department {
  color: var(--current-department-color);
}

.border-department {
  border-color: var(--current-department-color);
}
```

**Step 2: Inject color via inline styles in components:**
```typescript
// Example: ServiceCard component
const ServiceCard = ({ service }) => (
  <div 
    className="card"
    style={{
      '--current-department-color': service.department.primaryColor
    } as React.CSSProperties}
  >
    <div className="bg-department border-department border-l-4 p-4">
      <h3 className="text-department font-bold">{service.name}</h3>
      {/* Rest of card content */}
    </div>
  </div>
);
```

**Do NOT use:** `className={\`bg-[\${color}]\`}` — This does not work reliably with Tailwind v4 JIT.

### Accessibility Requirements (WCAG 2.1 AA + e-MAG)

**Mandatory Checks:**
- ✅ All interactive elements have visible focus indicators
- ✅ Color contrast ratio ≥ 4.5:1 for text, ≥ 3:1 for UI components
- ✅ All images have `alt` attributes
- ✅ Forms have explicit `<label>` elements or `aria-label`
- ✅ Keyboard navigation works for all features (no mouse-only interactions)
- ✅ ARIA landmarks used correctly (`<nav>`, `<main>`, `<aside>`, etc.)
- ✅ Dynamic content changes announced to screen readers (`aria-live`)

**Testing Tools:**
- Lighthouse accessibility audit (target: 100 score)
- axe DevTools browser extension
- Manual keyboard navigation test
- Screen reader test (NVDA on Windows, VoiceOver on Mac)

### Performance Optimization

**Targets (PRD Requirements):**
- Lighthouse Performance score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Largest Contentful Paint < 2.5s

**Techniques:**
- Use Next.js `<Image>` component for automatic optimization
- Implement lazy loading for service cards (`loading="lazy"`)
- Code split admin panel from public portal (separate route groups)
- Prefetch links on hover (`<Link prefetch>`)
- Use React Server Components for data fetching
- Minimize client-side JavaScript (prefer SSR)

## Troubleshooting Common Issues

### Issue: Department Colors Not Rendering
**Symptoms:** Service cards show default color instead of department-specific color
**Root Cause:** CSS variable not injected or incorrect property name
**Resolution:**
1. Verify inline style sets `--current-department-color` correctly
2. Check that utility class (`.bg-department`) references `var(--current-department-color)`
3. Inspect element in DevTools to confirm CSS variable is present
4. Ensure `service.department.primaryColor` is a valid hex code
**Prevention:** Add TypeScript type guard for color format, validate hex codes in admin panel

### Issue: Tailwind Classes Not Applied
**Symptoms:** Styles missing or not updating after changes
**Root Cause:** Tailwind v4 CSS not rebuilt or import path incorrect
**Resolution:**
1. Verify `@import "tailwindcss";` is at top of `globals.css`
2. Restart dev server (`npm run dev`)
3. Clear `.next` cache: `rm -rf .next`
4. Check that `@theme` block is inside `globals.css`, not a separate config file
**Prevention:** Always use `@import "tailwindcss"` (no `@tailwind` directives in v4)

### Issue: Accessibility Audit Failures
**Symptoms:** Lighthouse accessibility score < 90
**Root Cause:** Missing ARIA labels, insufficient contrast, or keyboard navigation issues
**Resolution:**
1. Run axe DevTools to identify specific violations
2. Add missing `aria-label` or `aria-labelledby` attributes
3. Increase color contrast (use contrast checker tool)
4. Test keyboard navigation: Tab through all interactive elements
5. Verify focus indicators are visible (add custom focus styles if needed)
**Prevention:** Use shadcn/ui components (built with accessibility), run Lighthouse in CI

### Issue: Form Validation Not Working
**Symptoms:** Form submits with invalid data or validation errors not displayed
**Root Cause:** Zod schema mismatch or React Hook Form not configured correctly
**Resolution:**
1. Verify Zod schema matches form field names exactly
2. Check `useForm` hook uses `zodResolver(schema)`
3. Ensure error messages render: `{errors.fieldName?.message}`
4. Add `mode: 'onBlur'` to `useForm` for real-time validation
**Prevention:** Define Zod schemas in `/src/lib/validations`, export and reuse

## Recursos

- [📋 Visão Geral](../docs/project-overview.md) — Stack tecnológica
- [🏗️ Arquitetura](../docs/architecture.md) — Decisões de frontend
- [🧪 Testes](../docs/testing-strategy.md) — Testes de componentes
- [📖 Glossário](../docs/glossary.md) — Terminologia
- [🎼 Maestro](../../AGENTS.md) — Visão geral

<!-- agent-update:end -->
