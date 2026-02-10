---
title: Visão Geral
---

# Visão Geral

Este documento descreve a **arquitetura**, os **fluxos de configuração** e as **responsabilidades técnicas** da Dashboard da B4You, com foco em features que impactam diretamente o Checkout, como o **Upsell Nativo**.

A Dashboard é responsável por **orquestrar configurações**, **validar regras de negócio** e **persistir estados**, mas **não executa o fluxo de compra**.

---

## 1. Objetivo da Dashboard

A Dashboard da B4You permite que produtores e operadores:

- Criem e gerenciem produtos e ofertas
- Configure experiências de checkout
- Definam regras comerciais (preço, upsell, afiliados)
- Personalizem comunicação visual e mensagens
- Ativem ou inativem features críticas de conversão

📌 **Importante:**  
A Dashboard **não processa pagamentos**.  
Ela apenas **configura o comportamento** do Checkout.

---

## 2. Princípios Arquiteturais

A Dashboard segue os seguintes princípios:

- **Configuração > Execução**  
  Toda regra definida aqui é consumida posteriormente pelo Checkout.

- **Fonte única da verdade**  
  O backend da Dashboard é a referência oficial de estado.

- **Separação por nível de escopo (ex: Upsell Nativo)**
  - Produto → configuração base / fallback
  - Oferta → sobrescrita pontual

- **Segurança por ownership**
  - Todas as ações validam posse (`user → produto → oferta`)

---

## 3. Componentes Técnicos

### Front-end
- React
- react-hook-form
- Validações com Yup
- Preview desacoplado da persistência

### Back-end
- API Dashboard
- Validators de existência e ownership
- Repositórios Sequelize
- DTOs e Serializers

---

## 4. Fluxo Geral de Configuração

1. Usuário acessa a Dashboard
2. Seleciona um Produto
3. Configura regras (ex: Upsell Nativo)
4. Backend valida ownership e consistência
5. Dados são persistidos
6. Checkout consome a configuração em tempo de execução

---

## 5. Relação com o Checkout

A Dashboard **não renderiza** o checkout.

Ela fornece:
- Flags de ativação
- Configurações visuais
- Regras de comportamento

O Checkout:
- Consome
- Executa
- Aplica fallback quando necessário

---

## 6. Documentos Relacionados

- Upsell Nativo - Nível Produto
- Upsell Nativo - Nível Oferta
- Visão Geral do Checkout
- Lógica de Atribuição de Afiliado

---

> ⚠️ A Dashboard configura **features críticas de conversão**.  
> Toda alteração deve respeitar contratos existentes e ser validada em sandbox.