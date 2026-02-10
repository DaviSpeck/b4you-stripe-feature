---
title: Visão geral
---

## Visão geral

A feature de E-commerce conecta lojas (principalmente Shopify) ao checkout B4You através de um script universal no frontend, um fluxo de resolução de oferta dinâmica no **api-checkout**, e configuração/gestão da loja no **sixbase-api** e **sixbase-dashboard**.

## Mapa rápido dos projetos

| Projeto | Papel na feature E-commerce | Principais pontos de integração |
| --- | --- | --- |
| **b4you-ecommerce** | Script universal que roda nas lojas (Shopify) | Intercepta checkout, coleta carrinho e chama `POST /api/checkout/ecommerce/resolve-offer` |
| **api-checkout** | Backend que resolve ofertas dinâmicas e responde com checkout URL | Cria/atualiza ofertas, copia order bumps, registra catálogo Shopify e compras |
| **sixbase-api** | API autenticada para criar loja e configurar produto container/oferta padrão | CRUD de lojas, order bumps e arquitetura de herança de configuração |
| **sixbase-dashboard** | UI para integração e configuração da loja | Modais e abas para pagamento, frete, bumps, checkout e demais settings |
