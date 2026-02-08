# Checkout transparente em múltiplos domínios

Este documento explica como o projeto viabiliza o checkout transparente com a
mesma aplicação rodando em domínios diferentes (ex.: `seguro.*`, `pay.*`),
mantendo o fluxo consistente e seguro.

## Conceito

Checkout transparente significa:

- A mesma base de código serve **múltiplos domínios**.
- A lógica de oferta, antifraude e pagamento é **determinada pelo backend**.
- O frontend apenas **consome a configuração** correta para o domínio ativo.

## Como o projeto viabiliza isso

### 1) Oferta e configuração vêm do backend

A oferta retornada pelo backend carrega as informações que variam por domínio,
como `site_key` do Turnstile e parâmetros de pagamento. Isso permite que:

- Cada domínio use sua própria `site_key`.
- O frontend nunca precise embutir chaves em `env`.
- O checkout seja consistente mesmo com múltiplos domínios.

### 2) Frontend usa exclusivamente a `site_key` da oferta

O componente de Turnstile lê `offerData.site_key`. Assim, o domínio ativo
determina automaticamente qual chave será usada sem alterar o frontend.

### 2.1) CORS e domínios permitidos

O CORS é configurado para aceitar domínios permitidos definidos por `ENV`:

- `NEXT_PUBLIC_CORS_ALLOWED_ORIGINS`: lista de domínios separados por vírgula.
- `NEXT_PUBLIC_REACT_APP_BASE_URL_INTERNAL`: base interna usada como fallback.

Os domínios são normalizados (sem `http/https`) e comparados com o host atual.
Assim, a aplicação aceita:

- O domínio ativo (via `x-forwarded-host` / host atual), e
- Os domínios explícitos da lista de `ENV`.

### 2.2) Base interna validada pelo host atual

Mesmo com `NEXT_PUBLIC_REACT_APP_BASE_URL_INTERNAL` configurado, a aplicação
não consome essa base diretamente quando está em SSR. O valor final é resolvido
com base no host atual (headers como `x-forwarded-host` e `x-forwarded-proto`),
evitando “cross-host” acidental e garantindo que a API interna responda de
acordo com o domínio efetivo da requisição.

### 3) Token de captcha com ciclo de vida controlado

O token do Turnstile é:

- Gerado no frontend somente quando necessário.
- Validado e consumido no momento do submit.
- Renovado em novas tentativas ou troca de método.

Isso é essencial para que o mesmo fluxo funcione em domínios diferentes sem
reaproveitar tokens indevidos.

### 4) Submissões sempre enviam o token correto ao backend

Antes de cada submit, o frontend garante:

- Token válido disponível.
- Token consumido no payload (uso único).

Dessa forma, o backend valida o token do domínio correto e aplica a antifraude
adequada para aquele checkout.

## Benefícios

- **Multi-tenant por domínio** sem duplicar o código.
- **Segurança consistente** com Turnstile por domínio.
- **Flexibilidade** para campanhas/branding sem alterar lógica.
- **UX previsível** mesmo com troca de método ou retry.

## Boas práticas

- Nunca expor `site_key` via `env` no frontend.
- Sempre confiar na oferta do backend como fonte de verdade.
- Manter a troca de domínio transparente ao usuário, sem alterar o fluxo.
- Manter a lista de CORS (`NEXT_PUBLIC_CORS_ALLOWED_ORIGINS`) atualizada com os
  domínios de campanha e seus subdomínios relevantes.
