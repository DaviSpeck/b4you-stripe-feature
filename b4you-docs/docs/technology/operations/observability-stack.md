---
title: Stack de Observabilidade
---

# Stack de Observabilidade

Visão geral da stack de monitoramento, logging e tracing na B4You.

## 1. Componentes Principais
- **Prometheus**: coleta de métricas (node-exporter, cAdvisor, CloudWatch-Exporter).
- **Grafana**: visualização de dashboards e alertas.
- **Alertmanager**: roteamento e notificações (Slack/Telegram).
- **n8n**: automação de workflows (notificações, rotinas de manutenção).
- **CloudWatch-Exporter**: métricas de AWS (Lambda, ECS, RDS).
- **Blackbox-Exporter**: monitoramento de endpoints HTTP/HTTPS.

## 2. Provisionamento
- Arquivos JSON para dashboards em `/provisioning/dashboards`.
- Datasources configurados via `/provisioning/datasources`.

## 3. Scrape Configurações
- `prometheus.yml`:
  - scrape_configs para node-exporter, cAdvisor, blackbox-exporter.
  - job AWS com CloudWatch-Exporter.
- `alert.rules.yml`:
  - Alerta de CPU > 80%, latência alta e erros 5xx.
  - Healthchecks de n8n e endpoints críticos.

## 4. Alertas e Notificações
- Roteamento por gravidade:
  - P1/P2 → Slack #alerts, SMS (Telegram).
  - P3/P4 → e-mail.
- Group_wait: 30s, Repeat_interval: 1h.
- Exemplo de alerta:
  ```yaml
  - alert: HighCPU
    expr: node_cpu_seconds_total{mode="idle"} < 20
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "CPU alta no host {{ $labels.instance }}"
  ```

## 5. Próximos Passos
- Instrumentar OpenTelemetry para tracing distribuído.
- Configurar dashboards por serviço personalizado.
- Definir alertas de erro em APIs (4xx e 5xx).
