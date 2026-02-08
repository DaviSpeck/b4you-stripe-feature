# Detalhamento — b4you-lambdas (webhooks Stripe)

## Escopo deste complemento
Definir o fluxo completo de processamento de webhooks Stripe e sua normalização para o estado interno, com idempotência e reprocessamento controlados.

## Fluxo completo de processamento
1. Receber evento Stripe no endpoint de webhook.
2. Validar assinatura e integridade do payload.
3. Identificar `provider = stripe` e correlacionar `transaction_id`, `order_id`, `sale_id`.
4. Aplicar idempotência para evitar duplicidade.
5. Normalizar evento para o modelo interno.
6. Atualizar estado interno e emitir eventos internos necessários.
7. Registrar auditoria e métricas.

## Ordem esperada dos eventos
- **payment_intent.succeeded** (pagamento aprovado)
- **charge.refunded** (reembolso)
- **charge.dispute.created/closed** (disputas)

## Tratamento de eventos fora de ordem
- Se eventos chegarem fora de ordem, a lambda deve aplicar regras de reconciliação para garantir consistência do estado final.
- Eventos “atrasados” não devem sobrescrever estado já finalizado.

## Estratégia de idempotência
- Chave de idempotência baseada em `event_id` do Stripe.
- Janela de retenção suficiente para reprocessamentos e retries.

## Normalização para modelo interno
- Mapear eventos Stripe para estados internos padrão (approved, pending, refunded, dispute).
- Persistir `provider_*` IDs e metadata associada.

## Eventos que geram efeitos colaterais
- **Pagamento aprovado** → atualização de status interno.
- **Reembolso** → atualização de status e histórico.
- **Disputa** → atualização de status e notificação interna.

## Eventos ignorados
- Eventos não relacionados a pagamento (ex.: catálogo, customer updates) são ignorados.
- Eventos duplicados (idempotência) não geram efeitos.

## Política de reprocessamento e rastreabilidade
- Eventos falhos devem ser reprocessáveis com auditoria do motivo.
- Logs e métricas garantem rastreabilidade completa.

## O que as lambdas NÃO fazem no MVP
- Não realizam polling.
- Não executam conciliação financeira avançada.
- Não alteram fluxo nacional.
- Não tratam KYC/Connect.
