# FINAL_FA6_CHECKLIST.md

## Comandos para rodar tudo

```bash
# Backoffice API (governança internacional)
cd backoffice-repositories/sixbase-api-backoffice
npm run test:integration

# Dashboard API (gate internacional + não-regressão nacional)
cd /workspace/b4you-stripe-feature/dashboard-repositories/sixbase-api
npm run test:integration

# Front mínimo Backoffice
cd /workspace/b4you-stripe-feature/backoffice-repositories/sixbase-backoffice
npm run test:front

# Front mínimo Dashboard
cd /workspace/b4you-stripe-feature/dashboard-repositories/sixbase-dashboard
npm run test:front

# Execução consolidada FASE 6 (raiz)
cd /workspace/b4you-stripe-feature
npm run test:fa6
```

## Critérios objetivos de aceite

- [ ] Backoffice: `GET /users/:userUuid/international-governance` retorna 200.
- [ ] Backoffice: `PATCH /users/:userUuid/international-governance` válido retorna 200.
- [ ] Backoffice: `PATCH` inválido retorna 400 por validação.
- [ ] Backoffice: usuário inexistente retorna erro de negócio esperado.
- [ ] Dashboard: criação internacional com produtor bloqueado retorna 403.
- [ ] Dashboard: criação internacional com produtor habilitado retorna 200.
- [ ] Dashboard: criação nacional retorna 200 independente da governança internacional.
- [ ] Não-regressão: defaults `operation_scope=national`, `currency_code=BRL`, `acquirer_key=pagarme` preservados.
- [ ] Front Backoffice: leitura e edição funcional dos campos (`status`, `international_stripe_enabled`, `rules`, `reason`).
- [ ] Front Dashboard: seleção de `operation_scope` e mensagem fixa no 403 internacional.
- [ ] Scripts de execução unificada da FASE 6 funcionais na raiz.

## Confirmação de encerramento técnico da FASE 6

A FASE 6 estará tecnicamente encerrada quando todos os critérios acima estiverem marcados e os comandos de validação executarem sem falhas.

Escopo respeitado:
- sem FASE 7;
- sem alterações no checkout;
- sem novas regras de negócio;
- sem alterações fora da governança internacional já implementada.
