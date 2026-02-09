# Encerramento formal — FASE 2 (Stripe MVP)

## O que a FASE 2 ENTREGA
- Criação do grafo transacional completo no checkout internacional (`sales`, `sales_items`, `charges`, `transactions` e relacionamentos).
- Status inicial **pendente** em todas as entidades do grafo (espelhando Pix/Boleto/Cartão Pagar.me).
- `provider = stripe` e `provider_id` aplicados corretamente nas entidades de pagamento.
- Processamento de webhooks Stripe com:
  - validação de assinatura;
  - idempotência por `event_id`;
  - deduplicação e reprocessamento seguro;
  - tolerância a eventos fora de ordem;
  - consolidação de estado interno.
- Isolamento total do fluxo nacional (Pagar.me não é acionado).
- Compatibilidade operacional com o modelo Pagar.me.
- Governança preservada:
  - backoffice = habilitação/configuração;
  - dashboard = consumo e acompanhamento.

## O que a FASE 2 NÃO ENTREGA
- Unificação de estados finais entre nacional e internacional.
- Reembolso e disputa como fluxo operacional completo.
- Histórico completo de eventos no dashboard.
- Integração de UI/checkout novo.
- Fluxo de handoff do checkout legado.

## Limitações explícitas da FASE 2
- O status inicial permanece **pendente** até consolidação por webhooks.
- Sem ajustes no modelo operacional do fluxo nacional.
- Sem mudanças no backoffice além da governança já prevista.

## Compatibilidade com Pagar.me
- O Stripe é tratado apenas como **origem** do pagamento; o processo segue o mesmo modelo operacional do Pagar.me.
- O grafo transacional e os estados internos preservam semântica equivalente ao fluxo nacional.
- Nenhuma chamada, dependência ou alteração é introduzida no fluxo nacional.

## Riscos de negócio remanescentes (não técnicos)
- Dependência de comunicação clara sobre status pendente no pós-compra internacional.
- Necessidade de alinhamento operacional para tratamento de reembolsos e disputas em fases futuras.
- Possível expectativa de paridade total de recursos entre nacional e internacional antes da conclusão das fases seguintes.

---

**FASE 2 ENCERRADA**  
Critérios de conclusão atendidos e gate de testes satisfeito.  
Sem pendências de escopo dentro da FASE 2.
