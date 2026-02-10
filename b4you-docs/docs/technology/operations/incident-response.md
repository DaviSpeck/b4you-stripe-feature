---
title: Resposta a Incidentes
---

# Resposta a Incidentes

Este documento descreve o fluxo de tratamento de incidentes em produção.

## 1. Detecção
- Monitorar alertas no Grafana e notificações do Alertmanager.
- Logs de erro críticos no CloudWatch.

## 2. Triage
1. **Classificação**: severidade (P1 a P4).
2. **Escalonamento**: notificar time de SRE e responsável de serviço.
3. **Comunicação Inicial**: abrir canal no Slack (#incidents) e atualizar status no Jira.

## 3. Contenção
- Trade-off entre disponibilidade e correção.
- Actions:
  - Rolar *hotfix* urgente.
  - Desabilitar feature problemático via feature flag.

## 4. Erradicação
- Identificar causa raiz (logs, traces).
- Aplicar correções no código/infrastructure.
- Testar em ambiente de staging antes de deploy.

## 5. Recuperação
- Deploy da correção em produção.
- Verificar saúde do sistema (endpoints /health).

## 6. Revisão Pós-Incidente
- Gerar post-mortem no Confluence/Jira:
  - Linha do tempo do incidente.
  - Causas e impactos.
  - Ações preventivas.
- Compartilhar aprendizado com o time.
