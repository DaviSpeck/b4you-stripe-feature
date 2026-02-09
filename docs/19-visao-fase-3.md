# Visão da FASE 3 — Convergência operacional de refund/dispute

## Objetivo
Consolidar o modelo interno de estados para **refunds** (reembolsos) e **disputes/chargebacks** entre Pagar.me (nacional) e Stripe (internacional), garantindo que ambos os provedores sejam tratados por um conjunto único de regras de transição, histórico e rastreabilidade.

## Escopo
### Inclui
- Mapeamento de estados internos para refund e dispute, por provedor.
- Regras de transição de estados (inclusive bloqueio de regressão).
- Contrato de eventos para refund/dispute (campos obrigatórios e metadados).
- Histórico de eventos com rastreabilidade por transação.
- Testes de contrato definidos (formato automatizado, ainda não implementados).

### Não inclui
- Saques (payout) e saldos consolidados.
- UI/UX de dashboard/backoffice.
- Heurísticas de detecção de país.
- Antifraude internacional.
- Split de pagamento/Stripe Connect.

## Entregáveis
1. Documento de visão da FASE 3.
2. Contrato de eventos refund/dispute.
3. Tabela de mapeamento de estados (Pagar.me/Stripe → estado interno).
4. Checklist do MVP da FASE 3.
5. Testes de contrato definidos (formato automatizado, sem implementação).

## Critérios de bloqueio
A fase é considerada **BLOQUEADA** se:
- Não houver tabela de mapeamento de estados.
- Regras de transição não estiverem definidas.
- Existirem conflitos conceituais entre provedores.
- Regressão de estado não estiver definida.
- Cenários de eventos fora de ordem não estiverem cobertos.

## Critérios de avanço
A fase é considerada **PRONTA** se:
- Todos os testes de contrato passarem (conceitualmente).
- A documentação estiver atualizada.
- O modelo interno de estados estiver definido.
- Não houver ambiguidade operacional.

## Referências de implementação
- Contrato de eventos refund/dispute: `docs/20-contrato-eventos-refund-dispute.md`
- Mapeamento de estados: `docs/21-mapeamento-estados-refund-dispute.md`
- Checklist e gates: `docs/22-checklist-fase-3.md`
- Testes de contrato (definição): `docs/23-testes-contrato-fase-3.md`
