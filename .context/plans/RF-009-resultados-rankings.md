# Plano de Implementação: Resultados e Rankings

Dashboard completo de resultados com rankings por segmento, métricas de campanha, gráficos de performance, e exportação de dados em CSV/Excel. Sistema calcula automaticamente top estabelecimentos por categoria baseado nos votos recebidos.

## Visão Geral

- **Rankings por Segmento**: Top 10 estabelecimentos por categoria com votos e percentual
- **Métricas de Campanha**: Taxa de conversão, tempo médio, funil de conversão
- **Gráficos Interativos**: Barras, pizza, linha temporal
- **Exportação**: CSV e Excel com múltiplas abas por segmento
- **Filtros**: Por período, segmento, campanha

## Referências

- PRD Seção 12.1: [.context/inputs/PRD.md](../inputs/PRD.md#121-exemplo-de-enquete-completa)
- [Recharts Documentation](https://recharts.org/)
- [ExcelJS Documentation](https://github.com/exceljs/exceljs)

## Pré-requisitos

1. **RF-008 Implementado**: Respostas sendo salvas
2. **Votos Registrados**: VotoEstabelecimento populado

## Passo 1: Dependências

- `recharts@2.10.3`: Gráficos React
- `exceljs@4.4.0`: Geração de Excel
- `papaparse@5.4.1`: Geração de CSV

## Passo 2: Serviços

### 2.1 Rankings Service

`src/lib/resultados/rankings-service.ts`:

**getRankingBySegmento**: Calcular ranking de um segmento
- Parâmetros: `enqueteId`, `segmentoId`, `limit` (padrão 10)
- Query: Contar votos por estabelecimento no segmento
- Calcular percentual de cada estabelecimento
- Ordenar por votos descendente
- Retornar top N com {estabelecimento, votos, percentual, posicao}

**getAllRankings**: Calcular rankings de todos os segmentos
- Buscar todos os segmentos da enquete
- Calcular ranking de cada segmento
- Retornar objeto {segmentoId: ranking[]}

**getEstabelecimentoStats**: Estatísticas de um estabelecimento
- Total de votos recebidos
- Posição em cada segmento
- Evolução temporal (votos por dia)

### 2.2 Métricas Service

`src/lib/resultados/metricas-service.ts`:

**getCampanhaMetrics**: Métricas de uma campanha
- Total de links enviados
- Total de visualizações
- Total de respostas
- Taxa de conversão (respostas / enviados)
- Tempo médio de resposta
- Funil: Enviados → Visualizados → Respondidos

**getEnqueteMetrics**: Métricas gerais da enquete
- Total de respostas
- Respostas por dia (últimos 30 dias)
- Distribuição por segmento
- Top 5 estabelecimentos geral

### 2.3 Export Service

`src/lib/resultados/export-service.ts`:

**exportToCSV**: Exportar rankings para CSV
- Formato: Segmento, Posição, Estabelecimento, Votos, Percentual
- Usar PapaParse para gerar CSV

**exportToExcel**: Exportar para Excel com múltiplas abas
- Aba "Resumo": Métricas gerais
- Aba por segmento: Ranking completo
- Aba "Respostas": Lista de todas as respostas
- Usar ExcelJS para gerar arquivo

## Passo 3: API Routes

- `GET /api/enquetes/[id]/rankings`: Todos os rankings
- `GET /api/enquetes/[id]/rankings/[segmentoId]`: Ranking de um segmento
- `GET /api/enquetes/[id]/metrics`: Métricas gerais
- `GET /api/campanhas/[id]/metrics`: Métricas de campanha
- `GET /api/enquetes/[id]/export/csv`: Exportar CSV
- `GET /api/enquetes/[id]/export/excel`: Exportar Excel

## Passo 4: Frontend

### 4.1 Página de Resultados

`src/app/(admin)/admin/enquetes/[id]/resultados/page.tsx`:

**Seções**:
1. **Métricas Gerais**: Cards com total de respostas, taxa de conversão, tempo médio
2. **Funil de Conversão**: Gráfico de funil (Enviados → Visualizados → Respondidos)
3. **Rankings por Segmento**: Tabs com ranking de cada segmento
4. **Gráfico Temporal**: Respostas por dia (linha)
5. **Botões de Exportação**: CSV e Excel

### 4.2 Componente de Ranking

`src/components/analytics/RankingTable.tsx`:

**Props**:
- `ranking` (array): Dados do ranking
- `segmento` (objeto): Informações do segmento

**Implementação**:
- Tabela com colunas: Posição, Logo, Nome, Votos, Percentual
- Medalhas para top 3 (🥇🥈🥉)
- Barra de progresso visual para percentual
- Avatar com logo do estabelecimento

### 4.3 Componente de Métricas

`src/components/analytics/MetricCard.tsx`:

**Props**:
- `title` (string): Título da métrica
- `value` (number): Valor
- `change` (number, opcional): Variação percentual
- `icon` (ReactNode): Ícone

**Implementação**:
- Card com ícone, título, valor grande
- Indicador de crescimento (↑ verde, ↓ vermelho)
- Tooltip com detalhes

### 4.4 Funil de Conversão

`src/components/analytics/ConversionFunnel.tsx`:

**Props**:
- `metrics` (objeto): {enviados, visualizados, respondidos}

**Implementação**:
- Gráfico de funil com Recharts
- Percentuais entre etapas
- Cores: Verde (alto), Amarelo (médio), Vermelho (baixo)

### 4.5 Gráfico Temporal

`src/components/analytics/TimelineChart.tsx`:

**Props**:
- `data` (array): [{data, respostas}]

**Implementação**:
- Gráfico de linha com Recharts
- Eixo X: Datas
- Eixo Y: Número de respostas
- Tooltip com data e valor

### 4.6 Hooks

`src/hooks/use-resultados.ts`:
- `useRankings()`: Buscar todos os rankings
- `useRankingBySegmento()`: Ranking de um segmento
- `useEnqueteMetrics()`: Métricas da enquete
- `useCampanhaMetrics()`: Métricas de campanha
- `useExportCSV()`: Exportar CSV
- `useExportExcel()`: Exportar Excel

## Passo 5: Testes

**Cenário 1: Visualizar rankings**
1. Acessar resultados de enquete com votos
2. Verificar rankings por segmento
3. Verificar top 3 destacado
4. **Resultado**: Rankings corretos

**Cenário 2: Métricas de campanha**
1. Acessar detalhes de campanha concluída
2. Verificar funil de conversão
3. Verificar taxa de conversão calculada
4. **Resultado**: Métricas precisas

**Cenário 3: Exportar Excel**
1. Clicar "Exportar Excel"
2. Verificar download
3. Abrir arquivo
4. Verificar múltiplas abas
5. **Resultado**: Excel com dados completos

**Cenário 4: Gráfico temporal**
1. Visualizar gráfico de respostas por dia
2. Verificar dados dos últimos 30 dias
3. **Resultado**: Gráfico preciso

## Checklist

- [ ] Instalar recharts e exceljs
- [ ] Implementar rankings-service.ts
- [ ] Implementar metricas-service.ts
- [ ] Implementar export-service.ts
- [ ] Implementar API routes
- [ ] Criar página de resultados
- [ ] Criar RankingTable
- [ ] Criar MetricCard
- [ ] Criar ConversionFunnel
- [ ] Criar TimelineChart
- [ ] Implementar hooks
- [ ] Testar cálculo de rankings
- [ ] Testar exportações
- [ ] Testar gráficos

## Notas

1. **Performance**: Cachear rankings calculados (Redis, 5 min)
2. **Empates**: Desempatar por timestamp do primeiro voto
3. **Percentuais**: Arredondar para 2 casas decimais
4. **Excel**: Incluir formatação (cores, bordas, cabeçalhos em negrito)
5. **CSV**: Usar encoding UTF-8 com BOM para Excel
6. **Tempo Real**: Atualizar rankings a cada 5 minutos
