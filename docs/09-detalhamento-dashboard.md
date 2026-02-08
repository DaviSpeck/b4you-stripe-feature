# Detalhamento — sixbase-dashboard

## Escopo deste complemento
Definir como o dashboard apresenta dados Stripe ao produtor, mantendo separação visual e operacional entre nacional e internacional.

## Informações Stripe visíveis ao produtor
- `provider` e `provider_*` IDs.
- Status consolidado (approved, pending, refunded, dispute).
- Histórico básico de eventos Stripe.

## Momento em que o pagamento aparece como aprovado
- Apenas após atualização interna confirmada via webhook.
- Antes disso, permanece pendente.

## Exibição de refunds e disputes
- Refunds e disputes aparecem como substatus no detalhe da transação.
- Histórico de eventos mostra data/hora da mudança.

## Como o produtor entende o estado atual
- Status principal + histórico de eventos.
- Indicação clara de `provider`.

## Separação visual entre nacional e internacional
- Listagens separadas ou filtros obrigatórios.
- Métricas segmentadas por provedor.

## Garantias de que dados Stripe não contaminam telas nacionais
- Telas nacionais não consomem endpoints de Stripe.
- Filtros obrigatórios evitam mistura de dados.

## O que o dashboard NÃO faz no MVP
- Não processa pagamentos.
- Não atualiza estado de transações.
- Não executa reconciliação financeira.
