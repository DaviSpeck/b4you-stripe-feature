# Contratos e fluxos internos

## Payload mínimo de eventos internos derivados de Stripe
- `event_id`
- `provider = stripe`
- `provider_event_type`
- `provider_payment_intent_id`
- `provider_charge_id`
- `provider_refund_id` (quando aplicável)
- `provider_dispute_id` (quando aplicável)
- `transaction_id`
- `order_id`
- `sale_id`
- `status`
- `occurred_at`

## Campos obrigatórios para checkout e dashboard
- `transaction_id`, `order_id`, `sale_id`
- `provider`
- `provider_*` IDs
- `status` consolidado
- `created_at` e `updated_at`

## Garantias de presença de IDs internos
- `transaction_id`, `order_id`, `sale_id` são obrigatórios em todo o ciclo.
- Webhooks sem esses dados são rejeitados ou registrados como inválidos.

## Relação entre PaymentIntent, Charge, Refund e Dispute
- PaymentIntent é o identificador raiz do pagamento.
- Charge representa a captura/efetivação.
- Refund referencia a Charge.
- Dispute referencia a Charge.

## Propagação do campo `provider`
- Definido na criação do pagamento.
- Persistido em todas as entidades internas.
- Exposto em todos os contratos com checkout e dashboard.

## Estados finais válidos e inválidos
### Válidos
- `approved`
- `pending`
- `refunded`
- `dispute`
- `failed`

### Inválidos
- Estados não mapeados pelo modelo interno.
- Estados sem `provider` definido.
