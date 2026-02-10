---
title: Serviço de Multiadquirência – Documentação Funcional e Regras de Negócio
---

# Serviço de Multiadquirência - Documentação Funcional e Regras de Negócio

## 1. Visão Geral

O **Serviço de Multiadquirência** tem como objetivo permitir o processamento de pagamentos com cartão de crédito em **mais de uma adquirente**, de forma **automática e transparente** para o usuário final.

Quando habilitado, caso uma tentativa de processamento falhe em uma adquirente, o serviço realiza novas tentativas nas adquirentes seguintes, respeitando uma **ordem de prioridade previamente definida**.

---

## 2. Comportamento Padrão (Default)

- O serviço de multiadquirência **existe para todos os usuários**, porém:
  - **É desabilitado por padrão**
  - Todos os produtos e ofertas processam **exatamente como hoje**, utilizando apenas a **Pagar.me**

Esse comportamento garante:

- Backward compatibility
- Lançamento seguro do serviço
- Ativação gradual e controlada

---

## 3. Níveis de Configuração

A habilitação da multiadquirência pode ocorrer em **três níveis distintos**, com **regras claras de precedência**:

### 3.1. Produtor

### 3.2. Produto

### 3.3. Oferta

⚠️ **Apenas um nível pode estar ativo por vez.**

---

## 4. Regras de Habilitação por Nível

### 4.1. Habilitação por Produtor

**Descrição**
Quando a flag de multiadquirência é habilitada no nível de **produtor**:

- Todos os **produtos** do produtor passam a processar com multiadquirência
- Todas as **ofertas** desses produtos passam a processar com multiadquirência

**Efeitos colaterais automáticos**

- Flags de multiadquirência em **produto** são desabilitadas
- Flags de multiadquirência em **oferta** são desabilitadas

**Resumo**

> Produtor ativo → tudo abaixo ativo

---

### 4.2. Habilitação por Produto

**Descrição**
Quando a flag de multiadquirência é habilitada no nível de **produto**:

- Todas as **ofertas** daquele produto passam a processar com multiadquirência
- O processamento via produtor **não é considerado**

**Efeitos colaterais automáticos**

- Flag de multiadquirência do **produtor é desabilitada**
- Flags de multiadquirência em **ofertas** são desabilitadas

**Resumo**

> Produto ativo → todas as ofertas do produto ativas
> Produtor automaticamente desativado

---

### 4.3. Habilitação por Oferta

**Descrição**
Quando a flag de multiadquirência é habilitada no nível de **oferta**:

- Apenas a **oferta específica** processa com multiadquirência
- Cada oferta deve ser habilitada **individualmente**

**Efeitos colaterais automáticos**

- Flag de multiadquirência do **produtor é desabilitada**
- Flag de multiadquirência do **produto é desabilitada**

**Resumo**

> Oferta ativa → somente ela processa com multiadquirência
> Produto e produtor automaticamente desativados

---

## 5. Regra de Precedência (Fonte da Verdade)

A decisão de uso da multiadquirência segue **estritamente a seguinte ordem de prioridade**:

1. **Oferta**
2. **Produto**
3. **Produtor**
4. **Desabilitado (Pagar.me apenas)**

### Avaliação prática

```text
Se oferta estiver ativa → usa oferta
Senão, se produto estiver ativo → usa produto
Senão, se produtor estiver ativo → usa produtor
Senão → processamento padrão (Pagar.me)
```

---

## 6. Comportamento de Reativação em Cascata

O sistema **não mantém múltiplos níveis ativos simultaneamente**.

Exemplo:

- Multiadquirência habilitada por oferta
- Posteriormente, a flag de produto é ativada

Resultado:

- Todas as ofertas do produto passam a processar com multiadquirência
- Flags individuais de oferta são desabilitadas automaticamente

> A ativação em um nível superior **sobrescreve** as configurações mais granulares.

---

## 7. Regras Importantes e Invariantes

- Nunca existem **duas fontes de decisão simultâneas**
- O sistema sempre possui **uma única fonte de verdade**
- A mudança de nível:
  - É explícita
  - É automática
  - É determinística
- O comportamento final **nunca depende da UI**, apenas das flags persistidas

---

## 8. Observabilidade e Auditoria (recomendado)

Toda alteração de flag deve gerar um **log de evento**, contendo:

- Autor da ação (usuário ou sistema)
- Nível alterado (produtor | produto | oferta)
- Estado anterior
- Novo estado
- Flags automaticamente desativadas
- Timestamp

Isso permite:

- Auditoria
- Debug de processamento
- Histórico completo de decisões

---

## 9. Resumo Executivo

> O serviço de multiadquirência é global, mas a ativação é controlada por uma única flag ativa, respeitando uma hierarquia clara entre produtor, produto e oferta.
> O sistema garante previsibilidade, ausência de conflitos e compatibilidade total com o processamento atual.

---

## 10. Ordem de Prioridade das Adquirentes (Backoffice)

### Configuração Administrativa

Via **Backoffice (camada administrativa)**, deve ser possível **definir e manter a ordem de prioridade das adquirentes** utilizadas pelo serviço de multiadquirência.

Essa ordem determina:

- A **sequência de tentativas** de processamento de cartão de crédito
- Qual adquirente será utilizada primeiro
- Para quais adquirentes o sistema fará fallback em caso de falha

---

### Regras da Ordem de Prioridade

- A ordem de prioridade é:
  - **Configurável**
  - **Persistida**
  - **Respeitada estritamente** pelo serviço de multiadquirência

- O processamento segue o seguinte fluxo:

```text
1ª adquirente (prioridade mais alta)
→ falha
2ª adquirente
→ falha
...
Nª adquirente
```

- O fluxo é interrompido imediatamente quando:
  - O pagamento é aprovado
  - Ou todas as adquirentes da lista são esgotadas

---

### Escopo da Prioridade

- A ordem de prioridade:
  - É **global para o serviço de multiadquirência**
  - Não altera as regras de precedência entre produtor, produto e oferta
  - Atua **somente no momento do processamento**, após a decisão de que a multiadquirência está ativa

---

### Auditoria e Alterações

Toda alteração na ordem de prioridade deve:

- Ser realizada via backoffice
- Gerar log de auditoria contendo:
  - Usuário responsável
  - Ordem anterior
  - Nova ordem
  - Data e hora da alteração

---

### Invariante Importante

> A definição da ordem de prioridade **não habilita** a multiadquirência por si só.
> Ela apenas define **como o serviço se comporta quando ativo**.
