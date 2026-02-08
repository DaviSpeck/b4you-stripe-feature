# Detalhamento — sixbase-api (API do Dashboard)

## Escopo deste complemento
Definir contratos e comportamento da API do dashboard para consulta de dados Stripe, sem alterar o fluxo nacional e sem introduzir novas features.

## Endpoints que expõem dados Stripe
- Endpoints de listagem e detalhe de transações devem aceitar segmentação por `provider`.
- Endpoints específicos para histórico de eventos e status devem aceitar apenas leitura.

## Consulta de transações internacionais
- As transações internacionais são consultadas **por filtros explícitos** (`provider = stripe` e/ou `internacional = true`).
- A API expõe resultados separados de nacionais para evitar mistura de dados.

## Status, refunds e disputes
- O status exibido é o **estado interno consolidado**, atualizado via webhooks.
- Refunds e disputes são retornados como **substatus** da transação, mantendo vínculo com `provider_*` IDs.

## Consistência com o estado interno
- A API do dashboard **nunca** infere estado; apenas expõe o estado interno vigente.
- Se o webhook ainda não chegou, o status permanece **pendente**.

## Como o dashboard sabe que o pagamento está aprovado
- O dashboard recebe `status = approved` **apenas** após a atualização interna proveniente de webhook.
- Não há confirmação por polling.

## Comportamento quando o webhook ainda não chegou
- O endpoint retorna estado **pendente**, com indicação de processamento.
- O dashboard deve refletir essa pendência sem alterar o estado.

## Paginação, filtros e segmentação por `provider`
- Listagens suportam paginação padrão (limit/offset ou cursor).
- Filtros obrigatórios: `provider`, `status`, intervalo de datas, `internacional`.
- Segmentação explícita para evitar que Stripe apareça em telas nacionais.

## O que a sixbase-api NÃO processa no MVP
- Não processa webhooks.
- Não atualiza estados de pagamento.
- Não executa reconciliação financeira.
- Não cria ou modifica transações.
