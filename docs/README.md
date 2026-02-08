# Stripe no ecossistema B4You — Documentação de planejamento (MVP)

## Visão geral da iniciativa
A Stripe será introduzida como adquirente internacional no ecossistema B4You, mantendo Pagar.me para o Brasil. A integração será controlada por feature flag e gerida exclusivamente por webhooks, com rastreabilidade interna via `transaction_id`, `order_id` e `sale_id`.

## Objetivo do MVP
Entregar um fluxo internacional mínimo viável com Stripe que suporte:
- Pagamento com cartão internacional
- Reembolso
- Chargeback (disputes)
- Persistência de `provider_*` IDs
- Observabilidade e rastreabilidade ponta a ponta

## Escopo
### Dentro do escopo
- Produtos/ofertas marcados explicitamente como internacionais
- Checkout internacional já nasce em EN e com gateway Stripe
- Webhooks como fonte da verdade (sem polling)
- Feature flag com liberação via backoffice
- Compatibilidade com o ecossistema atual

### Fora do escopo
- KYC, Stripe Connect, split de pagamentos
- Multiadquirência avançada
- Detecção automática de país (IP, VPN, heurísticas)

## Premissas e decisões técnicas
- Stripe apenas para pagamentos internacionais.
- Conta bolsão sem repasse automático via Stripe.
- Rastreamento interno baseado em IDs do domínio atual.
- Webhooks são a fonte de verdade para o estado do pagamento.

## Como navegar pelos documentos
- **00-visao-geral-e-estrategia.md**: visão macro, estratégia e decisões arquiteturais.
- **01-plano-por-repositorio.md**: impacto por repositório e mudanças esperadas.
- **02-tasks-e-checklists.md**: lista de tasks, checklist MVP e dependências.
- **03-criterios-de-aceite-e-validacao.md**: critérios de aceite e go/no-go.
- **04-riscos-e-pontos-de-atencao.md**: riscos e decisões futuras.

> Nota de governança: o **dashboard** é o canal de gestão da feature após liberação (uso por produtores), enquanto o **backoffice** permanece como canal interno da B4You para configurar produtos/ofertas internacionais e habilitar a integração do checkout.
