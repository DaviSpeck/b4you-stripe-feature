# Encerramento formal — FASE 1 (Stripe MVP)

## O que a FASE 1 ENTREGA
- Criação de PaymentIntent internacional no api-checkout.
- Idempotência garantida por `transaction_id`.
- Persistência de `provider_payment_intent_id`, `transaction_id`, `order_id`, `sale_id`.
- Feature flag bloqueando criação quando desabilitada.
- Isolamento total do fluxo nacional (Pagar.me).
- Observabilidade mínima com logs e métricas por provedor.

## O que a FASE 1 NÃO ENTREGA
- Webhooks Stripe.
- Atualização de estados finais (paid/refunded/dispute).
- Reembolso, disputa ou saldo.
- Integração com dashboard ou backoffice.
- Checkout/UI ou handoff do checkout legado.

## Limitações explícitas da FASE 1
- Status interno permanece **pendente** até a FASE 2.
- Sem confirmação de pagamento por api-checkout.
- Nenhuma conciliação ou reconciliação financeira.

## Persistência do PaymentIntent
- A tabela `stripe_payment_intents` é criada via migração centralizada no projeto **sixbase-api**.

## Dependências para a FASE 2
- Implementação de webhooks Stripe (b4you-lambdas).
- Normalização de eventos e atualização de estados internos.
- Reprocessamento e idempotência por `event_id`.

---

**FASE 1 ENCERRADA**  
Pré-requisitos atendidos e documentação atualizada.  
Autorização para iniciar a **FASE 2** após validação formal deste encerramento.
