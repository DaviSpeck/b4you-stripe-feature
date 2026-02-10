---
title: Visão Geral de Lambdas
---

# Visão Geral de Lambdas

Esta documentação descreve o **padrão atual de uso, organização e deploy das AWS Lambdas** na B4You, servindo como referência para desenvolvedores, operações e sustentação.

---

## 1. Objetivo

As Lambdas na B4You são utilizadas para:

- Processamento assíncrono
- Jobs agendados (cron / EventBridge)
- Integrações externas
- Automação de tarefas específicas
- Redução de carga em APIs síncronas

Cada Lambda possui **responsabilidade bem definida**, evitando acoplamento excessivo com serviços principais.

---

## 2. Padrões Atuais

### 2.1 Organização de Código

- Cada Lambda deve possuir:
  - Repositório próprio **ou**
  - Pasta isolada com contexto claro
- Código focado em **uma única responsabilidade**
- Dependências mantidas no mínimo necessário

---

### 2.2 Ambientes

Atualmente existem dois ambientes:

- **production**
- **sandbox**

Cada ambiente possui:
- Nome de função distinto
- Deploy independente
- Configurações isoladas

---

## 3. Estratégia Atual de Deploy

⚠️ **Atualmente, todo deploy de Lambda é realizado de forma manual.**

- Não existe pipeline de CI/CD automatizado
- O deploy é executado via **shell script versionado**
- O controle é feito pelo desenvolvedor responsável

➡️ O processo oficial está documentado em:  
**Deploy Manual de Lambdas via Shell Script**

---

## 4. Boas Práticas Obrigatórias

- Sempre executar deploy primeiro em **sandbox**
- Validar execução e logs antes de produção
- Documentar o motivo do deploy em ticket ou PR
- Evitar alterações diretas no console AWS
- Versionar scripts junto ao código

---

## 5. Evolução Planejada

🚧 **Planejado (não implementado)**

- Implementação de pipeline CI/CD
- Automação de build e deploy
- Estratégia de rollback
- Integração com versionamento e tags

📌 **Observação:**  
Até que o CI/CD esteja disponível, **o script manual é a única forma suportada de deploy**.

---

## 6. Documentos Relacionados

- Deploy Manual de Lambdas via Shell Script
- Catálogo de Lambdas
- Templates de Documentação de Lambda

---

> ⚠️ Deploy manual é um ponto crítico de risco.  
> Atenção redobrada ao executar em produção.