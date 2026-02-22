# Plano de Implementação: Landing Page de Votação

Página pública otimizada para conversão onde leads votam nos estabelecimentos. Inclui validação de tracking link, renderização do formulário do Hub, personalização visual da enquete, e página de agradecimento pós-votação.

## Visão Geral

- **Validação de Hash**: Verificar tracking link único e não expirado
- **Prevenção de Duplicatas**: Impedir múltiplos votos do mesmo lead
- **Renderização Dinâmica**: Usar RemoteForm para exibir formulário do Hub
- **Personalização Visual**: Aplicar logo, cores e banner da enquete
- **Página de Agradecimento**: Exibir mensagem customizada e ações pós-voto
- **Responsividade**: Otimizado para mobile (maioria dos acessos via WhatsApp)

## Referências

- PRD Seção 6.3: [.context/inputs/PRD.md](../inputs/PRD.md#63-respondente-vota)
- [agents/frontend-development.md](../agents/frontend-development.md)

## Pré-requisitos

1. **RF-005 Implementado**: RemoteForm funcional
2. **RF-007 Implementado**: Tracking links gerados

## Passo 1: Rotas Públicas

### 1.1 Redirect com Tracking

`src/app/(public)/r/[hash]/page.tsx`:

**Lógica**:
1. Buscar tracking link por hash via API
2. Registrar visualização
3. Redirecionar para `/vote/[hash]`

**Propósito**: Rastrear cliques no link antes de mostrar formulário

### 1.2 Landing Page de Votação

`src/app/(public)/vote/[hash]/page.tsx`:

**Lógica**:
1. Buscar tracking link e validar
2. Verificar se já respondeu (status === RESPONDIDO)
3. Verificar se expirou
4. Buscar enquete e configurações visuais
5. Renderizar formulário com personalização
6. Ao submeter, salvar resposta e redirecionar

**Validações**:
- Hash inválido → 404
- Link expirado → Mensagem de expiração
- Já respondeu → Mensagem "Obrigado, você já votou"

### 1.3 Página de Agradecimento

`src/app/(public)/vote/[hash]/obrigado/page.tsx`:

**Conteúdo**:
- Título customizado da enquete
- Mensagem de agradecimento
- Botões de ação (compartilhar, ver resultados parciais)
- Logo da organização

## Passo 2: API Routes Públicas

### 2.1 Validar Tracking Link

`src/app/api/public/tracking/[hash]/route.ts`:

**Endpoint**: `GET /api/public/tracking/[hash]`

**Lógica**:
1. Buscar tracking link por hash
2. Verificar expiração
3. Verificar se já respondeu
4. Retornar tracking link com enquete e lead

**Respostas**:
- `200 OK`: Tracking link válido
- `404 Not Found`: Hash inválido
- `410 Gone`: Link expirado
- `409 Conflict`: Já respondeu

### 2.2 Registrar Visualização

`src/app/api/public/tracking/[hash]/view/route.ts`:

**Endpoint**: `POST /api/public/tracking/[hash]/view`

**Lógica**:
1. Atualizar `visualizadoEm` do tracking link
2. Alterar status para VISUALIZADO
3. Incrementar contador da campanha

### 2.3 Submeter Resposta

`src/app/api/public/submissions/route.ts`:

**Endpoint**: `POST /api/public/submissions`

**Validação (Zod)**:
- `trackingLinkHash` (string): Hash do tracking link
- `dadosJson` (objeto): Dados do formulário
- `ipAddress` (string): IP do respondente
- `userAgent` (string): User agent

**Lógica**:
1. Validar tracking link
2. Criar registro Resposta
3. Extrair votos de campos `custom-establishment`
4. Criar registros VotoEstabelecimento
5. Atualizar tracking link para RESPONDIDO
6. Enviar telemetria para Hub
7. Retornar sucesso

## Passo 3: Componentes

### 3.1 Layout da Landing Page

`src/components/landing/LandingLayout.tsx`:

**Estrutura**:
- Header com logo da organização
- Banner (se configurado)
- Área do formulário
- Footer com links (política de privacidade, opt-out)

**Personalização**:
- Aplicar cores da enquete (CSS variables)
- Exibir logo customizada
- Banner de topo (se configurado)

### 3.2 Formulário de Votação

`src/components/landing/VoteForm.tsx`:

**Props**:
- `enquete` (objeto): Dados da enquete
- `trackingLink` (objeto): Tracking link
- `onSuccess` (função): Callback após submissão

**Implementação**:
1. Renderizar RemoteForm com publicId da enquete
2. Aplicar personalização visual
3. Ao submeter:
   - Validar dados
   - Chamar API de submissão
   - Redirecionar para página de agradecimento

### 3.3 Mensagens de Estado

`src/components/landing/StateMessages.tsx`:

**Estados**:
- **Loading**: Skeleton do formulário
- **Expirado**: Mensagem amigável com suporte
- **Já Respondeu**: Agradecimento e opção de compartilhar
- **Erro**: Mensagem de erro com botão tentar novamente

## Passo 4: Otimizações

### 4.1 Performance

- **Lazy Loading**: Carregar imagens sob demanda
- **Prefetch**: Prefetch de dados ao registrar visualização
- **Caching**: Cachear configurações visuais da enquete

### 4.2 SEO e Meta Tags

- **Open Graph**: Meta tags para compartilhamento
- **Title dinâmico**: Incluir nome da enquete
- **Description**: Descrição da enquete
- **noindex**: Páginas de votação não devem ser indexadas

### 4.3 Analytics

- **Google Analytics**: Rastrear conversão
- **Hotjar**: Mapas de calor (opcional)
- **Tempo de resposta**: Calcular e salvar

## Passo 5: Testes

**Cenário 1: Fluxo completo de votação**
1. Lead recebe WhatsApp com link
2. Clica no link `/r/[hash]`
3. Visualização registrada
4. Redireciona para `/vote/[hash]`
5. Formulário carrega com personalização
6. Preenche e submete
7. Votos salvos
8. Redireciona para página de agradecimento
9. **Resultado**: Voto registrado com sucesso

**Cenário 2: Tentar votar novamente**
1. Lead que já votou acessa link novamente
2. Verificar mensagem "Você já votou"
3. **Resultado**: Duplicata impedida

**Cenário 3: Link expirado**
1. Acessar link após data de expiração
2. Verificar mensagem de expiração
3. **Resultado**: Acesso negado gracefully

**Cenário 4: Responsividade mobile**
1. Acessar no smartphone
2. Verificar layout adaptado
3. Preencher formulário
4. **Resultado**: UX otimizada para mobile

## Checklist

- [ ] Criar rota `/r/[hash]` com redirect
- [ ] Criar rota `/vote/[hash]` com formulário
- [ ] Criar rota `/vote/[hash]/obrigado`
- [ ] Implementar API de validação
- [ ] Implementar API de visualização
- [ ] Implementar API de submissão
- [ ] Criar LandingLayout
- [ ] Criar VoteForm
- [ ] Criar StateMessages
- [ ] Adicionar meta tags
- [ ] Otimizar para mobile
- [ ] Testar fluxo completo
- [ ] Testar prevenção de duplicatas
- [ ] Testar links expirados

## Notas

1. **Mobile First**: 80%+ dos acessos virão de WhatsApp mobile
2. **Performance**: Landing page deve carregar em < 2s
3. **Conversão**: Minimizar fricção, formulário simples
4. **Segurança**: Validar hash server-side, nunca confiar no client
5. **LGPD**: Link para opt-out visível no footer
6. **Tracking**: Registrar tempo de resposta para analytics
