---
title: CI/CD Simplificado
---

# CI/CD Simplificado

Este guia descreve nosso pipeline de integração e entrega contínua, cobrindo desde lint e build até deploy automático nos ambientes de **desenvolvimento** (`dev`) e **produção** (`main`).

---

## 1. Visão Geral do Pipeline

1. **Push/PR em `dev`**  
   - **Workflow**: `CI Sandbox`  
   - **Jobs**:
     1. **Lint**: ESLint + Prettier  
     2. **Build Front**: `yarn build` (sixbase-backoffice, b4you-checkout…)  
     3. **Build Docker**: empacota APIs (`sixbase-api*`) em imagem  
     4. **Deploy Sandbox**:  
        - Front: copia `build/` para S3 + invalida CloudFront de staging  
        - API: atualiza task definition e faz ECS Deploy com CodeDeploy appspec-sandbox.json  
     5. **Smoke Tests** (opcional): requisições básicas para `/health` e `/status`  

2. **Push/PR em `main`**  
   - **Workflow**: `CI Production`  
   - **Jobs** (mesmos de `dev`, mas apontando para produção):
     1. **Lint**  
     2. **Build Front**  
     3. **Build Docker**  
     4. **Deploy Produção**: S3 “backoffice.sixbase.com.br” + ECS Prod + invalidação de CDN  
     5. **Smoke Tests**  

3. **Workflow Manual**  
   - Disparo manual via Actions Tab (opção `workflow_dispatch`)  
   - Útil para redeploy em caso de rollback ou hotfix urgentes.

---

## 2. Detalhamento dos Jobs

### 2.1 Lint & Formatting  
- **Ferramentas**: ESLint, Prettier  
- **Objetivo**: garantir padronização de código antes de qualquer build.  
- **Comando**:
  ```bash
  yarn lint   # deve rodar eslint . --ext .js,.ts
  yarn format:check   # prettier --check
  ```

### 2.2 Build Front-end  
- **Projetos**: `sixbase-checkout`, `sixbase-backoffice`, `b4you-checkout`  
- **Comando**:
  ```bash
  yarn install
  yarn build
  ```
- **Artefato**: pasta `build/`

### 2.3 Build & Push Docker  
- **Projetos**: `sixbase-api`, `sixbase-api-backoffice`, `api-checkout`  
- **Passos**:
  1. `docker build -t $IMAGE_NAME:$GITHUB_SHA .`  
  2. `docker push $IMAGE_NAME:$GITHUB_SHA`

### 2.4 Deploy Automático  
- **Front-end**:  
  ```bash
  aws s3 cp build/ s3://<bucket-${BRANCH}>/ --recursive
  aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths '/*'
  ```
- **API (ECS + CodeDeploy)**:  
  - Gera `task-definition-<env>.json` via template  
  - Usa ação `aws-actions/amazon-ecs-deploy-task-definition@v1`  
  - Parâmetros principais:  
    ```yaml
    service: service-api-${env}-bg
    cluster: sixbase-api
    appspec: appspec-${env}.json
    deployment-group: DgpECS-sixbase-api-service-api-${env}-bg
    ```

### 2.5 Smoke Tests (Opcional, recomendado)  
- Após deploy, rodar script que faz chamadas HTTP a `/health` e endpoints críticos.  
- Em caso de falha, viola o workflow para evitar propagação de erro.

---

## 3. Dicas de Melhoria

- **Cache de dependências**: use `actions/cache` para `~/.npm` e `~/.cache/yarn` → acelera build.  
- **Geração de versão automática**: integrar semver/`semantic-release` para taggear a cada merge em `main`.  
- **Infraestrutura como código**: rodar `terraform fmt` e `terraform validate` antes do deploy.  
- **Code Coverage placeholder**: mesmo sem testes agora, já crie o job `run-tests` para incluir no futuro, e publique relatório no Codecov.  
- **Gate de aprovação**:  
  - Deploy em `main` só após merge no GitHub (automatizado pelo workflow).  
  - Adicionar environment protection em Actions para exigir revisão manual antes de deployment em produção.

---

> ℹ️ **Próximo passo**: envie seus YAMLs completos que posso ajudar a refinar caching, testes e gates.

