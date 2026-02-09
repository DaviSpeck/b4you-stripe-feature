# Checklist MVP — FASE 3 (Refund/Dispute)

## Checklist de implementação
- [ ] Normalização do contrato de eventos (refund/dispute).
- [ ] Tabela de mapeamento de estados publicada e validada.
- [ ] Regras de transição de estados definidas e versionadas.
- [ ] Deduplicação por `event_id` aplicada a refund e dispute.
- [ ] Tratamento de eventos fora de ordem sem regressão.
- [ ] Histórico de eventos persistido com rastreabilidade (transaction/order/sale).

## Checklist de testes (gate obrigatório)
- [ ] Refund nacional (Pagar.me) → estado consolidado correto.
- [ ] Refund internacional (Stripe) → estado consolidado correto.
- [ ] Dispute nacional (Pagar.me) → estado consolidado correto.
- [ ] Dispute internacional (Stripe) → estado consolidado correto.
- [ ] Eventos fora de ordem processados sem regressão.
- [ ] Eventos duplicados não alteram estado.
- [ ] Transição inválida bloqueada.
- [ ] Regressão de estado não ocorre.

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
