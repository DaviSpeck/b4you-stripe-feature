# Plano por repositório

## b4you-lambdas
- **Objetivo no Stripe**: processar eventos de webhook e acionar atualizações internas de estado.
- **Responsabilidades**:
  - Normalização de payloads Stripe.
  - Mapeamento de eventos para status internos.
  - Emissão de sinais para demais serviços (ex.: filas/tópicos existentes).
- **Módulos/camadas impactadas**:
  - Handlers de webhook.
  - Camadas de validação/assinatura.
  - Integrações com observabilidade.
- **Visão geral das mudanças esperadas**:
  - Novos handlers e rotas para webhooks Stripe.
  - Persistência de `provider_*` IDs.

## api-checkout
- **Objetivo no Stripe**: orquestrar criação de pagamentos internacionais e expor endpoints necessários para o checkout.
- **Responsabilidades**:
  - Criar intentos de pagamento internacionais.
  - Fornecer dados de pagamento ao checkout.
  - Garantir aderência à feature flag.
- **Módulos/camadas impactadas**:
  - Camada de pagamentos.
  - Feature flags.
  - Persistência de transações.
- **Visão geral das mudanças esperadas**:
  - Inclusão de gateway Stripe para produtos internacionais.
  - Contratos de API com metadata para rastreamento.

## b4you-checkout (novo checkout)
- **Objetivo no Stripe**: oferecer experiência internacional em EN com Stripe como gateway.
- **Responsabilidades**:
  - Interface do checkout internacional.
  - Fluxo de pagamento com cartão internacional.
  - Comunicação com api-checkout.
- **Módulos/camadas impactadas**:
  - UI/UX internacional.
  - Integração com gateway.
  - Controle por feature flag.
- **Visão geral das mudanças esperadas**:
  - Rotas e páginas específicas para internacional.
  - Parametrização de moeda e idioma.

## sixbase-checkout (checkout legado)
- **Objetivo no Stripe**: manter compatibilidade e roteamento correto para internacional.
- **Responsabilidades**:
  - Redirecionamento controlado para checkout internacional.
  - Manter experiência nacional intacta.
- **Módulos/camadas impactadas**:
  - Roteamento de checkout.
  - Feature flag.
- **Visão geral das mudanças esperadas**:
  - Identificação de produto internacional e handoff para novo checkout.

## sixbase-dashboard
- **Objetivo no Stripe**: exibir controle e status para operações internacionais.
- **Responsabilidades**:
  - Visualização de transações Stripe.
  - Indicadores de status e chargebacks.
  - Integração com feature flag.
- **Módulos/camadas impactadas**:
  - UI de operações internacionais.
  - API de dados de pagamento.
- **Visão geral das mudanças esperadas**:
  - Campos para `provider_*` IDs e status de webhook.

## sixbase-api-backoffice
- **Objetivo no Stripe**: controlar a liberação da feature flag e gerenciar produtos internacionais.
- **Responsabilidades**:
  - CRUD de produtos/ofertas internacionais.
  - Gestão de feature flags.
  - Expor endpoints para dashboards.
- **Módulos/camadas impactadas**:
  - Modelos de produto/oferta.
  - Feature flag service.
  - Auditoria/observabilidade.
- **Visão geral das mudanças esperadas**:
  - Campos explícitos para internacional.
  - Regras de validação e liberação.
