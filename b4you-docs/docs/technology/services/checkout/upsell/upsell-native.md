---
title: Upsell Nativo no Checkout
---

# Upsell Nativo no Checkout

Este documento descreve o **Upsell Nativo** no serviço de Checkout da B4You, detalhando sua **arquitetura**, **regras de negócio**, **fluxos de execução** e **integração com Dashboard e pagamentos**.

O Upsell Nativo é a implementação **oficial e suportada** de upsell dentro do Checkout.

---

## 1. Conceito

O Upsell Nativo:

- É renderizado diretamente pelo Checkout
- É totalmente configurado via Dashboard
- Reaproveita a venda principal (`sale_item`)
- Não reinicia o checkout
- Não exige novo formulário de dados (quando one-click)

📌 O Checkout **executa** o upsell, mas **não decide** suas regras.

---

## 2. Pré-requisitos

Para que um Upsell Nativo seja exibido:

- Deve existir uma venda principal válida (`sale_item`)
- O pagamento principal deve estar **aprovado**
- O produto/oferta deve possuir upsell ativo
- O upsell deve estar dentro do período válido

Caso qualquer condição falhe, o Checkout segue para o **Thank You Page**.

---

## 3. Escopo de Configuração

O Upsell Nativo pode ser configurado em dois níveis:

### 3.1 Nível Produto

- Define comportamento padrão
- Aplica-se a todas as ofertas do produto
- Funciona como **fallback**

Entidade: `upsell_native_product`

---

### 3.2 Nível Oferta

- Sobrescreve o Produto
- Permite personalizações pontuais
- Tem prioridade máxima

Entidade: `upsell_native_offer`

---

## 4. Fluxo de Resolução

Ordem de busca da configuração:

1. Upsell por **Oferta**
2. Upsell por **Produto**
3. Nenhum Upsell

Essa lógica é aplicada no backend do Checkout.

---

## 5. Tipos de Experiência

O Upsell Nativo suporta:

- **One-click**
- **Multi-offer**
- **Planos (assinatura)**
- **Pix**
- **Cartão de crédito**

As combinações possíveis dependem da configuração da oferta.

---

## 6. Arquitetura Técnica

### Frontend

- Página dedicada (`/upsell-native`)
- Renderização 100% baseada em API
- Estado controlado por query params:
  - `sale_item_id`
  - `offer_id`

Nenhuma regra de preço ou parcelamento é calculada no front.

---

### Backend

Principais endpoints:

- `GET /upsell-native/:offer_uuid`
- `GET /upsell-native/:offer_uuid/multi-offers`
- `POST /upsell-native/:offer_uuid/payment`
- `POST /upsell-native/:offer_uuid/payment/pix`

Responsabilidades:
- Resolver configuração
- Validar contexto da venda
- Orquestrar pagamento
- Criar novos `sale_item` e `charge`

---

## 7. Modelo de Dados (Simplificado)

Entidades envolvidas:

- `upsell_native_product`
- `upsell_native_offer`
- `offers_upsell_native`
- `sales_items`
- `charges`

Relacionamento principal:
```

sale → sale_item (principal)
↓
sale_item (upsell)

```

---

## 8. Regras de Negócio Importantes

- Upsell **não pode** alterar a venda principal
- O upsell herda:
  - Aluno
  - Afiliado
  - Contexto da venda
- Cada upsell gera:
  - Um novo `sale_item`
  - Uma nova `charge`

---

## 9. Fallbacks

- Configuração inexistente → não renderiza upsell
- Erro de validação → redireciona para Thank You
- Falha de pagamento → mantém venda principal

---

## 10. Observabilidade

O fluxo de upsell gera:

- Logs de tentativa
- Eventos de pagamento
- Webhooks de integração
- Métricas de conversão

Toda falha deve ser rastreável por `sale_item_id`.

---

## 11. Anti-padrões

- Hardcode de preço no front
- Execução sem `sale_item_id`
- Ignorar ownership
- Reuso de cartão sem validação

---

> ⚠️ Upsell Nativo é **crítico para conversão**.  
> Mudanças exigem validação funcional, técnica e de negócio.