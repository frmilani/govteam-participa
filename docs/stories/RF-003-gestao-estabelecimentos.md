# Story: Gestão de Estabelecimentos (RF-003)

Gerenciamento dos estabelecimentos que participarão das premiações, com suporte a múltiplos segmentos e upload de logo.

## Visão Geral
Permite aos administradores cadastrar empresas, associá-las a categorias (segmentos) e gerenciar informações de contato (WhatsApp, Instagram). Suporta importação massiva via CSV.

## Critérios de Aceite
- [x] CRUD manual de estabelecimentos com validação de campos obrigatórios.
- [x] Upload de logo armazenado no MinIO/S3.
- [x] Associação de um estabelecimento a múltiplos segmentos.
- [x] Importação massiva via arquivo CSV com mapeamento de colunas.
- [x] Toggle de status (Ativo/Inativo).

## Lista de Arquivos
- `src/app/admin/estabelecimentos/page.tsx`: Dashboard de estabelecimentos.
- `src/components/admin/estabelecimento-form.tsx`: Formulário principal.
- `src/components/admin/import-estabelecimentos-wizard.tsx`: Wizard de importação CSV.
- `src/lib/estabelecimentos/`: Lógica de serviço e integração com DB.
- `src/app/api/estabelecimentos/`: Endpoints de CRUD e importação.

## Status: Concluído ✅
Funcionalidade estável e testada.
