# Visão geral e estratégia

## Contexto do ecossistema
O ecossistema B4You possui múltiplos serviços e frontends, com responsabilidades bem definidas para checkout, backoffice e orquestração. A introdução da Stripe visa habilitar pagamentos internacionais, mantendo o fluxo nacional via Pagar.me, sem quebrar compatibilidade com o stack atual.

## Estratégia de entrada da Stripe
1. **Separação explícita de produtos/ofertas internacionais**: o status “internacional” é definido no cadastro, sem heurísticas.
2. **Checkout internacional dedicado**: páginas e fluxo em EN, gateway Stripe escolhido desde o início.
3. **Backoffice como controle interno**: a B4You gerencia a liberação e configuração da integração para produtos/ofertas internacionais.
4. **Dashboard como gestão pós-liberação**: após liberada, a feature é operada pelo produtor diretamente no dashboard.
5. **Webhooks como fonte da verdade**: estado do pagamento é atualizado apenas por eventos da Stripe.
6. **Rastreabilidade interna**: todos os eventos conectam `transaction_id`, `order_id` e `sale_id`.

## Decisões arquiteturais centrais
- **Integração baseada em webhooks**: elimina polling e garante convergência do estado por eventos assinados.
- **Conta bolsão**: consolida recebíveis internacionais em uma conta única, sem split.
- **Persistência de IDs do provedor**: `provider_*` IDs serão obrigatórios para reconciliação.
- **Feature flag obrigatória**: nenhuma funcionalidade Stripe aparece sem liberação explícita.
- **Manutenção do Pagar.me**: fluxo nacional permanece intacto e isolado da nova entrada.
- **Separação de governança**: backoffice controla habilitação e cadastro; dashboard controla uso operacional pelos produtores.

## Justificativas técnicas
- **Redução de risco operacional**: feature flag e separação explícita reduzem impacto no fluxo nacional.
- **Confiabilidade**: webhooks evitam inconsistências de estado e permitem auditoria.
- **Escalabilidade futura**: a rastreabilidade interna facilita evolução para funcionalidades adicionais no pós-MVP.
