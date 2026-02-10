---
title: Stripe Internacional na B4You — FASE 6 (Backoffice: Governança de Elegibilidade e Regras)
---

# Stripe Internacional na B4You — FASE 6 (Backoffice)

## Objetivo
Registrar a implementação técnica real da FASE 6: Backoffice como camada de governança institucional para elegibilidade internacional de produtor e regras condicionais da Stripe.

## Status
FASE 6 concluída no escopo aprovado de governança/elegibilidade.

---

## 1) O que o Backoffice controla nesta fase
O Backoffice passou a controlar, de forma persistida e auditável:
1. status do produtor para operação internacional (`enabled` ou `blocked`);
2. ativação/desativação da Stripe internacional por produtor;
3. regras condicionais associadas ao produtor para uso da Stripe;
4. histórico de transição com motivo, ator e estados anterior/novo.

### Regra-chave
Sem habilitação explícita no Backoffice, o produtor não pode operar internacional.

---

## 2) O que a Dashboard ainda não pode fazer sozinha
A Dashboard **não decide governança**. Ela apenas consome resultado governado no Backoffice.

Nesta fase:
- a Dashboard continua sendo a camada que cria produto;
- porém o backend bloqueia criação de produto internacional quando o produtor não está habilitado no Backoffice.

---

## 3) Validações obrigatórias implementadas
1. **Elegibilidade explícita por produtor**
   - Sem status `enabled`, internacional permanece bloqueado.

2. **Stripe internacional condicionada por governança**
   - `international_stripe_enabled` controla uso da Stripe internacional.

3. **Bloqueio backend de bypass**
   - Não basta UI: criação internacional sem habilitação falha no backend da Dashboard.

4. **Trilha auditável completa**
   - quem alterou;
   - quando alterou;
   - motivo;
   - regra aplicada;
   - estado anterior e novo estado.

---

## 4) Separação de dados nacional vs internacional
Foram introduzidos campos de produto para separar escopos sem alterar checkout:
- escopo (`national`/`international`);
- moeda;
- adquirente;
- contexto de conversão.

Isso preserva o princípio: checkout consome decisão; não cria governança.

---

## 5) Limites explícitos preservados
Esta fase **não** executa:
- criação de produto no Backoffice;
- alteração de checkout;
- alteração de estados internos;
- FASE 7 (Dashboard);
- FASE 8 (Rollout/Comunicação).

---

## 6) Dependências para FASE 7 (futura)
A próxima fase deverá implementar na Dashboard:
1. visibilidade de status internacional por produtor;
2. UX de bloqueio/mensagem aderente à governança do Backoffice;
3. operação orientada por regras condicionais já persistidas.

Regra final: execução sem decisão formal continua proibida.

## Declaração de limite de negócio
- A FASE 6 não representa liberação internacional geral para todos os produtores.
- A liberação continua por produtor, condicionada à governança formal do Backoffice.
