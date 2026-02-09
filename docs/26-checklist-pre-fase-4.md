# Checklist de validação pré-FASE 4 (Checkout Internacional)

## Objetivo
Confirmar que a documentação mínima e as regras operacionais estão completas antes de iniciar a implementação do checkout internacional.

## 1) Mapeamento de estados → UI
- [ ] Estados internos reconhecidos e documentados (`pending`, `approved`, `failed`, `refunded`, `dispute`).
- [ ] Estados exibidos no checkout/thank you page definidos e coerentes.
- [ ] `approved` é o **único** estado que confirma pagamento.
- [ ] Estados informativos (refund/dispute) não iniciam fluxo de pagamento.

## 2) Checkout sem webhook
- [ ] Estado exibido sem webhook definido como `pending`.
- [ ] Retry controlado e idempotente.
- [ ] Mensagens de UX definidas e compatíveis com pendência.
- [ ] Proibição explícita de “aprovado” sem webhook.

## 3) Fallback do checkout legado
- [ ] Critérios de redirecionamento definidos (produto internacional + flag `enabled`).
- [ ] Fallback proibido quando produto/oferta é internacional.
- [ ] Erro controlado documentado para falha de handoff internacional.
- [ ] Relação explícita com flag e marcação de produto/oferta.

## 4) Feature flag e governança
- [ ] Fonte de verdade definida como backoffice.
- [ ] Política de cache/TTL documentada.
- [ ] Regra de inconsistência definida (fail-safe → bloquear internacional).
- [ ] Impacto operacional para CS documentado.

## 5) Observabilidade mínima para CS
- [ ] IDs mínimos visíveis (`transaction_id`, `order_id`, `sale_id`, `provider`).
- [ ] Correlação de suporte definida (por `transaction_id`/`order_id`).
- [ ] Status interno consolidado disponível sem depender do Stripe.

## Gate final
- [ ] Todos os itens acima concluídos e revisados.
- [ ] Documento complementar aprovado.

