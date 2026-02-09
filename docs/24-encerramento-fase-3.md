# Encerramento — FASE 3 (Refund/Dispute)

## Resumo executivo
A FASE 3 foi concluída com a convergência operacional de refund e dispute entre Pagar.me (nacional) e Stripe (internacional), seguindo o contrato de eventos, o mapeamento de estados e as regras de transição definidos previamente. O processamento agora aplica deduplicação por `event_id`, bloqueio de regressão e tolerância a eventos fora de ordem, mantendo histórico persistido e rastreabilidade por transação.

## O que a FASE 3 entrega
- Processamento de refund e dispute para Pagar.me e Stripe.
- Normalização de eventos conforme contrato estabelecido.
- Mapeamento de estados internos canônicos aplicado.
- Regras de transição com deduplicação, bloqueio de regressão e tolerância a eventos fora de ordem.
- Histórico de eventos persistido com rastreabilidade (transaction/order/sale).
- Testes automatizados cobrindo cenários nacionais e internacionais.

## O que a FASE 3 NÃO entrega
- Saques (payout) e saldo consolidado de recebedores.
- UI/UX de dashboard ou backoffice.
- Heurísticas de detecção de país.
- Integração com antifraude internacional.
- Split de pagamento ou Stripe Connect.

## Limitações conhecidas
- O contrato de eventos segue a semântica atual dos provedores, podendo depender de campos como `status` nos objetos de refund/dispute.
- A reconciliação entre refund e dispute permanece sem heurísticas adicionais quando eventos finais conflitantes forem recebidos; prevalece a regra de transição definida.

## Compatibilidade operacional
- **Compatibilidade confirmada** entre Pagar.me e Stripe no modelo interno de refund/dispute.
- **Fluxo nacional não impactado**: a implementação mantém o isolamento do processamento Pagar.me.

## Gate de testes
- Todos os testes definidos para refund/dispute (nacional e internacional), duplicidade, fora de ordem, transição inválida e regressão de estado foram automatizados e executados.

