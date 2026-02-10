---
title: Upsell One-Click
---

# Upsell One-Click

Este documento descreve o funcionamento do **Upsell One-Click** no Checkout da B4You, incluindo **pré-requisitos**, **regras técnicas**, **limitações** e **pontos críticos de segurança**.

O Upsell One-Click permite concluir uma nova compra **sem solicitar novamente os dados do cartão**, reaproveitando o contexto da venda principal.

---

## 1. Conceito

Upsell One-Click é um fluxo de upsell onde:

- O usuário **não preenche formulário de pagamento**
- O Checkout reutiliza o **cliente já existente no PSP**
- A confirmação ocorre com **um único clique**

📌 O One-Click **não significa** reutilizar dados sensíveis do cartão no front.

---

## 2. Pré-requisitos Obrigatórios

Para que o One-Click seja permitido:

- Venda principal **paga com cartão**
- Venda principal **aprovada**
- Cliente existente no PSP (`provider_external_id`) **associado à venda principal**
- Oferta de upsell aceita **cartão de crédito**
- Configuração `is_one_click = true`

Caso qualquer requisito falhe, o Checkout **deve cair para fluxo com formulário**.

---

## 3. Origem do Cartão

O cartão utilizado no One-Click é resolvido **exclusivamente pelo backend**, com a seguinte ordem de prioridade:

1. Cartão associado ao `sale_item` principal
2. Cartão associado ao `student.credit_card`
3. Customer (`provider_external_id`) previamente existente no PSP

⚠️ **Nunca** confiar apenas no front para validar a existência do cartão.

---

## 4. Fluxo Técnico

### 4.1 Frontend

- Botão de aceite dispara request direto
- Nenhum dado sensível é enviado
- Payload mínimo:

```json
{
  "offer_id": "...",
  "sale_item_id": "...",
  "payment_method": "card",
  "installments": 1
}
````

📌 O frontend **não envia token de cartão** neste fluxo.
Toda decisão sobre One-Click é **exclusivamente do backend**.

---

### 4.2 Backend

O backend executa:

1. Validação do `sale_item` principal
2. Validação do pagamento original
3. Recuperação do `provider_external_id`
4. Validação de cartão disponível
5. Criação da nova charge
6. Criação do `sale_item` de upsell

---

## 5. Validações Críticas

O backend **deve bloquear** One-Click quando:

* Pagamento original foi Pix ou Boleto
* Não existe cartão válido associado
* Token do cartão **ou customer válido** está ausente
* PSP retorna erro de autorização
* Upsell exige autenticação adicional

Erro típico:

```
Para upsell com cartão, é necessário informar o cartão novamente
```

---

## 6. Integração com PSP

O One-Click utiliza:

* `provider_external_id` (customer)
* Token de cartão salvo no PSP
* Transação sem captura de dados no front

📌 Toda lógica de segurança é **server-side**.

---

## 7. Fallback Automático

Se One-Click falhar:

* O Checkout **não cancela** a venda principal
* O fluxo pode:

  * Abrir modal de cartão
  * Ou redirecionar para fluxo padrão de pagamento

📌 O fallback deve ser **transparente para o usuário**, evitando perda de conversão.

O fallback é **obrigatório**.

---

## 8. Observabilidade

Cada tentativa One-Click gera:

* Log de tentativa
* Log de falha ou sucesso
* Associação clara com `sale_item_id`

Esses dados são essenciais para:

* Debug
* Antifraude
* Análise de conversão

---

## 9. Anti-padrões

❌ Permitir One-Click sem validar PSP
❌ Confiar em flag do front
❌ Reutilizar cartão sem token ou customer válido
❌ Executar One-Click em Pix

---

## 10. Considerações Finais

Upsell One-Click é um **atalho controlado**, não um atalho inseguro.

Toda decisão deve ser tomada **no backend**, com fallback seguro e logs completos.

> ⚠️ Qualquer alteração nesse fluxo deve ser avaliada junto ao time de pagamentos.