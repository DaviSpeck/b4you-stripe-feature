---
title: Glossário de Termos
---

# Glossário de Termos

Este glossário define os principais conceitos, siglas e ferramentas usados na documentação interna da B4You.

| Termo                         | Definição                                                                                                                                                 |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| **API**                       | Conjunto de endpoints HTTP que expõem funcionalidades do sistema para consumo interno ou externo.                                                         |
| **AWS**                       | Amazon Web Services - provedor de infraestrutura cloud usado para hospedar front-ends, back-ends, filas, monitoramento e funções serverless.              |
| **CI/CD**                     | Integração Contínua e Entrega Contínua - práticas e pipelines que automatizam lint, build, testes e deploy em diversos ambientes (`dev`, `prod`).       |
| **CloudFront**                | CDN da AWS usada para distribuir conteúdo estático (front-end) com baixa latência e cache global.                                                         |
| **Coprodução**                | Distribuição automática de receitas entre marca e coprodutor, configurada por percentuais na plataforma.                                                  |
| **Creator Economy**           | Modelo de negócios em que criadores de conteúdo (creators) monetizam audiência promovendo produtos ou serviços de terceiros.                             |
| **ECS**                       | Amazon Elastic Container Service - serviço de orquestração de contêineres Docker usado para rodar APIs na AWS.                                            |
| **Hotfix**                    | Branch crítica criada a partir de `main` para correções emergenciais em produção.                                                                        |
| **Lambda**                    | AWS Lambda - função serverless que executa código em resposta a eventos (webhooks, filas, triggers).                                                      |
| **n8n**                        | Plataforma open-source de automação de fluxos de trabalho (workflows) utilizada para integrações e processos internos.                                   |
| **OCI**                       | Observabilidade, Segurança e Compliance - pilares de monitoramento (Prometheus, Grafana), análise de logs e políticas de acesso.                        |
| **PR**                        | Pull Request - processo de revisão de código no GitHub que deve seguir políticas de template, checks obrigatórios e número mínimo de aprovações.          |
| **Release**                   | Branch usada para preparar uma nova versão estável, onde se corrigem bugs e atualiza changelog antes de merge em `main`.                                  |
| **S3**                        | Amazon Simple Storage Service - armazenamento de objetos, usado para hospedar builds de front-end e assets estáticos.                                     |
| **SQS**                       | Amazon Simple Queue Service - filas gerenciadas na AWS para desacoplar serviços e processar eventos de forma assíncrona.                                 |
| **Split de Pagamento**        | Distribuição automática de valores de venda entre diferentes contas (marca, coprodutor, creator) sem intervenção manual.                                |
| **Swagger / OpenAPI**         | Padrão de documentação de APIs REST que permite gerar automaticamente referências de endpoints e modelos de dados.                                        |
| **Webhook**                   | Mecanismo de callback HTTP em que aplicações notificam outras via requisições POST quando eventos específicos ocorrem.                                   |
| **YAML**                      | Linguagem de serialização de dados usada para definir workflows (GitHub Actions), configurações de infraestrutura (AppSpec) e templates de deploy.       |

> **Observação:** adicione novos termos conforme surgirem tecnologias, processos ou ferramentas específicas ao seu dia a dia na B4You.