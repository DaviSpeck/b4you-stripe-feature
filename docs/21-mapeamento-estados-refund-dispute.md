# Mapeamento de estados — Refund & Dispute (FASE 3)

## Objetivo
Unificar o estado interno de refund/dispute entre Pagar.me e Stripe, garantindo consistência semântica e evitando regressão.

## Estados internos (canônicos)
### Refund
- `refund_requested`
- `refund_succeeded`
- `refund_failed`

### Dispute
- `dispute_open`
- `dispute_won`
- `dispute_lost`

## Tabela de mapeamento — Refund
A tabela abaixo define a conversão de eventos de cada provedor para o estado interno canônico.

| Provedor | Evento/Status do provedor (exemplo) | Ação normalizada | Estado interno |
| --- | --- | --- | --- |
| Pagar.me | `refund.requested` / status `requested` | `request` | `refund_requested` |
| Pagar.me | `refund.completed` / status `succeeded` | `success` | `refund_succeeded` |
| Pagar.me | `refund.failed` / status `failed` | `failure` | `refund_failed` |
| Stripe | `charge.refund.updated` / status `pending` | `request` | `refund_requested` |
| Stripe | `charge.refund.updated` / status `succeeded` | `success` | `refund_succeeded` |
| Stripe | `charge.refund.updated` / status `failed` | `failure` | `refund_failed` |

> **Nota**: os nomes exatos dos eventos nativos devem ser confirmados na implementação; o mapeamento acima define a semântica esperada.

## Tabela de mapeamento — Dispute
| Provedor | Evento/Status do provedor (exemplo) | Ação normalizada | Estado interno |
| --- | --- | --- | --- |
| Pagar.me | `dispute.opened` / status `open` | `open` | `dispute_open` |
| Pagar.me | `dispute.won` / status `won` | `won` | `dispute_won` |
| Pagar.me | `dispute.lost` / status `lost` | `lost` | `dispute_lost` |
| Stripe | `charge.dispute.created` | `open` | `dispute_open` |
| Stripe | `charge.dispute.closed` / status `won` | `won` | `dispute_won` |
| Stripe | `charge.dispute.closed` / status `lost` | `lost` | `dispute_lost` |

## Eventos inválidos (sem efeito)
- Evento de `success` sem `request` prévio (gera histórico, mas **não** regride estado).
- Evento de `won/lost` quando o estado já é final (ignorar transição).
- Eventos duplicados por `event_id` (não processar novamente).

## Regressão bloqueada
- `refund_succeeded` **não** pode voltar para `refund_requested` ou `refund_failed`.
- `refund_failed` **não** pode voltar para `refund_requested` (novo refund deve gerar novo `provider_refund_id`).
- `dispute_won`/`dispute_lost` **não** podem voltar para `dispute_open`.
