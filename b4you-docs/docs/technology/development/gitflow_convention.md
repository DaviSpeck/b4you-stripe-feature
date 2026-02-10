---
title: Gitflow Simplificado & Convenções de Commits
---

# Gitflow Simplificado & Convenções de Commits

Este guia define nosso modelo de ramificação e padrões de commit, garantindo clareza, rastreabilidade e entregas consistentes.

---

## 1. Visão Geral do Fluxo Gitflow

| Branch      | Objetivo                                      | Deploy Automático           |
|-------------|-----------------------------------------------|-----------------------------|
| `main`      | Código estável em produção                    | Produção (build estável)    |
| `develop`   | Integração contínua de novas features         | Homologação / QA            |
| `feature/*` | Desenvolvimento de funcionalidades isoladas   | Ambiente de desenvolvimento local |
| `release/*` | Preparação de uma nova versão (bug-fixes, docs)| Homologação final           |
| `hotfix/*`  | Correções críticas em produção                | Produção imediata           |

---

## 2. Padrões de Nomenclatura de Branches

1. **Feature**  
   ```
   feature/<ISSUE>-<descrição-curta>
   ```  
   - `<ISSUE>`: identificador da ferramenta de issue tracking (ex.: JIRA-123)  
   - `<descrição-curta>`: em _kebab-case_, até 3–5 palavras (ex.: `feature/JIRA-123-login-oauth`)

2. **Release**  
   ```
   release/v<MAJOR>.<MINOR>.<PATCH>
   ```  
   - Use [SemVer](https://semver.org/) (ex.: `release/v1.2.0`)

3. **Hotfix**  
   ```
   hotfix/v<MAJOR>.<MINOR>.<PATCH>-<descrição>
   ```  
   - Aplicável somente em `main`; correções urgentes (ex.: `hotfix/v1.2.1-security-patch`)

4. **Support** (opcional)  
   ```
   support/<descrição>
   ```  
   - Pequenos ajustes que não se enquadram em features ou hotfixes

---

## 3. Convenções de Mensagens de Commit

**Formato padrão**:  
```
<tipo>(<escopo>): <descrição curta>

<parágrafo opcional de corpo>
```

- **Tipos** (Conventional Commits):  
  - `feat`: nova funcionalidade  
  - `fix`: correção de bug  
  - `docs`: documentação  
  - `style`: formatação, espaços, ponto-e-vírgula, sem alteração de lógica  
  - `refactor`: refatoração de código sem adicionar feature ou corrigir bug  
  - `perf`: melhoria de performance  
  - `test`: adicionar ou corrigir testes  
  - `chore`: atualização de build, dependências, scripts  

- **Escopo**: módulo ou componente afetado (ex.: `auth`, `checkout`, `api`)

- **Descrição curta**: verbo no infinitivo, _kebab-case_ (ex.: `feat(auth): adicionar login via OAuth`)

- **Corpo** (opcional):  
  - Explique o **porquê** da mudança  
  - Liste impactos visíveis, efeitos colaterais e observações úteis

- **Exemplos**:  
  ```bash
  git commit -m "feat(checkout): implementar botão de pagamento em um clique"
  git commit -m "fix(api): corrigir cálculo de imposto no endpoint /order"
  git commit -m "docs(auth): atualizar README com fluxo OAuth"
  ```

---

## 4. Fluxo de Trabalho passo a passo

1. **Atualizar branches locais**  
   ```bash
   git fetch origin
   git switch develop
   git pull --rebase origin develop
   ```

2. **Criar nova feature**  
   ```bash
   git switch -c feature/JIRA-123-login-oauth
   ```

3. **Desenvolver e fazer commits atômicos**  
   - Cada commit deve cumprir a convenção de tipo/escopo  
   - Mantenha os commits pequenos: **até 100 linhas** de mudança por commit

4. **Publicar branch**  
   ```bash
   git push -u origin feature/JIRA-123-login-oauth
   ```

5. **Abrir Pull Request**  
   - Alvo: `develop`  
   - Use o template de PR padrão  
   - Inclua link para a issue e resumo das mudanças

6. **Revisão & Merge**  
   - Aguarde checks de lint e build  
   - Min. 1 aprovação para features; 2 para mudanças críticas  
   - Escolha “Squash and merge” ou “Rebase and merge” conforme convenção

7. **Gerar Release**  
   ```bash
   git switch develop
   git pull --rebase origin develop
   git switch -c release/v1.2.0
   # resolver bugs e atualizar CHANGELOG.md
   git push -u origin release/v1.2.0
   # abrir PR → main, aprovar e mergear
   git tag v1.2.0
   git push origin v1.2.0
   git switch develop
   git merge main
   git push origin develop
   ```

8. **Hotfix urgente**  
   ```bash
   git switch main
   git pull origin main
   git switch -c hotfix/v1.2.1-critical-fix
   # corrigir, push e abrir PR → main
   git push -u origin hotfix/v1.2.1-critical-fix
   # merge e deploy imediatos
   git switch develop
   git merge main
   git push origin develop
   ```

---

## 5. Boas Práticas Gerais

- **Pulls frequentes**: rebase diário para evitar conflitos massivos  
- **Branches curtas**: finalize em até 3 dias úteis  
- **Commits atômicos**: um propósito por commit  
- **Changelog**: mantenha `CHANGELOG.md` atualizado em cada release  
- **Automação mínima**: ao menos lint automático; testes podem ser adicionados gradualmente  
- **Rastreabilidade**: vincule sempre as issues e PRs no histórico de commits e changelog

---

> 📘 **Links úteis**  
> - [Conventional Commits](https://www.conventionalcommits.org/)  
> - [SemVer 2.0.0](https://semver.org/)  
> - [Gitflow Workflow](https://www.atlassian.com/br/git/tutorials/comparing-workflows/gitflow-workflow)  
> - Exemplo de template de PR: `docs/dev/pr-template.md`