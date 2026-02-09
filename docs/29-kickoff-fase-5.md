# Kickoff operacional — FASE 5 (Convergência do checkout internacional)

## Premissas e regras inegociáveis
- Checkout internacional evolui como **variação** do checkout existente (padrão/3 etapas).
- Implementação acontece **apenas no novo checkout**; legado atua **apenas como redirect mínimo**.
- Nenhuma lógica de **saldo, saque ou reconciliação financeira**.
- Nenhuma lógica **Stripe** no frontend legado.
- **Sem polling** e **sem confirmação sem webhook**.
- Tudo deve ser **testável localmente** e via **E2E determinístico**.
- **Qualquer entrega sem atualização de documentação é incompleta**.

## 1) Plano de kickoff (ordem exata, dependências e checkpoints)

### Etapa 0 — Gate de entrada (bloqueante)
**Objetivo:** confirmar que a FASE 5 pode iniciar sem violar o gate técnico.

**Ordem exata**
1. Revisar o gate formal de entrada e confirmar aderência (testabilidade local, E2E determinístico, governança, sem regressão do nacional).
2. Revisar o encerramento da FASE 4 para garantir que todos os pré-requisitos estão atendidos.
3. Registrar um checkpoint de início (status: “Gate FASE 5 aprovado”).

**Dependências**
- Gate formal de entrada e encerramento FASE 4 já aprovados.

**Checkpoint**
- ✅ Gate técnico confirmado e documentado.

---

### Etapa 1 — Handoff mínimo no checkout legado (sixbase-checkout)
**Objetivo:** garantir redirect mínimo e seguro sem lógica Stripe no legado.

**Ordem exata**
1. Definir regra de detecção de produto internacional via flag + marcação explícita.
2. Implementar redirect mínimo para o novo checkout internacional mantendo parâmetros e tracking.
3. Definir comportamento de falha (erro controlado, sem fallback internacional → nacional).
4. Registrar checkpoint “Handoff legado funcional”.

**Dependências**
- Flag e marcação internacional expostas pelo backoffice.

**Checkpoint**
- ✅ Redirecionamento ativo apenas para produto internacional com flag enabled.
- ✅ Documentação atualizada (tasks/checklists + critérios de aceite + checkpoint).
- ✅ Testes determinísticos cobrindo handoff (unit + E2E).

---

### Etapa 2 — Convergência do novo checkout como variação do existente (b4you-checkout)
**Objetivo:** consolidar UX/processo internacional como variação sem alterar contratos.

**Ordem exata**
1. Consolidar base compartilhada de UI/i18n (EN/PT) com o legado.
2. Garantir estados exibidos apenas internos (`pending`, `approved`, `failed`, `refunded`, `dispute`).
3. Validar comportamento de retry idempotente sem nova transação.
4. Registrar checkpoint “Variação internacional convergida”.

**Dependências**
- Contrato do api-checkout já estável e aderente aos estados internos.

**Checkpoint**
- ✅ Fluxo internacional como variação explícita do checkout existente.

---

### Etapa 3 — Governança e fail-safe (backoffice + integração)
**Objetivo:** garantir governança centralizada e comportamento fail-safe.

**Ordem exata**
1. Validar backoffice como fonte de verdade da feature flag.
2. Confirmar fail-safe: inconsistência → bloquear internacional.
3. Registrar checkpoint “Governança validada”.

**Dependências**
- Endpoints de status de flag e marcação internacional disponíveis.

**Checkpoint**
- ✅ Governança centralizada com fail-safe comprovado.

---

### Etapa 4 — E2E determinístico e documentação final
**Objetivo:** garantir que toda entrega tem validação E2E e documentação atualizada.

**Ordem exata**
1. Atualizar checklists e critérios de aceite para refletir handoff + convergência.
2. Validar E2E determinístico (sem Stripe real) cobrindo variação internacional, pending/retry, thank-you e fail-safe.
3. Registrar checkpoint “FASE 5 pronta para encerramento”.

**Dependências**
- Etapas 1–3 concluídas.

**Checkpoint**
- ✅ Documentação e testes alinhados com entregas.

---

## 2) Documentos a criar, atualizar ou versionar durante a FASE 5

### Criar
- **Kickoff FASE 5** (este documento).
- **Encerramento parcial FASE 5** (registro incremental de entregas e validações).

### Atualizar
- **Gate FASE 5** (se houver ajuste formal de critérios ou checkpoints).
- **Checklists e tasks** (handoff, convergência, governança e testes E2E).
- **Critérios de aceite e validação** (reforçar fail-safe e não regressão do fluxo nacional).
- **Documentação de governança** (reforço de backoffice como fonte de verdade).

### Versionar
- **ADRs adicionais**, caso sejam necessárias decisões de convergência específicas (sem reabrir decisões já tomadas).

---

## 3) Entregas principais → documento, checklist e teste

### Entrega A — Handoff mínimo no legado
- **Documento a atualizar:** Tasks e checklists (FASE 5 / sixbase-checkout).
- **Checklist a marcar:** “Redirecionamento consistente para novo checkout” + “Fluxo nacional intacto”.
- **Teste que valida:** E2E determinístico “produto internacional com flag enabled → redirect + parâmetros preservados”.

### Entrega B — Convergência do checkout internacional como variação
- **Documento a atualizar:** Critérios de aceite e validação (checkout internacional).
- **Checklist a marcar:** “Checkout internacional em EN consumindo apenas estado interno” + “Retry idempotente sem criação de nova transação”.
- **Teste que valida:** E2E determinístico “pending → retry idempotente → approved via webhook simulado”.

### Entrega C — Governança e fail-safe
- **Documento a atualizar:** Governança e separação de responsabilidades.
- **Checklist a marcar:** “Feature flag com fail-safe (inconsistência → bloquear internacional)”.
- **Teste que valida:** E2E determinístico “flag inconsistente → bloqueio do internacional (sem fallback para nacional)”.

### Entrega D — Encerramento com documentação viva
- **Documento a atualizar:** Encerramento parcial FASE 5 + critérios de aceite consolidado.
- **Checklist a marcar:** “Documentação atualizada para cada entrega”.
- **Teste que valida:** Execução completa da suíte E2E determinística + regressão do fluxo nacional.

---

## 4) Critério objetivo de encerramento da FASE 5

### Gate técnico
- E2E determinístico cobre: variação internacional, pending/retry idempotente, thank-you, fail-safe.
- Testabilidade local completa sem Stripe real.
- Fluxo nacional sem regressão comprovada.

### Gate de negócio
- Governança centralizada via backoffice confirmada.
- Redirecionamento do legado aprovado sem impacto no fluxo nacional.
- Comunicação de status e comportamento ao suporte (IDs internos e estados internos).

### Gate de governança
- Feature flag como fonte de verdade no backoffice.
- Fail-safe aplicado em inconsistências (bloqueio do internacional).
- Documentação atualizada a cada entrega (condição obrigatória).
