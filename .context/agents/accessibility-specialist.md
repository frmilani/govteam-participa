<!-- agent-update:start:agent-accessibility-specialist -->
# Especialista em Acessibilidade

**Tipo**: Agente de Suporte (Recomendado para Governo)

**INSTRUÇÃO**: Este playbook é essencial para projetos governamentais brasileiros que devem seguir e-MAG e WCAG.

---

## Missão

Garantir que a aplicação seja acessível a todos os usuários, incluindo pessoas com deficiências visuais, auditivas, motoras e cognitivas, em conformidade com WCAG 2.1 AA e e-MAG.

---

## Padrões Obrigatórios

### WCAG 2.1 Level AA

Padrão internacional de acessibilidade web.

**4 Princípios (POUR)**:
1. **Perceptível** — Informação apresentável de formas que usuários possam perceber
2. **Operável** — Interface navegável e operável
3. **Compreensível** — Informação e operação compreensíveis
4. **Robusto** — Conteúdo interpretável por tecnologias assistivas

### e-MAG 3.1 (Brasil)

Modelo de Acessibilidade em Governo Eletrônico — **obrigatório** para sites públicos brasileiros.

**INSTRUÇÃO**: Para projetos governamentais, este é um requisito legal, não opcional.

---

## Responsabilidades

### 🔴 Críticas (Bloquear Deploy)

- [ ] **Navegação por teclado**: Todo elemento interativo acessível via Tab
- [ ] **Contraste**: Ratio ≥ 4.5:1 para texto, ≥ 3:1 para UI
- [ ] **Alt text**: Todas as imagens têm texto alternativo
- [ ] **Labels**: Todos os inputs têm labels associados
- [ ] **Focus visible**: Indicador de foco visível em todos elementos

### 🟡 Importantes

- [ ] **ARIA**: Landmarks e roles corretos
- [ ] **Skip links**: Link para pular para conteúdo principal
- [ ] **Headings**: Hierarquia de headings correta (h1 > h2 > h3)
- [ ] **Language**: `lang` definido no HTML

### 🟢 Padrão

- [ ] **Resize**: Texto legível em 200% zoom
- [ ] **Motion**: Respeitar `prefers-reduced-motion`
- [ ] **Touch targets**: Áreas de toque ≥ 44x44px

---

## Checklist por Componente

### Formulários

```tsx
// ✅ Correto
<label htmlFor="email">E-mail</label>
<input 
  id="email" 
  type="email" 
  aria-describedby="email-error"
  aria-invalid={hasError}
/>
{hasError && (
  <span id="email-error" role="alert">
    E-mail inválido
  </span>
)}

// ❌ Errado
<input placeholder="E-mail" /> // Sem label!
```

### Botões

```tsx
// ✅ Correto
<button aria-label="Fechar modal">
  <XIcon aria-hidden="true" />
</button>

// ❌ Errado
<button><XIcon /></button> // Sem texto acessível!
```

### Imagens

```tsx
// ✅ Decorativa
<img src="border.png" alt="" role="presentation" />

// ✅ Informativa
<img src="grafico.png" alt="Gráfico mostrando aumento de 30% em 2024" />

// ❌ Errado
<img src="foto.jpg" /> // Sem alt!
```

### Links

```tsx
// ✅ Correto
<a href="/servico">
  Ver detalhes do Alvará de Construção
</a>

// ❌ Errado
<a href="/servico">Clique aqui</a> // Não descritivo!
```

### Tabelas

```tsx
// ✅ Correto
<table>
  <caption>Lista de Serviços por Categoria</caption>
  <thead>
    <tr>
      <th scope="col">Serviço</th>
      <th scope="col">Categoria</th>
    </tr>
  </thead>
  <tbody>...</tbody>
</table>
```

### Modais

```tsx
// ✅ Correto
<dialog 
  aria-modal="true"
  aria-labelledby="modal-title"
  onKeyDown={handleEscape}
>
  <h2 id="modal-title">Confirmar exclusão</h2>
  {/* Foco deve ficar preso dentro do modal */}
</dialog>
```

---

## Cores e Contraste

### Ferramentas de Verificação

| Ferramenta | URL | Uso |
|------------|-----|-----|
| WebAIM Contrast Checker | webaim.org/resources/contrastchecker | Verificar ratio |
| Coolors Contrast | coolors.co/contrast-checker | Visual |
| Chrome DevTools | F12 > Elements | Inspecionar contraste |

### Tabela de Referência

| Tipo | Ratio Mínimo | Exemplo |
|------|--------------|---------|
| Texto normal | 4.5:1 | Parágrafo, labels |
| Texto grande (≥18pt ou ≥14pt bold) | 3:1 | Headings |
| UI Components | 3:1 | Bordas, ícones |

---

## Testes Obrigatórios

### Automatizados

```bash
# Lighthouse (integrado no Chrome DevTools)
# F12 > Lighthouse > Accessibility

# axe-core via CLI
npm install -g @axe-core/cli
axe http://localhost:3000

# No Jest/Vitest
npm install --save-dev jest-axe
```

```typescript
// Teste de acessibilidade com jest-axe
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('componente é acessível', async () => {
  const { container } = render(<MeuComponente />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manuais (Obrigatórios)

1. **Navegação por teclado**
   - Tab através de toda a página
   - Verificar ordem lógica
   - Verificar focus trap em modais

2. **Leitor de tela**
   - NVDA (Windows, gratuito)
   - VoiceOver (Mac, nativo)
   - Verificar se conteúdo faz sentido quando lido

3. **Zoom 200%**
   - Aumentar zoom do navegador para 200%
   - Verificar se layout não quebra
   - Verificar se texto é legível

---

## Padrões de ARIA

### Landmarks

```html
<header role="banner">...</header>
<nav role="navigation" aria-label="Menu principal">...</nav>
<main role="main">...</main>
<aside role="complementary">...</aside>
<footer role="contentinfo">...</footer>
```

### Live Regions

```tsx
// Para atualizações dinâmicas que devem ser anunciadas
<div aria-live="polite" aria-atomic="true">
  {mensagemDeSucesso}
</div>

// Para erros urgentes
<div role="alert" aria-live="assertive">
  {mensagemDeErro}
</div>
```

---

## Recursos e-MAG

**INSTRUÇÃO**: Consultar documentação oficial para projetos governamentais.

- [e-MAG 3.1 Completo](https://www.gov.br/governodigital/pt-br/acessibilidade-digital/emag)
- [Cartilha de Acessibilidade](https://www.gov.br/governodigital/pt-br/acessibilidade-digital)
- [WCAG 2.1 (W3C)](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Anti-Patterns (Evitar)

- ❌ `tabindex` maior que 0 (quebra ordem natural)
- ❌ `outline: none` sem alternativa de focus
- ❌ Texto em imagem (não é lido por screen readers)
- ❌ Autoplay de vídeo/áudio
- ❌ Captchas visuais sem alternativa
- ❌ Time limits sem opção de extensão

---

## Recursos

- [📋 Visão Geral](../docs/project-overview.md) — Stack tecnológica
- [🎨 Frontend](./frontend-specialist.md) — Implementação de UI
- [🧪 Testes](../docs/testing-strategy.md) — Testes de acessibilidade
- [🎼 Maestro](../../AGENTS.md) — Visão geral

<!-- agent-update:end -->
