---
title: Tracking - Frontend (Implementação)
---

# Tracking - Frontend (Implementação)

**Público:** engenharia de frontend.

Este documento descreve **como** o tracking é implementado no frontend (legado e novo), sem redefinir semântica. A fonte de verdade semântica permanece no documento canônico.

---

## 1) Arquitetura do tracking no frontend

Camada dedicada em `src/tracking/`, responsável por:

- Normalizar eventos com campos obrigatórios.
- Gerar `eventId` e `sessionId` no cliente.
- Enfileirar eventos e enviar de forma assíncrona (fire-and-forget).
- Derivar `checkoutMode` a partir do domínio atual.
- Incluir `executionEnvironment`, `fullHostname` e `rootDomain`.

### Componentes principais

- **eventManager**: monta o payload e aplica regras de domínio.
- **eventQueue**: fila em memória com flush assíncrono.
- **eventSender**: envia via `sendBeacon` ou `fetch` com `keepalive`.
- **eventTypes**: catálogo de nomes, enums e descrições oficiais.
- **useCheckoutTracking**: hook central que dispara eventos padrão.

---

## 2) Garantias de performance

- **Não bloqueia UI**: fila em memória + envio assíncrono.
- **Fire-and-forget**: falhas são silenciosas.
- **Prioridade**: `navigator.sendBeacon` → `fetch` sem `await`.

Tracking nunca interfere em validações, submits ou navegação do checkout.

---

## 3) Regras de domínio (`checkoutMode`)

`checkoutMode` é derivado **exclusivamente** do hostname:

- `b4you.com.br` → `embedded`
- `b4you-sandbox.com.br` → `sandbox`
- `localhost` ou IP → `development`
- outros domínios → `transparent`

Essa regra **não pode** ser reimplementada no backend.

---

## 4) Regras de `executionEnvironment`

- `sandbox` quando o domínio contém `sandbox`.
- `development` quando o hostname é `localhost` ou IP.
- `production` como padrão.

---

## 5) Responsabilidades do frontend

- Definir o **significado do evento** (semântica).
- Emitir eventos apenas do catálogo oficial.
- Preencher `eventDescription` a partir do catálogo.
- Garantir consistência de `checkoutType` por sessão.
- Enviar `offerId` (backend resolve `productId`/`producerId`).

---

## 6) O que o frontend pode e não pode fazer

### Pode

- Emitir eventos quando fatos ocorrerem.
- Enviar campos opcionais quando disponíveis (`email`, `phone`, `paymentMethod`, `step`).
- Enviar eventos mesmo em falhas do checkout (tracking é independente).

### Não pode

- Emitir eventos fora do catálogo.
- Enviar `productId` ou `producerId`.
- “Corrigir” eventos já enviados.
- Bloquear fluxo do checkout por falha de tracking.

---

## 7) Referências

- **Documento canônico:** Tracking de Checkout (Fonte de Verdade).
- **Backend (Ingestão):** contrato imutável de payload e validação mínima.
