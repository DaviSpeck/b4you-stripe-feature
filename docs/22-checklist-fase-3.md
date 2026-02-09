# Checklist MVP — FASE 3 (Refund/Dispute)

## Checklist de implementação
- [x] Normalização do contrato de eventos (refund/dispute).
- [x] Tabela de mapeamento de estados publicada e validada.
- [x] Regras de transição de estados definidas e versionadas.
- [x] Deduplicação por `event_id` aplicada a refund e dispute.
- [x] Tratamento de eventos fora de ordem sem regressão.
- [x] Histórico de eventos persistido com rastreabilidade (transaction/order/sale).

## Checklist de testes (gate obrigatório)
- [x] Refund nacional (Pagar.me) → estado consolidado correto.
- [x] Refund internacional (Stripe) → estado consolidado correto.
- [x] Dispute nacional (Pagar.me) → estado consolidado correto.
- [x] Dispute internacional (Stripe) → estado consolidado correto.
- [x] Eventos fora de ordem processados sem regressão.
- [x] Eventos duplicados não alteram estado.
- [x] Transição inválida bloqueada.
- [x] Regressão de estado não ocorre.

## Gate de bloqueio
A fase é **bloqueada** se:
- Não houver mapeamento de estados publicado.
- Não houver regras de transição explícitas.
- Houver ambiguidade entre eventos de provedores.
- Eventos fora de ordem não estiverem cobertos.

## Gate de avanço
A fase só avança se:
- Todos os testes de contrato definidos estiverem conceitualmente aprovados.
- Documentação atualizada e sem conflitos.
- Regras de transição revisadas por operação e engenharia.
