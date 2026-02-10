---
title: sixbase-dashboard (frontend)
---

A UI do dashboard concentra toda a configuração da loja e da oferta padrão através de modais e abas. A documentação interna detalha todos os componentes de Ecommerce.

## Componentes e responsabilidades

- **`list.js`**: lista lojas, cria nova loja, copia script de integração e abre configuração completa.
- **`modal-shop.js`**: cria/edita loja (nome, domínio, token) e dispara criação do produto container + oferta padrão.
- **`modal-shop-config.js`**: modal principal com abas para bumps, upsell, pagamento, frete, geral, vitrine, parcerias, rastreio, cupons e checkout.
- **`modal-payment.js`**: configura métodos de pagamento, parcelas e descontos na oferta padrão.
- **`modal-shipping.js`**: configura tipo de frete, preços e prazos.
- **`modal-bumps.js`**: CRUD de order bumps e upload de capa.

## Fluxo de configuração no dashboard

1. Usuário cria loja no modal (`modal-shop.js`).
2. Após criar, abre “Configurar Loja”.
3. Ajusta **Pagamento** e **Frete** (oferta padrão).
4. Configura **Order Bumps** e **Checkout**.
5. Copia o script de integração para o Shopify.

## Integração com API

O frontend chama endpoints do `sixbase-api` (via `/integrations/ecommerce/...`) para listar lojas, criar, atualizar e remover integrações, além de gerenciar bumps e buscar detalhes completos da loja para renderizar o modal de configuração.

## Evolução esperada

- **Simplificar onboarding**: wizard para criar loja e configurar pagamento/frete em sequência.
- **Feedback de healthcheck**: mostrar status do script e última resolução de oferta.
- **Catálogo e relatórios**: telas para estatísticas do catálogo, itens mais vendidos e taxa de conversão.

## Fragilidades e pontos de atenção

- **Dependência de payload completo da loja**: se o endpoint `/shops/:uuid` retorna dados incompletos, os modais quebram.
- **Uma loja por usuário**: limita o UX (botão “Nova Loja” oculto), precisa refator em cenário multilojas.
