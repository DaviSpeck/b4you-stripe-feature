---
title: Visão Geral
---

# Visão Geral

Este documento descreve o **ambiente de testes da B4You**, projetado para permitir **testes paralelos por branch**, validações de QA, hotfixes e onboarding de novos desenvolvedores sem impacto em produção.

---

## Objetivo

O ambiente de testes tem como principais objetivos:

- Permitir múltiplas APIs rodando simultaneamente
- Isolar testes por branch
- Facilitar validações de QA e regressão
- Reduzir dependência de deploys em produção
- Acelerar onboarding de novos desenvolvedores

---

## Conceito Geral

Cada **branch** pode ser exposta como um **ambiente isolado**, utilizando:

- Docker para execução das APIs
- NGINX como proxy reverso
- Cloudflare para DNS e TLS
- EC2 como host central

O front-end em **preview (Vercel)** consome a API através do domínio configurado para a branch.

---

## Arquitetura Resumida

Fluxo simplificado:

```
Cloudflare (DNS + TLS)
        ↓
      EC2
        ↓
     NGINX
        ↓
 Docker Containers (APIs por branch)
```

---

## Quando Utilizar

Este ambiente deve ser utilizado para:

- Testes de novas features
- QA funcional
- Validação de integrações
- Hotfixes controlados
- Demonstrações internas
- Onboarding de desenvolvedores

---

## Boas Práticas

- Nunca utilizar dados reais de produção
- Manter branches nomeadas corretamente
- Derrubar ambientes que não estão mais em uso
- Documentar portas e domínios expostos
- Evitar expor variáveis sensíveis em documentação

---

## Documentos Relacionados

- Sandbox por Branch
- Organização de Ambientes B4You
- CI/CD

---

> ⚠️ Este ambiente não substitui homologação ou produção.  
> Ele existe exclusivamente para testes controlados. 