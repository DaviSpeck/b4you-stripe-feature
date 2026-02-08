# Cloudflare Turnstile no checkout

Este documento descreve como o Turnstile está implementado no checkout e por
que o fluxo é seguro e resiliente para múltiplos domínios e múltiplas site keys.

## Objetivos de segurança e confiabilidade

- **Usar exclusivamente a `site_key` vinda do backend** (por oferta).
- **Gerar e renovar tokens de forma confiável**, evitando estados inválidos.
- **Evitar reuso de token** quando o usuário troca de método de pagamento ou
  tenta novamente (ex: cartão falha → PIX).
- **Não travar o checkout em falhas temporárias**, permitindo retry.

## Visão geral da arquitetura

### 1) Estado global do captcha (Zustand)

O estado do Turnstile é centralizado em `useOfferPayment`:

- `turnstileToken`: token atual.
- `turnstileTokenExpiresAt`: TTL local do token.
- `needsCaptcha`: sinaliza quando o widget deve estar aberto.
- Helpers:
  - `isTurnstileTokenValid()` valida token + expiração.
  - `getValidTurnstileToken()` retorna token válido sem consumir.
  - `consumeTurnstileToken()` **consome** o token (uso único).

Isso garante que qualquer fluxo (1-step ou 3-steps) consulte a mesma fonte de
verdade, evitando race conditions e tokens “fantasmas”.

### 2) Componente Turnstile

O componente (`src/shared/turnstile.tsx`) é responsável por:

- Renderizar o widget **apenas quando `needsCaptcha` estiver true**.
- Usar a **`site_key` vinda do backend** via `offerData.site_key`.
- Invalidar token se a `site_key` mudar (ex: troca de domínio/oferta).
- Manter o captcha aberto em `onExpire`/`onError`, permitindo renovação rápida.

### 3) Integração com submit

Nos submits de pagamento:

- Primeiro verifica `isTurnstileTokenValid()`.
- Se inválido, aciona `startCaptcha()` e aguarda o `onSuccess`.
- O payload **consome** o token via `consumeTurnstileToken()` no momento de
  construir a requisição — isso evita reuso quando o usuário troca de método.

## Fluxo detalhado (passo a passo)

1. **Usuário tenta pagar** (cartão, boleto, PIX).
2. O handler verifica `isTurnstileTokenValid()`.
3. Se inválido, `startCaptcha()` abre o widget.
4. `onSuccess` recebe um token e salva no store com TTL.
5. O submit pendente é executado.
6. Ao montar o payload, `consumeTurnstileToken()` remove o token do estado.
7. Se o usuário mudar de método ou tentar novamente, o ciclo recomeça e um novo
   token será solicitado.

## Por que é seguro

- **Site key controlada pelo backend**: evita uso de chaves erradas por domínio.
- **TTL local + expiração explícita**: reduz riscos de token expirado.
- **Token de uso único**: elimina reuso em tentativas múltiplas.
- **Widget resiliente**: `onExpire`/`onError` não travam o checkout, apenas
  reabrem o desafio para nova tentativa.

## Pontos de atenção

- O backend continua sendo a autoridade final para validar o token.
- Em falhas temporárias do Turnstile, o usuário pode tentar novamente sem
  perder o estado do checkout.

