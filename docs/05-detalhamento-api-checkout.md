# Detalhamento — api-checkout

## Escopo deste complemento
Documentar o fluxo operacional do pagamento internacional via Stripe, mantendo a estrutura atual intacta e isolando o fluxo nacional. Este documento não altera decisões já tomadas e não introduz novas features.

## Momento de início do pagamento internacional
- O pagamento internacional é iniciado **no momento em que o checkout internacional solicita a criação do pagamento** (ação do usuário ao confirmar o pagamento).
- A decisão entre **nacional vs internacional** é feita **antes da criação do pagamento**, com base em produto/oferta marcado explicitamente como internacional.

## Criação do PaymentIntent (Stripe)
- O PaymentIntent é criado **imediatamente após a validação do produto/oferta internacional** e do contexto de compra.
- A criação ocorre **somente no fluxo internacional**, nunca no nacional.
- A criação inclui metadata obrigatória: `transaction_id`, `order_id`, `sale_id` e `provider`.
- A persistência do PaymentIntent ocorre na tabela `stripe_payment_intents` (migração centralizada no **sixbase-api**).

## Estados internos (pré e pós webhooks)
- **Pré-webhook**: o pagamento permanece em estado **pendente** no modelo interno, aguardando confirmação por webhook.
- **Pós-webhook**: o estado interno é atualizado **exclusivamente** pelos webhooks processados pelas lambdas.
- O api-checkout **não** realiza polling para confirmação.
- **FASE 1**: não existe lógica de estado final; apenas criação e persistência do PaymentIntent com status `pending`.

## Estratégia de idempotência na criação de pagamento
- A criação do PaymentIntent deve aceitar **retries do checkout** sem duplicar transações.
- A chave de idempotência é derivada do contexto interno (ex.: `transaction_id`/`order_id`), garantindo que o mesmo pagamento resulte no mesmo intento.

## Quando o webhook ainda não chegou
- O api-checkout retorna ao checkout um status **pendente** e dados suficientes para o usuário acompanhar o fluxo.
- O estado interno permanece inalterado até o webhook efetivo.
- O checkout deve exibir estado compatível com **pendência** (sem confirmação falsa).

## Dados retornados ao checkout
- `transaction_id`, `order_id`, `sale_id`
- Identificador do PaymentIntent (provider ID)
- `provider = stripe`
- Status atual (pendente)
- Informações necessárias para concluir o fluxo do checkout

## Definição e persistência do campo `provider`
- `provider` é definido no momento da criação do pagamento, antes de qualquer chamada ao Stripe.
- Para internacional: `provider = stripe`.
- Para nacional: `provider = pagarme`.
- O campo é persistido em todas as entidades internas associadas (transação/venda/pedido).

## Separação explícita de fluxo nacional vs internacional
- Rotas internacionais são **explicitamente separadas** do fluxo nacional.
- A seleção do gateway é feita **antes** de qualquer criação de pagamento.
- Nenhum fluxo nacional é alterado pelo Stripe.

## Garantias de que o fluxo nacional não sofre regressão
- Contratos nacionais permanecem inalterados.
- O Stripe não é invocado em nenhuma condição nacional.
- Métricas e logs nacionais são mantidos separadamente.

## O que a api-checkout NÃO faz no MVP
- Não realiza polling de pagamentos.
- Não trata reconciliação financeira avançada.
- Não executa split, KYC ou Stripe Connect.
- Não reinterpreta estado sem webhook.
- Não altera regras do fluxo nacional.
- Não confirma pagamento (sem estados finais na FASE 1).
