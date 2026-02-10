---
title: Upsell no Checkout - Visão Geral
---

# Upsell no Checkout - Visão Geral

Este documento descreve a **arquitetura**, os **tipos de upsell**, os **fluxos suportados** e as **responsabilidades técnicas** do Upsell dentro do serviço de Checkout da B4You.

O Upsell é um **fluxo pós-compra**, executado **após a criação da venda principal**, e utiliza configurações previamente definidas na Dashboard.

---

## 1. Conceito de Upsell

Upsell é uma etapa opcional do Checkout que permite:

- Oferecer novos produtos após a compra principal
- Reaproveitar contexto da venda original
- Maximizar conversão sem reiniciar o checkout

📌 **Importante:**  
O Upsell **não cria uma nova venda independente**.  
Ele **estende** uma venda já existente (`sale_item`).

---

## 2. Posição no Fluxo de Compra

Fluxo simplificado:

```

Checkout Principal
↓
Pagamento confirmado
↓
Upsell (0..N)
↓
Página de Obrigado

```

O usuário **nunca retorna** ao checkout principal após entrar no upsell.

---

## 3. Tipos de Upsell Suportados

### 3.1 Upsell Nativo

- Renderizado pelo Checkout
- Configurado via Dashboard
- Pode ser:
  - One-click
  - Multi-offer
  - Com planos
  - Com Pix ou Cartão

📌 Documentação detalhada:
- `upsell-native.md`
- `upsell-one-click.md`

---

### 3.2 Upsell Externo (não nativo)

- Redirecionamento para outra URL
- Não controlado pelo Checkout
- Fora do escopo deste documento

---

## 4. Escopos de Configuração

O Upsell pode ser configurado em dois níveis:

| Nível   | Prioridade | Finalidade                  |
|--------|-----------|-----------------------------|
| Oferta | Alta      | Exceções e personalizações |
| Produto| Média     | Configuração base           |

Regra:
> **Oferta sempre sobrescreve Produto**

---

## 5. Componentes Técnicos Envolvidos

### Frontend
- Página dedicada de Upsell (`/upsell-native`)
- Renderização 100% baseada em API
- Nenhuma regra hardcoded

### Backend
- Endpoints dedicados:
  - `/upsell-native/:offer_uuid`
  - `/upsell-native/:offer_uuid/payment`
- Reuso de `sale_item`

### Persistência
- `upsell_native_offer`
- `upsell_native_product`
- `offers_upsell_native`

---

## 6. Estados Importantes

Durante o upsell, a venda pode estar em:

- **Aprovada** (venda principal)
- **Estendida** (upsell aceito)
- **Finalizada** (upsell recusado ou inexistente)

O estado final sempre leva o usuário para o **Thank You Page**.

---

## 7. Segurança e Validações

Toda execução de upsell valida:

- Existência do `sale_item`
- Posse do usuário
- Compatibilidade de pagamento
- Regras de parcelamento
- Regras de one-click

Nenhuma cobrança é feita sem validação explícita.

---

## 8. Anti-padrões

- Criar upsell sem venda válida
- Reexecutar checkout principal
- Hardcode de preços no frontend
- Assumir cartão salvo sem validação

---

## 9. Observações Importantes

- Upsell impacta diretamente conversão
- Pequenos erros geram perda financeira
- Todo fluxo deve ser testado em sandbox

---

> ⚠️ O Upsell é um **fluxo sensível**.  
> Alterações devem ser acompanhadas por logs, métricas e rollback rápido.