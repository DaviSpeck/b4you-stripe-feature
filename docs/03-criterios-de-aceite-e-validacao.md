# Critérios de aceite e validação

## Critérios de aceite por projeto
### b4you-lambdas
- Webhooks Stripe processam eventos de pagamento, reembolso e dispute.
- Persistência de `provider_*` IDs com rastreio interno.
- Logs e métricas para cada tipo de evento.
- Idempotência validada para eventos repetidos.
- Eventos fora de ordem não causam regressão de status.
- `provider` registrado em todo evento processado.

### api-checkout
- Criação de pagamento internacional com Stripe operacional.
- Retorno de dados necessários ao checkout.
- Feature flag bloqueia operações não liberadas.
- Metadata obrigatória enviada ao Stripe e recuperável nos webhooks.
- Idempotência garantida em retries do checkout.
- Timestamps críticos disponíveis para conciliação.
- `provider` persistido na transação e exposto nas respostas de API.
- Fluxo nacional preservado sem regressões.

### b4you-checkout (novo checkout)
- Fluxo internacional em EN funcional.
- Comunicação com api-checkout validada.
- Tratamento de erros e mensagens consistentes.
- Exibição de moeda e idioma alinhados ao internacional.
- Estados pós-compra (pending/refunded/dispute) disponíveis.

### sixbase-checkout (checkout legado)
- Redirecionamento para checkout internacional apenas quando produto for internacional.
- Fluxo nacional inalterado.
- Parâmetros legados preservados no redirecionamento.
- Fallback seguro preserva experiência nacional.

### sixbase-dashboard
- Exibição de transações internacionais e status.
- Campo de `provider_*` IDs visível.
- Visualização de disputes e reembolsos.
- Histórico básico de eventos Stripe por transação.
- Status de habilitação internacional visível ao produtor.

### sixbase-api-backoffice
- Cadastro e edição de produtos/ofertas internacionais.
- Feature flag aplicada e auditada.
- Endpoints de consulta de status internacional disponíveis.
- Status da feature exposto para consumo do dashboard.

### sixbase-backoffice
- Tela de produto/oferta suporta campo “internacional”.
- Feature flag Stripe controlável e visível.
- Histórico básico de alterações disponível.
- Comunicação clara de que o uso operacional ocorre no dashboard.

## Pontos de validação técnica
- Assinatura de webhooks validada e testada.
- Rastreabilidade: `transaction_id`, `order_id`, `sale_id` sempre presentes.
- Persistência confiável de `provider_*` IDs.
- Feature flag consistente entre serviços.
- Observabilidade mínima (logs e métricas) configurada.
- Idempotência de webhooks validada em cenários de replay.
- Endpoints de backoffice expostos e consumidos pelos frontends.
- Governança: dashboard controla uso operacional; backoffice controla habilitação interna.
- Provedor identificável em todo o ciclo de vida (checkout → webhook → dashboard).

## Regras de go/no-go
### Go
- Todos os critérios por projeto atendidos.
- Pagamentos internacionais confirmados por webhook.
- Reembolsos e disputes registrados corretamente.

### No-go
- Webhooks sem validação de assinatura.
- Falta de persistência de IDs Stripe.
- Feature flag não operacional.
- Impacto no fluxo nacional.

## Definição de MVP pronto
O MVP é considerado pronto quando:
- Pagamentos internacionais via Stripe ocorrem do início ao fim sem interferir no fluxo nacional.
- Reembolsos e disputes são processados com rastreabilidade interna completa.
- Observabilidade permite diagnóstico e auditoria básicos.
- Feature flag garante controle de exposição.
