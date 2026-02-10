---
title: Visão Geral
---

# Visão Geral da Arquitetura B4You

Este documento apresenta o panorama de como os componentes do ecossistema B4You se interconectam, desde o front-end até os microsserviços, filas e integrações externas.

## Objetivos

1. **Escalabilidade**  
   Garantir capacidade de escalar picos de tráfego no checkout e painéis Analytics.  
2. **Resiliência**  
   Minimizar downtime por meio de replicação e estratégias de retry.  
3. **Manutenibilidade**  
   Separar responsabilidades em microsserviços e infra “serverless” quando possível.  
4. **Segurança**  
   Uso de certificados, WAF, controle de acesso e criptografia de dados em trânsito e repouso.

## Componentes Principais

- **Checkout (Next.js)**  
  Hospedado via CloudFront, serve o front-end de compra com otimização de performance.

- **Back-office (React)**  
  Front-end para gestão de produtores, afiliados e pedidos, também em CloudFront.

- **API Gateway**  
  Roteia requisições dos front-ends para os serviços em ECS.

- **ECS Services**  
  - `sixbase-api`: gestão de produtos, usuários e campanhas.  
  - `sixbase-api-backoffice`: endpoints exclusivos para o painel administrativo.  
  - `api-checkout`: lógica de carrinho, pagamento e antifraude.

- **RDS (MySQL)**  
  Banco de dados relacional para dados transacionais.

- **b4you-lambdas**  
  Conjunto de funções serverless para webhooks, integrações e geração de NFe.

- **DynamoDB**  
  Armazenamento semiestruturado para dados de sessão e cache leve.

- **SQS**  
  Filas para orquestração de jobs assíncronos (ex.: processamento de pedidos).

- **S3**  
  Bucket para assets estáticos, relatórios e arquivos de NFe.

- **Observabilidade**  
  - **Prometheus**: coleta métricas de serviços e Lambdas.  
  - **Grafana**: visualização de dashboards e alertas.  
  - **Alertmanager**: gerenciamento de notificações.

## Fluxos Críticos

- **Checkout Transparente**  
  Cliente → CloudFront → Next.js → API Gateway → `api-checkout` → RDS

- **Processamento de NFe**  
  Evento em SQS → Lambda `nfe-generator` → S3

- **Monitoramento**  
  Serviços & Lambdas → Prometheus → Alertmanager → Grafana