---
title: "Configuração de Alertas no Alertmanager"
---

# Configuração de Alertas no Alertmanager

## Descrição
Este documento descreve **como criar regras de alerta no Prometheus** e **configurar o Alertmanager** para enviar notificações (e‑mail e Slack) a partir das métricas expostas pela sua API. O objetivo é garantir visibilidade proativa de problemas, reduzir MTTR e proteger métricas de negócio críticas (checkout, faturamento).

## Requisitos
- [X] Arquivo **`config/alert.rules.yml`** contém todas as regras descritas.
- [X] Arquivo **`config/alertmanager.yml`** define receptores de e‑mail e Slack.
- [X] Prometheus carrega as regras sem erros (`Status → Rules` mostra **ACTIVE**).
- [X] Alertmanager exibe alertas quando condições são simuladas.
- [X] Notificações chegam para `ops@empresa.com` e no canal **#alertas-api** do Slack.
- [X] Inibição de *warning* funciona quando já existe alerta *critical* correspondente.

## Solução Proposta

### 1. Regras de Alerta (Prometheus)

Crie **`config/alert.rules.yml`**:

```yaml
groups:
  - name: api_alerts
    rules:

      # 1) Alta Taxa de Erros (>5 % das requisições em erro)
      - alert: HighErrorRate
        expr: |
          sum(rate(http_errors_total{route!~"/metrics"}[5m]))
          /
          sum(rate(http_requests_total{route!~"/metrics"}[5m]))
          > 0.05
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Alta taxa de erros na API ({{ $value | printf "%.2f" }})"
          description: "Mais de 5 % das requisições retornaram erro nos últimos 5 minutos."

      # 2) Latência elevada (95º percentil > 1 s)
      - alert: HighLatency95
        expr: |
          histogram_quantile(
            0.95,
            sum(rate(http_request_duration_seconds_bucket{route!~"/metrics"}[5m]))
            by (le, route)
          ) > 1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Latência 95º percentil alta"
          description: "As requisições atingiram mais de 1 s no 95º percentil."

      # 3) Queda na taxa de conversão de checkout (<70 %)
      - alert: LowConversionRate
        expr: |
          rate(api_checkouts_succeeded_total[5m])
          /
          rate(api_checkouts_started_total[5m])
          < 0.7
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Taxa de conversão de checkouts abaixo de 70 %"
          description: "Menos de 70 % dos checkouts iniciados são concluídos com sucesso."

      # 4) Queda de faturamento (< R$ 1000/min)
      - alert: LowRevenueRate
        expr: sum(rate(api_checkout_value_total[1m])) < 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Faturamento abaixo de R$ 1000/min"
          description: "O valor processado caiu abaixo de R$ 1000 por minuto."
```

### 2. Configuração do Alertmanager

Crie/edite **`config/alertmanager.yml`**:

```yaml
global:
  resolve_timeout: 5m

route:
  receiver: 'email-team'
  group_by: ['alertname', 'route']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 2h

receivers:
  - name: 'email-team'
    email_configs:
      - to: 'ops@empresa.com'
        from: 'alertmanager@empresa.com'
        smarthost: 'smtp.empresa.com:587'
        auth_username: 'alertmanager@empresa.com'
        auth_identity: 'alertmanager@empresa.com'
        auth_password: '${SMTP_PASSWORD}'
        require_tls: true

  - name: 'slack-channel'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#alertas-api'
        title: '{{ .CommonAnnotations.summary }}'
        text: '{{ range .Alerts }}*{{ .Labels.alertname }}* - {{ .Annotations.description }}\n{{ end }}'
        send_resolved: true

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'route']
```

### 3. Deploy e Reload

```bash
# Reload “quente” do Prometheus (dentro de Docker)
docker kill -s HUP $(docker ps -qf "name=prometheus")

# Reinicie Alertmanager
docker restart alertmanager
```

Verificações rápidas:

- Acesse a UI do Prometheus → **Status ▸ Rules** para confirmar que as regras estão **ACTIVE**.  
- Abra a UI do Alertmanager (`http://localhost:9093/#/alerts`) e verifique alertas ativos.  
- Confirme chegada de e‑mails e mensagens no Slack.

## Como Testar

1. **Validação local**  
   1. Gere tráfego de erro:  
      ```bash
      hey -z 2m -c 5 http://localhost:3000/rota-inexistente
      ```  
   2. Aguarde ≥ 2 min e verifique se o alerta **HighErrorRate** aparece no Alertmanager.  
   3. Aumente a latência artificialmente (ex.: `sleep(2)`) e valide **HighLatency95**.  
   4. Simule baixa conversão alterando seu endpoint de checkout para retornar erro em 40 % das tentativas; valide **LowConversionRate**.

2. **Homologação / Staging**  
   | Ambiente | Comando / Acesso | Objetivo |
   |----------|-----------------|----------|
   | Docker Compose | `docker compose up -f docker-compose.observability.yml` | Sobe Prometheus + Alertmanager + Grafana pré‑configurados |
   | Kubernetes | `kubectl port-forward svc/prometheus 9090:9090` | Acessar UI Prometheus em `http://localhost:9090` |
   | Alertmanager | `kubectl port-forward svc/alertmanager 9093:9093` | Acessar UI Alertmanager em `http://localhost:9093` |

## Observações
- **Decisões de design**  
  - `group_by: ['alertname', 'route']` reduz ruído agrupando alertas afins.  
  - *Inhibit rules* evitam notificações duplicadas de severidade diferente para o mesmo problema.

- **Riscos conhecidos**  
  - Falsos positivos se as métricas de erro forem mal instrumentadas.  
  - SMTP ou Slack fora do ar podem atrasar notificações; configurar fallback.

- **Dependências**  
  - Variáveis de ambiente **`SMTP_USER`**, **`SMTP_PASSWORD`** e **`SLACK_WEBHOOK_URL`** setadas no runtime.  
  - Prometheus ≥ v2.40 e Alertmanager compatível.