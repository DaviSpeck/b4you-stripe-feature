# Documentação de Status e Tipos - Sixbase API

Este documento contém a referência completa de todos os **Status** e **Tipos** utilizados no sistema Sixbase API. Esta documentação foi criada para auxiliar o suporte técnico na identificação e compreensão dos valores retornados pela API.

---

## 📋 Índice

- [Status](#status)
  - [Status de Vendas](#status-de-vendas)
  - [Status de Transações](#status-de-transações)
  - [Status de Cobranças](#status-de-cobranças)
  - [Status de Assinaturas](#status-de-assinaturas)
  - [Status de Reembolsos](#status-de-reembolsos)
  - [Status de Afiliados](#status-de-afiliados)
  - [Status de Comissões](#status-de-comissões)
  - [Status de Fornecedores](#status-de-fornecedores)
  - [Status de Gerentes](#status-de-gerentes)
  - [Status de Referências](#status-de-referências)
  - [Status de Coproduções](#status-de-coproduções)
  - [Status de Produtos no Marketplace](#status-de-produtos-no-marketplace)
  - [Status de Documentos](#status-de-documentos)
  - [Status de Colaborações](#status-de-colaborações)
  - [Status de Perguntas](#status-de-perguntas)
  - [Status de Vídeos](#status-de-vídeos)
  - [Status de Verificação de Cartão](#status-de-verificação-de-cartão)
  - [Status KYC Pagarme](#status-kyc-pagarme)
  - [Status de Callback](#status-de-callback)
- [Tipos](#tipos)
  - [Tipos de Transação](#tipos-de-transação)
  - [Métodos de Pagamento](#métodos-de-pagamento)
  - [Tipos de Integração](#tipos-de-integração)
  - [Tipos de Webhook](#tipos-de-webhook)
  - [Tipos de Callback](#tipos-de-callback)
  - [Tipos de Frequência](#tipos-de-frequência)
  - [Tipos de Frete](#tipos-de-frete)
  - [Tipos de Nota Fiscal](#tipos-de-nota-fiscal)
  - [Tipos de Saque](#tipos-de-saque)
  - [Categorias de Produtos](#categorias-de-produtos)
  - [Tipos de Notificação por Email](#tipos-de-notificação-por-email)
  - [Papéis de Usuário](#papéis-de-usuário)
  - [Tipos de Produto](#tipos-de-produto)
  - [Tipos de Item de Venda](#tipos-de-item-de-venda)
  - [Tipos de Checkout](#tipos-de-checkout)
  - [Tipos Bling](#tipos-bling)
  - [Tipos eNotas](#tipos-enotas)
  - [Tipos de Notificação](#tipos-de-notificação)
  - [Tipos de Atividade do Usuário](#tipos-de-atividade-do-usuário)
  - [Tipos de Histórico do Usuário](#tipos-de-histórico-do-usuário)
  - [Métodos de Callback](#métodos-de-callback)
  - [Tipos de Imagem](#tipos-de-imagem)
  - [Tipos de Embed](#tipos-de-embed)
  - [Tipos de Bloqueio](#tipos-de-bloqueio)
  - [Tipos de Página de Produto](#tipos-de-página-de-produto)
  - [Tipos de Pixel](#tipos-de-pixel)
  - [Tipos de Plugin de Membership](#tipos-de-plugin-de-membership)
  - [Tipos de Banner](#tipos-de-banner)
  - [Tipos de Permissão](#tipos-de-permissão)
  - [Tipos de Comissão de Gerente](#tipos-de-comissão-de-gerente)
  - [Regras de Comissão de Afiliados](#regras-de-comissão-de-afiliados)
  - [Tipos de Regras de Integração](#tipos-de-regras-de-integração)

---

## Status

### Status de Vendas

| ID | Nome | Key | Cor |
|---|---|---|---|
| 1 | Aguardando Pagamento | `pending` | light |
| 2 | Pago | `paid` | success |
| 3 | Negado | `denied` | warning |
| 4 | Reembolsado | `refunded` | warning |
| 5 | Chargeback | `chargeback` | danger |
| 6 | Reembolso solicitado | `request-refund` | warning |
| 7 | Expirado | `expired` | warning |
| 8 | Chargeback em disputa | `chargeback_dispute` | warning |

### Status de Transações

| ID | Nome | Key | Cor |
|---|---|---|---|
| 1 | Pendente | `pending` | light |
| 2 | Processado | `paid` | success |
| 3 | Processando Requisição | `processing` | - |
| 4 | Negado | `denied` | danger |
| 5 | Cancelado | `canceled` | - |
| 6 | Aguardando | `waiting` | - |
| 7 | Expirado | `expired` | - |
| 8 | Reembolsado | `refunded` | danger |
| 9 | Chargeback | `chargeback` | - |
| 10 | Chargeback em disputa | `chargeback_dispute` | - |

### Status de Cobranças

| ID | Nome | Key | Cor |
|---|---|---|---|
| 1 | Pendente | `pending` | light |
| 2 | Pago | `paid` | success |
| 3 | Cancelado | `canceled` | danger |
| 4 | Recusado | `refused` | danger |
| 5 | Reembolsado | `refunded` | danger |
| 6 | Expirado | `expired` | danger |
| 7 | Chargeback | `chargeback` | danger |
| 8 | Chargeback em disputa | `chargeback_dispute` | danger |

### Status de Assinaturas

| ID | Nome | Key | Cor |
|---|---|---|---|
| 1 | Ativo | `active` | success |
| 2 | Pendente | `pending` | light |
| 3 | Problemas no Pagamento | `warning` | warning |
| 4 | Cancelado | `canceled` | danger |
| 5 | Reembolsado | `refunded` | warning |
| 6 | Chargeback | `chargeback` | warning |
| 7 | Chargeback em disputa | `chargeback_dispute` | warning |

### Status de Reembolsos

| ID | Nome | Key | Cor |
|---|---|---|---|
| 1 | Solicitado pelo comprador | `requested-by-student` | light |
| 2 | Solicitado pelo produtor | `requested-by-producer` | success |
| 3 | Aceito | `paid` | warning |
| 4 | Negado | `denied` | warning |
| 5 | Aguardando conta bancária do estudante | `missing-bank-account` | - |
| 6 | Solicitado reembolso em garantia | `refund-warranty` | - |
| 7 | Comprador desistiu do reembolso em garantia | `refund-warranty-canceled` | - |

### Status de Afiliados

| ID | Nome | Label | Key | Cor |
|---|---|---|---|---|
| 1 | Pendente | Pendente | `pending` | light |
| 2 | Ativo | Afiliado | `active` | success |
| 3 | Bloqueado | Bloqueado | `blocked` | danger |
| 4 | Recusado | Recusado | `refused` | danger |
| 5 | Cancelado | Cancelado | `canceled` | danger |

### Status de Comissões

| ID | Label | Key |
|---|---|---|
| 1 | Criada | `created` |
| 2 | Aguardando pagamento | `waiting` |
| 3 | Paga | `released` |
| 4 | Reembolsada | `refunded` |
| 5 | Chargeback | `chargeback` |
| 6 | Chargeback em disputa | `chargeback_dispute` |

### Status de Fornecedores

| ID | Label | Key |
|---|---|---|
| 1 | Pendente | `pending` |
| 2 | Aceito | `approved` |
| 3 | Rejeitado | `rejected` |

### Status de Gerentes

| ID | Label | Key |
|---|---|---|
| 1 | Pendente | `pending` |
| 2 | Aceito | `approved` |
| 3 | Rejeitado | `rejected` |
| 4 | Cancelado | `canceled` |

### Status de Referências

| ID | Label | Key |
|---|---|---|
| 1 | Ativo | `active` |
| 2 | Bloqueado | `blocked` |
| 3 | Cancelado | `canceled` |

### Status de Comissões de Referência

| ID | Label | Key |
|---|---|---|
| 1 | Pendente | `pending` |
| 2 | Pendente de liberação | `release-pending` |
| 3 | Pago | `released` |
| 4 | Reembolsado | `refund` |
| 5 | Chargeback | `chargeback` |
| 5 | Negado | `denied` |
| 6 | Expirado | `expired` |
| 7 | Chargeback em disputa | `chargeback_dispute` |

### Status de Coproduções

| ID | Nome | Key | Cor |
|---|---|---|---|
| 1 | Pendente | `pending` | light |
| 2 | Ativo | `active` | success |
| 3 | Rejeitado | `reject` | danger |
| 4 | Expirado | `expired` | warning |
| 5 | Rescindido | `terminated` | danger |
| 6 | Cancelado | `canceled` | warning |

### Status de Produtos no Marketplace

| ID | Label | Key | Cor |
|---|---|---|---|
| 1 | Desativado | `hide` | success |
| 2 | Pendente | `pending` | light |
| 3 | Ativo | `active` | success |
| 4 | Recusado | `refused` | danger |

### Status de Verificação de Produtos no Marketplace

| ID | Label | Key | Cor |
|---|---|---|---|
| 1 | Pendente | `pending` | light |
| 2 | Aceito | `accepted` | success |
| 3 | Recusado | `refused` | error |

### Status de Documentos

| ID | Label | Key | Cor |
|---|---|---|---|
| 1 | Aguardando Envio | `waiting` | warning |
| 2 | Em análise | `analysis` | info |
| 3 | Verificados | `success` | success |
| 4 | Recusado | `rejected` | danger |

### Status de Colaborações

| ID | Nome | Key | Cor |
|---|---|---|---|
| 1 | Pendente | `pending` | light |
| 2 | Ativo | `active` | success |
| 3 | Rejeitado | `rejected` | danger |

### Status de Perguntas

| ID | Label | Cor |
|---|---|---|
| 1 | Aguardando | - |
| 2 | Respondido | warning light |

### Status de Vídeos

| ID | Nome |
|---|---|
| 0 | waiting upload |
| 1 | uploading |
| 2 | available |
| 3 | quota_exceeded |
| 4 | total_cap_exceeded |
| 5 | transcode_starting |
| 6 | transcoding |
| 7 | transcoding_error |
| 8 | unavailable |
| 9 | uploading_error |

### Status de Verificação de Cartão

| ID | Label | Key |
|---|---|---|
| 1 | Cobrança falhou | `failed` |
| 2 | Transação aprovada | `approved` |
| 3 | Reembolso Solicitado | `refund-requested` |
| 4 | Reembolsado | `refunded` |
| 5 | Falha ao reembolsar | `refunded-failed` |

### Status KYC Pagarme

| ID | Label | Key |
|---|---|---|
| 0 | Pendente | `pending` |
| 1 | Processo iniciado | `analysis` |
| 2 | Parcialmente negado | `partially-denied` |
| 3 | Aprovado | `approved` |
| 4 | Negado | `denied` |

### Status de Callback

| ID | Label |
|---|---|
| 1 | Pago |
| 2 | Rejeitado |
| 3 | Expirado |
| 4 | Reembolsado |

---

## Tipos

### Tipos de Transação

| ID | Nome | Flow | Key |
|---|---|---|---|
| 1 | Saque | outcome | `withdrawal` |
| 2 | Pagamento | income | `payment` |
| 3 | Comissão | income | `commission` |
| 4 | Multa | outcome | `fee` |
| 5 | Chargeback | outcome | `chargeback` |
| 6 | Reembolso | outcome | `refund` |
| 7 | Custo | outcome | `cost` |
| 8 | Custo Reembolso | outcome | `cost_refund` |
| 9 | Custo Afiliado | outcome | `cost_affiliate` |

**Legenda:**
- **Flow**: `income` = entrada de dinheiro, `outcome` = saída de dinheiro

### Métodos de Pagamento

| ID | Key | Label |
|---|---|---|
| 1 | `billet` | Boleto |
| 2 | `card` | Cartão de Crédito |
| 3 | `pix` | Pix |

### Tipos de Integração

| ID | Nome | Key | Website |
|---|---|---|---|
| 1 | Active Campaign | `activecampaign` | https://www.activecampaign.com/br/ |
| 2 | LeadLovers | - | https://www.leadlovers.com/ |
| 3 | eNotas | `enotas` | https://enotas.com.br/ |
| 4 | MailChimp | `mailchimp` | https://mailchimp.com/pt-br/ |
| 5 | HotzApp | `hotzapp` | https://hotzapp.me/ |
| 6 | Webhooks | `webhooks` | https://hotzapp.me/ |
| 7 | Voxuy | `voxuy` | https://www.voxuy.com/ |
| 8 | SellFlux | `sellflux` | https://sellflux.app |
| 9 | Cademí | `cademi` | https://cademi.com.br |
| 10 | Bling | `bling` | https://www.bling.com.br |
| 11 | Bling Transporte | `blingshipping` | https://www.bling.com.br |
| 12 | HSDS | `hsds` | https://hsds.io/ |
| 13 | Invision | `invision` | https://invisioncommunity.com |
| 14 | Memberkit | `memberkit` | https://memberkit.com.br |
| 15 | Notazz | `notazz` | https://notazz.com/ |
| 16 | Bling Transporte V3 | `blingshippingv3` | https://www.bling.com.br |
| 17 | Astron Members | `astronmembers` | https://www.astronmembers.com.br |
| 18 | UTMify | `utmify` | https://utmify.com.br |
| 19 | Shopify | `shopify` | https://www.shopify.com/br |
| 20 | Arco | `arco` | https://hmg-pedidos.capsulbrasil.com.br |
| 21 | Frenet | `frenet` | Frenet |
| 22 | Tiny | `tiny` | https://tiny.com.br |
| 23 | Zoppy | `zoppy` | Zoppy |
| 24 | Omie | `omie` | https://www.omie.com.br |
| 25 | Tiktok | `tiktok` | https://tiktok.com |
| 26 | WooCommerce | `woocommerce` | https://woocommerce.com/pt-br/ |

### Tipos de Webhook

| ID | Label | Key |
|---|---|---|
| 1 | Webhooks | `webhook` |
| 2 | Zarpon | `zarpon` |
| 3 | Arco | `arco` |
| 4 | Spedy | `spedy` |

### Tipos de Callback

| ID | Nome | Label |
|---|---|---|
| 1 | `withdrawal` | Saque |
| 2 | `transaction` | Pagamento |

### Tipos de Frequência

| Key | Label | Tradução |
|---|---|---|
| `month` | Mensal | mês |
| `two-months` | Bimestral | bimestre |
| `quarter` | Trimestral | trimestre |
| `semester` | Semestral | semestre |
| `year` | Anual | ano |

### Tipos de Frete

| ID | Key | Label |
|---|---|---|
| 0 | `free` | Grátis |
| 1 | `with-affiliate` | Frete com divisão afiliado |
| 2 | `without-affiliate` | Frete sem divisão afiliado |
| 3 | `no-division` | Frete sem divisão |

### Tipos de Nota Fiscal

| ID | Label | Type | Key |
|---|---|---|---|
| 1 | Nota Fiscal | invoice | `invoice` |
| 2 | Recibo | receipt | `receipt` |

### Tipos de Saque

| ID | Nome | Label |
|---|---|---|
| 1 | PIX | Pix |

### Categorias de Produtos

| ID | Label |
|---|---|
| 1 | Ambiente |
| 2 | Animais e Plantas |
| 3 | Desenvolvimento Pessoal |
| 4 | Design |
| 5 | Direito |
| 6 | Educação |
| 7 | Empreendedorismo Digital |
| 8 | Entretenimento |
| 9 | Espiritualidade |
| 10 | Finanças |
| 11 | Gastronomia |
| 12 | Geral |
| 13 | Hobbies |
| 14 | Idiomas |
| 15 | Internet |
| 16 | Literatura |
| 17 | Moda e Beleza |
| 18 | Música e Arte |
| 19 | Negócios e Carreira |
| 20 | Prédios e Construções |
| 21 | Relacionamentos |
| 22 | Saúde e Esportes |
| 23 | Sexualidade |
| 24 | Software |
| 25 | Tecnologia da Informação |
| 2000 | Outros |

### Tipos de Notificação por Email

| ID | Nome |
|---|---|
| 1 | Plano Cancelado |
| 2 | Estorno de Produto |

### Papéis de Usuário

| ID | Label | Key |
|---|---|---|
| 1 | Produtor | `producer` |
| 2 | Coprodutor | `coproducer` |
| 3 | Afiliado | `affiliate` |
| 4 | Fornecedor | `supplier` |
| 5 | Gerente | `manager` |

### Tipos de Produto

| Valor | Tipo |
|---|---|
| 1 | VIDEOTYPE |
| 2 | EBOOKTYPE |
| 3 | PAYMENT_ONLY_TYPE |
| 4 | PHYSICAL_TYPE |
| 5 | ECOMMERCE |
| 6 | SHOPIFY |
| `subscription` | SUBSCRIPTION |
| `single` | SINGLE |

### Tipos de Item de Venda

| ID | Nome | Type |
|---|---|---|
| 1 | Produto Principal | `main` |
| 2 | Upsell | `upsell` |
| 3 | Order Bump | `order-bump` |
| 4 | Assinatura | `subscription` |

### Tipos de Checkout

| ID | Tipo |
|---|---|
| 1 | `single` |
| 2 | `three-steps` |
| 3 | `all` |

### Tipos Bling

| ID | Nome |
|---|---|
| 0 | Pagamento aprovado |
| 2 | Não emitir |

### Tipos eNotas

| ID | Nome |
|---|---|
| 0 | Venda |
| 1 | Após Garantia |
| 2 | Não emitir |

### Tipos de Notificação

| ID | Label | Key |
|---|---|---|
| 1 | Vendas | `sales` |
| 2 | Saques | `withdrawals` |
| 3 | Coprodução | `coproductions` |
| 4 | Afiliados | `affiliates` |
| 5 | Documentos | `documents` |
| 6 | Reembolso | `refund` |
| 7 | Integrações | `apps` |
| 8 | Produtos | `products` |
| 9 | Assinaturas | `subscriptions` |
| 10 | Notas Fiscais | `invoices` |
| 11 | Perguntas | `Questions` |
| 12 | Outros | `blank` |
| 13 | Perguntas | `questions` |

### Tipos de Atividade do Usuário

| ID | Label | Key |
|---|---|---|
| 1 | Multa | `penalty` |
| 2 | Depósito | `deposit` |

### Tipos de Histórico do Usuário

| ID | Label | Key |
|---|---|---|
| 1 | Alteração de e-mail | `mail-update` |
| 2 | Reembolso | `refund` |
| 3 | Código de Segurança | `code` |

### Métodos de Callback

| ID | Nome | Label |
|---|---|---|
| 1 | `payout_pix` | Saque Pix |
| 2 | `boleto` | Boleto |
| 3 | `pix` | Pix |

### Tipos de Imagem

| ID | Label | Key |
|---|---|---|
| 1 | Conteúdo do Mercado | `market-content` |
| 2 | Imagem de Conteúdo | `content` |
| 3 | Capa do Mercado | `market-cover` |

### Tipos de Embed

| ID | Nome | Key |
|---|---|---|
| 1 | Vimeo | `vimeo` |
| 2 | Youtube | `youtube` |
| 3 | Panda | `panda` |
| 4 | Membership | `owner` |

### Tipos de Bloqueio

| ID | Label | Key |
|---|---|---|
| 1 | Endereço | `address` |
| 2 | IP | `ip` |
| 3 | Cartão | `card` |
| 4 | Fingerprint | `fingerprint` |
| 5 | Oferta/Email | `offer-email` |

### Tipos de Página de Produto

| ID | Label | Key |
|---|---|---|
| 1 | Outro | `other` |
| 2 | Venda | `sale` |
| 3 | Conteúdo | `content` |
| 4 | Captura | `lead` |

### Tipos de Pixel

| ID | Nome | Type |
|---|---|---|
| 1 | Facebook | `facebook` |
| 2 | Google Ads | `google-ads` |
| 3 | Taboola | `taboola` |
| 4 | Outbrain | `outbrain` |
| 5 | Google Analytics | `google-analytics` |
| 6 | TikTok | `tiktok` |
| 7 | Kwai | `kwai` |
| 8 | Pinterest | `Pinterest` |

### Tipos de Plugin de Membership

| ID | Key | Label |
|---|---|---|
| 1 | `jivo-chat` | Jivo Chat |
| 2 | `whatsapp` | Whatsapp |

### Tipos de Banner

| ID | Nome | Type |
|---|---|---|
| 1 | Desktop | `desktop` |
| 2 | Mobile | `mobile` |

### Tipos de Permissão

| ID | Key | Label |
|---|---|---|
| 1 | `metrics` | Dashboard |
| 2 | `market` | Mercado |
| 3 | `products` | Meus Produtos |
| 4 | `coproduction` | Minhas Co-produções |
| 5 | `affiliates` | Minhas Afiliações |
| 6 | `balance` | Carteira |
| 7 | `sales` | Vendas |
| 8 | `subscriptions` | Assinaturas |
| 9 | `integrations` | Apps |
| 10 | `settings` | Configurações |
| 11 | `collaborators` | Colaboradores |
| 12 | `withdrawals` | Saques |
| 13 | `invoices` | Notas Fiscais |

### Tipos de Comissão de Gerente

| ID | Key | Label |
|---|---|---|
| 1 | `fixed` | Fixa |
| 2 | `percentage` | Percentual |

### Regras de Comissão de Afiliados

| ID | Nome | Label |
|---|---|---|
| 1 | `first-click` | Primeiro Click |
| 2 | `last-click` | Último Click |

### Tipos de Regras de Integração

| ID | Label | Key |
|---|---|---|
| 1 | Compra aprovada | `approved-payment` |
| 2 | Compra recusada | `refused-payment` |
| 3 | Reembolso | `refund` |
| 4 | Chargeback | `chargeback` |
| 5 | Carrinho abandonado | `abandoned-cart` |
| 6 | Boleto gerado | `generated-billet` |
| 7 | Pix gerado | `generated-pix` |
| 8 | Assinatura cancelada | `canceled-subscription` |
| 9 | Assinatura atrasada | `late-subscription` |
| 10 | Assinatura renovada | `renewed-subscription` |
| 11 | Rastreio | `tracking` |
| 12 | Solicitação de afiliação | `affiliate-request` |
| 13 | Afiliação aprovada | `approved-affiliate` |
| 14 | Afiliação recusada | `refused-affiliate` |

---

## 📝 Notas Importantes

1. **IDs**: Os IDs são valores numéricos únicos que identificam cada status/tipo no sistema.
2. **Keys**: As keys são identificadores em formato string (snake_case) usados na API.
3. **Cores**: As cores são usadas na interface do sistema para representar visualmente os status (success = verde, danger = vermelho, warning = amarelo, light = cinza claro, info = azul).
4. **Flow**: No caso de transações, o flow indica se é uma entrada (`income`) ou saída (`outcome`) de dinheiro.

---

## 🔍 Como Usar Esta Documentação

Ao receber um valor de status ou tipo da API:

1. Identifique o **contexto** (venda, transação, cobrança, etc.)
2. Localize a seção correspondente nesta documentação
3. Use o **ID** ou **Key** para identificar o status/tipo
4. Consulte a descrição para entender o significado

**Exemplo:**
- Se a API retornar `status: 2` em uma venda, consulte a tabela "Status de Vendas" e verá que corresponde a "Pago" (`paid`).
- Se a API retornar `payment_method: "pix"`, consulte a tabela "Métodos de Pagamento" e verá que corresponde a "Pix".

---

**Última atualização:** Documentação gerada automaticamente a partir dos arquivos de status e tipos do sistema.

