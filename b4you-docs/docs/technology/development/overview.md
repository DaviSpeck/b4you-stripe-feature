---
title: Desenvolvimento
---

# Processo de Desenvolvimento na B4You

Este documento reúne as práticas, padrões e ferramentas que garantem um fluxo ágil, seguro e colaborativo, do planejamento até o deploy.

- **[CI/CD](./cicd)**  
  **Automatize** o pipeline completo: compilação, análise estática, containerização e deploy contínuo. Inclui etapas de build, testes de integração e unitários, e validações de segurança, com deploy automático em homologação e produção.

- **[Gitflow & Convenções de Commits](./gitflow_convention)**  
  **Organize** seu trabalho com o modelo Gitflow: branches `feature/*`, `release/*`, `hotfix/*`, além de `develop` e `main`. Use nomenclaturas padronizadas e commits no formato Conventional Commits para garantir rastreabilidade e histórico claro.

- **[Política de Pull Requests](./pr-policy)**  
  **Padronize** suas PRs com templates prontos, checks obrigatórios (lint, build, segurança) e critérios de aceitação. Defina revisores mínimos e políticas de merge para aumentar a qualidade do código e evitar regressões.

- **[Como Interpretar Padrões de Documentação no Jira](./how-to-interpret-the-jira-documentation-standard)**  
  **Entenda** como o Head de Tecnologia estrutura User Stories, Critérios de Aceite e requisitos no Jira. Extraia corretamente cada informação antes de começar a codar, evitando retrabalho e dúvidas.

- **[Guia de Execução de Demandas para Desenvolvedores](./execution-guide-for-developers)**  
  **Siga** um fluxo passo-a-passo desde a criação da branch até a entrega em produção: planejamento técnico, testes manuais, documentação avulsa e abertura de PR. Tudo em um só lugar para manter consistência em cada entrega.

---

> ⚙️ **Dica**: vincule sempre sua PR à issue correspondente e inclua, no corpo, um resumo das mudanças e instruções de teste local. Isso acelera a revisão e mantém o histórico de decisões claro para toda a equipe.  