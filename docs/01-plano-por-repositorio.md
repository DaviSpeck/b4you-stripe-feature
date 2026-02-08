# Plano por repositório

## b4you-lambdas
- **Objetivo no Stripe**: processar eventos de webhook e acionar atualizações internas de estado.
- **Responsabilidades**:
  - Normalização de payloads Stripe.
  - Mapeamento de eventos para status internos.
  - Emissão de sinais para demais serviços (ex.: filas/tópicos existentes).
  - Enriquecimento dos eventos com `transaction_id`, `order_id` e `sale_id`.
  - Deduplicação e idempotência por evento Stripe.
  - Enfileiramento de eventos críticos para processamento assíncrono controlado.
  - Registro de falhas de processamento com rastreabilidade e motivo.
- **Módulos/camadas impactadas**:
  - Handlers de webhook.
  - Camadas de validação/assinatura.
  - Integrações com observabilidade.
  - Camada de persistência de eventos/processamento.
  - Integração com filas/tópicos internos existentes.
- **Visão geral das mudanças esperadas**:
  - Novos handlers e rotas para webhooks Stripe.
  - Persistência de `provider_*` IDs.
  - Contratos de status internos alinhados aos eventos Stripe.
  - Processamento robusto de replays e eventos fora de ordem.

## api-checkout
- **Objetivo no Stripe**: orquestrar criação de pagamentos internacionais e expor endpoints necessários para o checkout.
- **Responsabilidades**:
  - Criar intentos de pagamento internacionais.
  - Fornecer dados de pagamento ao checkout.
  - Garantir aderência à feature flag.
  - Definir metadata obrigatória para rastreio nos objetos Stripe.
  - Consolidar status internos com base em webhooks.
  - Garantir compatibilidade com modelos de venda existentes (order/sale/transaction).
  - Definir contratos de falha e expiração do pagamento internacional.
- **Módulos/camadas impactadas**:
  - Camada de pagamentos.
  - Feature flags.
  - Persistência de transações.
  - Contratos públicos de API (request/response) do checkout internacional.
  - Mapeamento de estados internos de pagamento.
  - Integração com serviços de catálogo (produto/oferta).
- **Visão geral das mudanças esperadas**:
  - Inclusão de gateway Stripe para produtos internacionais.
  - Contratos de API com metadata para rastreamento.
  - Separação explícita de fluxo internacional vs. nacional.
  - Tratamento de idempotência em criação de intents.
  - Exposição de status consolidado e timestamps relevantes.

## b4you-checkout (novo checkout)
- **Objetivo no Stripe**: oferecer experiência internacional em EN com Stripe como gateway.
- **Responsabilidades**:
  - Interface do checkout internacional.
  - Fluxo de pagamento com cartão internacional.
  - Comunicação com api-checkout.
  - Exibição de estados intermediários e finais (approved, pending, failed).
  - Tratamento de estados de reembolso e disputa (informativo pós-compra).
  - Persistência de contexto mínimo para recuperação de sessão.
- **Módulos/camadas impactadas**:
  - UI/UX internacional.
  - Integração com gateway.
  - Controle por feature flag.
  - Internacionalização (strings e mensagens EN).
  - Componentes de status pós-compra (success/failure/pending).
- **Visão geral das mudanças esperadas**:
  - Rotas e páginas específicas para internacional.
  - Parametrização de moeda e idioma.
  - Contrato de tratamento de erros e mensagens de falha.
  - Manuseio de falhas de autorização e 3DS (quando aplicável).

## sixbase-checkout (checkout legado)
- **Objetivo no Stripe**: manter compatibilidade e roteamento correto para internacional.
- **Responsabilidades**:
  - Redirecionamento controlado para checkout internacional.
  - Manter experiência nacional intacta.
  - Garantir compatibilidade com URLs e parâmetros existentes.
  - Preservar métricas e tracking legados no handoff.
- **Módulos/camadas impactadas**:
  - Roteamento de checkout.
  - Feature flag.
  - Identificação de produto/oferta internacional.
  - Camada de tracking e analytics.
- **Visão geral das mudanças esperadas**:
  - Identificação de produto internacional e handoff para novo checkout.
  - Mecanismo de fallback seguro para fluxo nacional.
  - Manutenção de parâmetros críticos (campaign, affiliate, etc).

## sixbase-dashboard
- **Objetivo no Stripe**: exibir controle e status para operações internacionais.
- **Responsabilidades**:
  - Visualização de transações Stripe.
  - Indicadores de status e chargebacks.
  - Integração com feature flag.
  - Exposição de `provider_*` IDs para reconciliação.
  - Controle operacional pelo produtor após liberação (feature em uso).
  - Visualização do status internacional do produto/oferta.
- **Módulos/camadas impactadas**:
  - UI de operações internacionais.
  - API de dados de pagamento.
  - Telas de detalhe de transação e histórico.
  - Módulos de configuração do produtor (quando liberado).
- **Visão geral das mudanças esperadas**:
  - Campos para `provider_*` IDs e status de webhook.
  - Componentes de linha do tempo de eventos Stripe.
  - Seções de habilitação/estado da feature visíveis ao produtor.

## sixbase-api-backoffice
- **Objetivo no Stripe**: controlar a liberação da feature flag e gerenciar produtos internacionais.
- **Responsabilidades**:
  - CRUD de produtos/ofertas internacionais.
  - Gestão de feature flags.
  - Expor endpoints para dashboards.
  - Auditar mudanças de status internacional e feature flag.
  - Regras de validação para impedir uso indevido de internacional.
  - Disponibilizar status de habilitação para o dashboard.
- **Módulos/camadas impactadas**:
  - Modelos de produto/oferta.
  - Feature flag service.
  - Auditoria/observabilidade.
  - Validações de cadastro (internacional explícito).
  - Camada de permissões internas.
- **Visão geral das mudanças esperadas**:
  - Campos explícitos para internacional.
  - Regras de validação e liberação.
  - Endpoints para consulta de configuração ativa.
  - Auditoria mínima de operações internas.

## sixbase-backoffice
- **Objetivo no Stripe**: operar e administrar produtos/ofertas internacionais e feature flag pelo backoffice.
- **Responsabilidades**:
  - UI de cadastro e edição de produto/oferta internacional.
  - UI para controle da feature flag de Stripe.
  - Visualização de status de liberação e histórico de alterações.
  - Governança interna da B4You para habilitar a integração via checkout.
- **Módulos/camadas impactadas**:
  - Páginas de produtos/ofertas.
  - Componentes de configuração e permissões.
  - Integração com sixbase-api-backoffice.
  - Auditoria básica na interface (log de ações).
- **Visão geral das mudanças esperadas**:
  - Campos e validações explícitas para internacional.
  - Tela de controle de feature flag com auditoria básica.
  - Separação clara entre habilitação interna e uso no dashboard.
