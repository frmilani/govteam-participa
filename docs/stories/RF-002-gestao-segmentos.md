# Story: Gestão de Segmentos (RF-002)

CRUD completo de segmentos (categorias) com suporte a hierarquia de dois níveis para organizar estabelecimentos.

## Visão Geral
Gerenciamento de categorias como "Alimentação", "Comércio", etc., permitindo a criação de subcategorias. Essencial para agrupar estabelecimentos nas enquetes e gerar rankings segmentados.

## Critérios de Aceite
- [x] Criar segmento pai com nome e slug únicos por organização.
- [ ] Criar segmento filho associado a um pai.
- [x] Editar nome, ícone e cor do segmento.
- [x] Listagem de segmentos com suporte a busca.
- [ ] Drag and drop para reordenar segmentos (Opcional).

## Lista de Arquivos
- `src/app/admin/segmentos/page.tsx`: Lista e gestão de segmentos.
- `src/components/admin/segmento-form-modal.tsx`: Modal de criação/edição.
- `src/components/admin/segmento-item.tsx`: Componente de linha da lista.
- `src/app/api/segmentos/route.ts`: API de CRUD.

## Status: Parcial 🔄
Funcionalidades básicas de CRUD implementadas, falta refinanciar a hierarquia de filhos e reordenação.
