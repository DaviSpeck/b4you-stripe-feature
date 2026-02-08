# Critérios de aceite e validação

## Critérios de aceite por projeto
### b4you-lambdas
- Webhooks Stripe processam eventos de pagamento, reembolso e dispute.
- Persistência de `provider_*` IDs com rastreio interno.
- Logs e métricas para cada tipo de evento.

### api-checkout
- Criação de pagamento internacional com Stripe operacional.
- Retorno de dados necessários ao checkout.
- Feature flag bloqueia operações não liberadas.

### b4you-checkout (novo checkout)
- Fluxo internacional em EN funcional.
- Comunicação com api-checkout validada.
- Tratamento de erros e mensagens consistentes.

### sixbase-checkout (checkout legado)
- Redirecionamento para checkout internacional apenas quando produto for internacional.
- Fluxo nacional inalterado.

### sixbase-dashboard
- Exibição de transações internacionais e status.
- Campo de `provider_*` IDs visível.
- Visualização de disputes e reembolsos.

### sixbase-api-backoffice
- Cadastro e edição de produtos/ofertas internacionais.
- Feature flag aplicada e auditada.

## Pontos de validação técnica
- Assinatura de webhooks validada e testada.
- Rastreabilidade: `transaction_id`, `order_id`, `sale_id` sempre presentes.
- Persistência confiável de `provider_*` IDs.
- Feature flag consistente entre serviços.
- Observabilidade mínima (logs e métricas) configurada.

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
