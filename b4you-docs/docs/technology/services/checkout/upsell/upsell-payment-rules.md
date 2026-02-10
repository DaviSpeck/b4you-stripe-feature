---
title: Regras de Pagamento do Upsell
---

# Regras de Pagamento do Upsell

Este documento descreve as **regras de pagamento**, **restrições técnicas** e **decisões de fallback** aplicadas ao processamento de Upsell no Checkout da B4You.

Ele serve como referência única para entender **quando**, **como** e **por que** um determinado método de pagamento pode (ou não) ser utilizado em um upsell.

---

## 1. Princípio Fundamental

O Upsell **não é uma nova jornada de checkout completa**.

Ele é um **desdobramento controlado** de uma venda principal já existente, respeitando:

- O método de pagamento original
- O estado da venda principal
- As capacidades do PSP
- As regras configuradas na oferta

---

## 2. Métodos de Pagamento Suportados

Atualmente, o Upsell pode ser processado via:

- `credit_card`
- `pix`

📌 **Boleto não é permitido para upsell**.

---

## 3. Regras Gerais (Independentes do Método)

Um upsell **só pode ser processado se**:

- A venda principal existir
- A venda principal estiver **paga**
- O `sale_item` principal for válido
- O produto de upsell pertencer ao mesmo produtor
- O upsell não tiver sido adquirido anteriormente

Caso contrário, o fluxo deve ser interrompido com erro controlado.

---

## 4. Regras para Cartão de Crédito

### 4.1 Condições Obrigatórias

Para upsell com cartão:

- A oferta deve permitir `credit_card`
- O cliente deve existir no PSP
- Deve existir **um cartão válido** disponível:
  - Cartão salvo no `sale_item`
  - Ou cartão salvo no `student`
  - Ou cartão tokenizado previamente

---

### 4.2 One-Click vs Cartão Manual

| Situação | Comportamento |
|--------|---------------|
| `is_one_click = true` e cartão disponível | Executa One-Click |
| `is_one_click = true` e **sem cartão** | Bloqueia e exige cartão |
| `is_one_click = false` | Exige cartão sempre |
| Token inválido | Bloqueia |

Erro esperado:
```

Para upsell com cartão, é necessário informar o cartão novamente

```

---

### 4.3 Parcelamento

- Parcelamento segue regras da **oferta de upsell**
- Parcelamento **não herda automaticamente** da venda principal
- Juros respeitam:
  - `student_pays_interest`
  - Tabelas de fee configuradas no usuário

---

## 5. Regras para Pix

### 5.1 Condições Obrigatórias

Para upsell via Pix:

- Oferta deve permitir `pix`
- Venda principal pode ter sido cartão ou pix
- Geração de QR Code ocorre **no momento do upsell**

---

### 5.2 Comportamento do Pix

- Pix sempre gera:
  - Nova `charge`
  - Novo QR Code
- Upsell Pix **não é one-click**
- Status inicial: `pending`

---

## 6. Mistura de Métodos (Restrições)

Algumas combinações são **explicitamente proibidas**:

| Venda Principal | Upsell | Permitido |
|----------------|--------|----------|
| Pix | Cartão | ❌ |
| Cartão | Pix | ✅ |
| Cartão | Cartão | ✅ |
| Pix | Pix | ✅ |

📌 A regra `Pix → Cartão` é bloqueada por segurança e antifraude.

---

## 7. Fallback de Pagamento

Quando o método escolhido falha:

- O sistema **não cancela** a venda principal
- O upsell pode:
  - Retornar erro controlado
  - Oferecer outro método permitido
  - Exigir novo input do usuário

Nunca deve ocorrer:
- Retry automático invisível
- Mudança silenciosa de método

---

## 8. Persistência de Dados

Cada upsell gera obrigatoriamente:

- Um novo `sale_item`
- Uma nova `charge`
- Associação via `sales_items_charges`
- Logs de tentativa e resultado

---

## 9. Anti-padrões

❌ Reutilizar método sem validar oferta  
❌ Assumir parcelamento da venda principal  
❌ Permitir Pix one-click  
❌ Permitir Pix → Cartão  

---

## 10. Considerações Finais

As regras de pagamento do upsell existem para:

- Garantir segurança
- Evitar fraudes
- Manter consistência contábil
- Preservar integridade do PSP

> ⚠️ Toda mudança nessas regras deve ser revisada junto ao time de pagamentos e antifraude.
