# Contrato de eventos — Refund & Dispute (FASE 3)

## Objetivo
Definir o contrato mínimo de eventos para refund e dispute, garantindo processamento idempotente, rastreabilidade completa e transições de estado consistentes para Pagar.me e Stripe.

## Estrutura geral do evento
Todo evento recebido (webhook) deve ser normalizado para o seguinte envelope interno:

```json
{
  "event_id": "string",
  "provider": "pagarme|stripe",
  "provider_event": "string",
  "provider_reference_id": "string",
  "transaction_id": "string",
  "order_id": "string",
  "sale_id": "string",
  "occurred_at": "ISO-8601",
  "event_type": "refund|dispute",
  "event_action": "request|success|failure|open|won|lost",
  "amount": 12345,
  "currency": "BRL|USD|...",
  "reason": "string|null",
  "metadata": {
    "provider_charge_id": "string|null",
    "provider_refund_id": "string|null",
    "provider_dispute_id": "string|null",
    "raw_status": "string|null"
  }
}
```

### Campos obrigatórios
- `event_id`: idempotência e deduplicação.
- `provider`: origem do evento (`pagarme` ou `stripe`).
- `provider_event`: tipo nativo do provedor (ex.: `charge.refunded`, `charge.dispute.created`).
- `provider_reference_id`: id do objeto no provedor (charge/refund/dispute).
- `transaction_id`, `order_id`, `sale_id`: rastreabilidade interna.
- `occurred_at`: data/hora do evento no provedor.
- `event_type`: `refund` ou `dispute`.
- `event_action`: ação normalizada (ver tabela abaixo).

### Campos opcionais
- `amount`, `currency`: obrigatórios quando o provedor fornece valor do evento.
- `reason`: motivo do refund/dispute quando disponível.
- `metadata`: ids auxiliares e `raw_status` original do provedor.

## Contrato de eventos — Refund
Fluxo canônico:
1. `request` → 2. `success` → 3. `failure` (quando aplicável)

### Ações aceitas
| Ação | Descrição | Observação |
| --- | --- | --- |
| `request` | Refund solicitado | cria estado `refund_requested` |
| `success` | Refund concluído | cria estado `refund_succeeded` |
| `failure` | Refund falhou | cria estado `refund_failed` |

## Contrato de eventos — Dispute
Fluxo canônico:
1. `open` → 2. `won` ou `lost`

### Ações aceitas
| Ação | Descrição | Observação |
| --- | --- | --- |
| `open` | Disputa aberta | cria estado `dispute_open` |
| `won` | Disputa vencida | cria estado `dispute_won` |
| `lost` | Disputa perdida | cria estado `dispute_lost` |

## Idempotência e deduplicação
- `event_id` é a chave primária de deduplicação.
- Eventos duplicados **não** devem alterar estado nem gerar novo histórico.

## Tratamento de eventos fora de ordem
- Eventos fora de ordem devem ser aceitos **sem regressão**.
- A mudança de estado só ocorre se a nova transição for **mais avançada** conforme a regra de transição definida na FASE 3.

## Observações operacionais
- O contrato não presume UI, apenas persistência e rastreabilidade interna.
- A normalização deve preservar o `provider_event` original para auditoria.
- Valores (`amount`, `currency`) são obrigatórios quando fornecidos pelo provedor, mas não bloqueiam o processamento caso o provedor não os envie.
