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
- **19-visao-fase-3.md**: visão e escopo da FASE 3 (refund/dispute).
- **20-contrato-eventos-refund-dispute.md**: contrato de eventos refund/dispute.
- **21-mapeamento-estados-refund-dispute.md**: tabela de mapeamento de estados internos.
- **22-checklist-fase-3.md**: checklist e gates da FASE 3.
- **23-testes-contrato-fase-3.md**: definição de testes de contrato da FASE 3.
- **24-encerramento-fase-3.md**: encerramento formal da FASE 3.
- **25-documentacao-complementar-fase-4.md**: documentação complementar obrigatória da FASE 4.
- **26-checklist-pre-fase-4.md**: checklist de validação pré-FASE 4.
- **27-gate-fase-5.md**: gate formal de entrada da FASE 5.
- **28-encerramento-fase-4.md**: encerramento formal da FASE 4.
- **ADR-001-checkout-internacional-como-variacao.md**: decisão arquitetural do checkout internacional como variação.
- **31-encerramento-etapa-2-fase-5.md**: encerramento formal da FASE 5 · Etapa 2 (pós-venda / thank-you).
- **32-etapa-3-preparatorio-sem-execucao.md**: estrutura preparatória da FASE 5 · Etapa 3 (sem execução).
- **33-execucao-etapa-3-governanca-fail-safe.md**: execução da FASE 5 · Etapa 3 (governança + fail-safe).

> Nota de governança: o **dashboard** é o canal de gestão da feature após liberação (uso por produtores), enquanto o **backoffice** permanece como canal interno da B4You para configurar produtos/ofertas internacionais e habilitar a integração do checkout.
