---
title: Visão Geral
---

# Visão Geral

Este documento descreve a **arquitetura**, os **fluxos suportados** e as **responsabilidades técnicas** do serviço de Checkout da B4You, servindo como ponto de partida para desenvolvedores, operações e times de sustentação.

---

## 1. Objetivo do Serviço

O serviço de Checkout da B4You é responsável por:

- Exibição da experiência de pagamento ao usuário final
- Processamento de pedidos e vendas
- Integração com gateways de pagamento
- Aplicação de regras de negócio (ofertas, cupons, order bump, split, etc)
- Garantia de segurança (CORS, CSP, antifraude, captcha)

---

## 2. Tipos de Checkout

Atualmente existem **dois modelos ativos**:

### 2.1 Checkout Padrão (B4You)

- Domínios gerenciados diretamente pela B4You
- Infraestrutura baseada em:
  - CloudFront
  - APIs internas
- Utilizado como fallback e ambiente base

---

### 2.2 Checkout Transparente

- Utiliza **domínio do produtor** (ex: `seguro.seudominio.com.br`)
- Experiência white-label
- Mantém processamento 100% na infraestrutura da B4You

📌 **Observação:**  
O processo completo de configuração está documentado em  
➡️ **Configuração de Checkout Transparente**

---

## 3. Componentes Técnicos Envolvidos

### Front-end
- Checkout atual: React (sixbase-checkout)
- Novo checkout: Next.js (Vercel)

### Back-end
- api-checkout
- Serviços auxiliares (ofertas, vendas, antifraude)

### Infraestrutura
- AWS CloudFront
- AWS ACM (certificados)
- Cloudflare (Turnstile)
- Vercel (novo checkout)

---

## 4. Segurança e Conformidade

O serviço de checkout aplica múltiplas camadas de proteção:

- **CORS** por domínio autorizado
- **Cloudflare Turnstile** (captcha)
- **Content-Security-Policy (CSP)** restritiva
- Isolamento por ambiente (local, sandbox, produção)

---

## 5. Evoluções Planejadas

- Integração com serviço de **multiadquirência**
- Redução de URLs hardcoded no front-end
- Padronização completa de domínios por configuração centralizada

📌 **Observação:**  
Toda nova evolução relacionada a domínios, pagamentos ou antifraude deve considerar impacto direto no **checkout transparente**.

---

## 6. Documentos Relacionados

- Configuração de Checkout Transparente
- api-checkout
- sixbase-checkout
- Monitoramento e Observabilidade de APIs

---

> ⚠️ Este serviço é **crítico para o negócio**.  
> Qualquer alteração deve ser documentada, validada em sandbox e acompanhada por logs e métricas.