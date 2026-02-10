---
title: Política de Pull Requests
---

# Política de Pull Requests

## 1. Objetivo
Garantir que todas as mudanças em código sejam revisadas de forma eficaz, mantendo qualidade e rastreabilidade.

## 2. Template de PR
Utilize o template padrão (veja `docs/dev/pr-template.md`) para uniformidade.

## 3. Checks Obrigatórios
1. **Lint**: Código deve passar sem erros de ESLint/Prettier.
2. **Revisão Manual**: Validação de lógica, performance e riscos de segurança.

## 4. Aprovações e Critérios
- **Revisores**: mínimo de 1 aprovação; 2 aprovações para mudanças críticas.
- **Comentários**: cada revisor deve fornecer ao menos um insight (positivo ou corretivo).
- **Merge**: use “Squash and merge” ou “Rebase and merge” para manter histórico limpo.

## 5. Tempo de Revisão
- Revisões devem ocorrer em até **24 horas** úteis após abertura de PR.
- Autor responde comentários em até 2 horas úteis.

## 6. Boas Práticas
- **PRs curtos** (< 300 linhas de diff).  
- **Screenshots/Gravações**: incluí-los se houver alteração de UI/UX.  
- **Referência de Issue**: vincule sempre à issue no Jira.  
- **Atualização de Docs**: atualize documentação relevante sempre que alterar comportamentos.