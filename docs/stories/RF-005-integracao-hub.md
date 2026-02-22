# Story: Integração com FormBuilder Hub (RF-005)

Consumo dinâmico de formulários do FormBuilder Hub via API Pública e integração de campos customizados.

## Visão Geral
Esta story garante que o Spoke consiga carregar a estrutura dos formulários (Schema) definidos no Hub, renderizar componentes específicos (como busca de estabelecimentos) e reportar visualizações/submissions para o motor de analytics do Hub.

## Critérios de Aceite
- [x] Busca de schema de formulário via API Key pública do Hub.
- [x] Renderização de formulários dinâmicos com suporte a validação.
- [x] Implementação do campo customizado `custom-establishment` para busca de empresas locais.
- [x] Envio de eventos de telemetria (view/submit) para o Hub.

## Lista de Arquivos
- `src/lib/hub-api.ts`: Cliente de integração com API do Hub.
- `src/lib/hub-documents.ts`: Gestão de documentos e schemas remotos.
- `src/lib/hub-permissions.ts`: Validação de permissões via tokens do Hub.
- `src/app/api/hub/`: Proxies e webhooks para comunicação Hub-Spoke.

## Status: Concluído ✅
Integração core operando via `RemoteForm` components.
