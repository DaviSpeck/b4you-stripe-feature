# Gate formal de entrada — FASE 5 (Convergência do checkout internacional)

## Objetivo
Definir critérios objetivos e bloqueios para iniciar a FASE 5, garantindo convergência progressiva do checkout internacional como **variação** do checkout existente, sem comprometer testabilidade, governança e o fluxo nacional.

---

## O que a FASE 5 pode fazer
- Convergir o checkout internacional como **variação explícita** do checkout existente (padrão/3 etapas).
- Unificar modelo mental de pós-venda (delivery/thank-you) com base no estado interno.
- Consolidar governança e observabilidade sem alterar contratos existentes.
- Ajustar UX/idioma internacional mantendo semântica de estados e idempotência.
- Implementar **redirect mínimo** no checkout legado (sem lógica Stripe no legado).

## O que é explicitamente proibido
- Qualquer lógica de **saldo**, **saque** ou reconciliação financeira.
- Qualquer dependência direta de **Stripe** no frontend.
- Alterar semântica de estados internos ou contratos existentes.
- Introduzir polling ou confirmação de pagamento sem webhook.
- Impactar o fluxo nacional.

---

## Critérios técnicos obrigatórios (gate)
1. **Testabilidade local integral**
   - Todas as mudanças devem ser testáveis **sem Stripe real** e **sem webhooks reais**.
   - Nenhuma dependência externa obrigatória para validar comportamento crítico.

2. **Cobertura E2E determinística**
   - Testes E2E cobrindo:
     - variação internacional do checkout;
     - comportamento de `pending` / retry idempotente;
     - convergência de thank-you/delivery;
     - fail-safe da feature flag.

3. **Sem regressão do fluxo nacional**
   - Garantia explícita (testes e validações) de que o fluxo nacional permanece intacto.

4. **Governança centralizada**
   - Feature flag com backoffice como fonte de verdade e comportamento fail-safe mantido.

---

## Relação com o checkout legado
- O checkout legado **não** implementa lógica Stripe.
- O papel do legado na FASE 5 é **redirect mínimo** para o checkout internacional, respeitando feature flag e governança.

---

## Critério de bloqueio
Se qualquer item acima **não for testável localmente**, **a FASE 5 não pode iniciar**.

