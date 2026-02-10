---
title: "Grafana Dashboards - Visão Técnica × Valor de Negócio"
---

# Grafana Dashboards - Visão Técnica × Valor de Negócio

> Documentação para uso interno: descreve os cinco dashboards Prometheus/Grafana atualmente  
> disponíveis, mapeia cada gráfico a **KPIs de negócio** e aponta próximos passos  
> (métricas de negócio a serem expostas pelas APIs).

---

## 1 · cAdvisor Overview

| Painel                      | Métrica Prometheus                                                                                                              | KPI(s) Impactado(s)                                                  | Valor de Negócio                                                                 |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|----------------------------------------------------------------------------------|
| **Container CPU (%)**       | `rate(container_cpu_usage_seconds_total)`                                                                                         | • Tempo de Uptime  • Tempo de Resolução de Incidentes                | Uso de CPU alto seguido de queda de *uptime* sinaliza sobrecarga ⇒ ação preventiva. |
| **Container Memory (MiB)**  | `container_memory_usage_bytes`                                                                                                    | • Tempo de Resolução de Incidentes  • Redução de Tickets Técnicos     | Vazamentos detectados cedo evitam incidentes em produção.                        |
| **Network I/O (Bytes/s)**   | `rate(container_network_receive_bytes_total)`<br />`rate(container_network_transmit_bytes_total)`                                  | • Tempo de Uptime                                                     | Espiga de tráfego pode indicar DoS ou bug que afeta disponibilidade.             |

**Por quê**: monitora contêineres Docker da stack; garante **estabilidade operacional** ⇒ impacto direto em *Uptime* e em menos chamados técnicos.

---

## 2 · AWS ECS Overview

| Painel                     | Métrica                                                    | KPI(s)                                            | Valor de Negócio                                          |
|----------------------------|------------------------------------------------------------|---------------------------------------------------|-----------------------------------------------------------|
| **CPU Utilization (%)**    | `aws_ecs_cpuutilization_average`                           | • Tempo de Uptime  • Tempo de Resposta das APIs   | Evita esgotar CPU que degrada resposta ao cliente.         |
| **Memory Utilization (%)** | `aws_ecs_memory_utilization_average`                        | • Tempo de Uptime                                  | Memória > 90 % causa *out-of-memory* ⇒ downtime.            |

---

## 3 · AWS Lambda Overview

| Painel         | Métrica                                    | KPI(s)                                            | Valor                                                           |
|----------------|--------------------------------------------|---------------------------------------------------|-----------------------------------------------------------------|
| **Invocations**| `increase(aws_lambda_invocations_sum)`     | • Throughput (Entregas)                            | Picos inesperados → revisar dimensionamento / custos.            |
| **Errors**     | `increase(aws_lambda_errors_sum)`          | • Taxa de Erros de Transação  • Redução de Tickets Técnicos | Erros aplicacionais geram falhas de pagamento e suporte.        |
| **Duration (ms)** | `aws_lambda_duration_average`            | • Tempo de Resposta das APIs                       | Funções lentas elevam tempo de checkout e abandono.             |
| **Throttles**  | `increase(aws_lambda_throttles_sum)`       | • Tempo de Uptime                                  | Concurrency limit excedido gera 429 nas APIs.                   |

---

## 4 · AWS RDS Overview

| Painel                        | Métrica                                                       | KPI(s)                                          | Valor                                                   |
|-------------------------------|---------------------------------------------------------------|-------------------------------------------------|----------------------------------------------------------|
| **CPU Utilization (%)**       | `aws_rds_cpuutilization_average`                              | • Tempo de Uptime  • Tempo de Resolução de Incidentes | Sobreuso → lentidão global de queries.                   |
| **Database Connections**      | `aws_rds_database_connections_average`                        | • Tempo de Uptime                                | Conexões esgotadas derrubam API; prever *connection storm*. |
| **Freeable Memory (GiB)**     | `(aws_rds_freeable_memory_average) / 1024^3`                   | • Tempo de Uptime                                | Falta de memória → swap / restart involuntário do RDS.    |

---

## 5 · sixbase-api-backoffice Overview

| Painel                           | Métrica                                                                                                                       | KPI(s)                                                       | Valor                                                                                  |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------|----------------------------------------------------------------------------------------|
| **RPS**                          | `rate(http_requests_total)`                                                                                                   | • Tempo de Uptime  • Velocidade de Implementação (capacidade) | Volume serve como denominador para conversão & carga.                                  |
| **Latência p95 (s)**             | `histogram_quantile(0.95, sum by(le, route)(rate(http_request_duration_seconds_bucket)))`                                      | • Tempo de Resposta das APIs  • Velocidade de Processamento de Pagamentos | Tail-latency alta aumenta abandono de checkout.                                         |
| **Taxa de Erro (%)**             | `sum(rate(http_errors_total)) / sum(rate(http_requests_total))`                                                               | • Taxa de Erros de Transação  • NPS                         | Erros > 1 % reduzem satisfação e elevam chargeback.                                      |
| **In-flight Requests**           | `in_flight_requests`                                                                                                         | • Tempo de Resposta das APIs                                 | Fila longa indica saturação antes do SLO ser violado.                                   |
| **Códigos de Status (últimos 5m)** | `sum by(status_code)(rate(http_requests_total[5m]))`                                                                       | • Taxa de Erros de Transação                                 | Diagnóstico rápido de origem de erro (cliente × servidor).                              |
| **Segmentação (Device / OS / Browser / País / Região / Role)** | `sum by(<label>)(rate(http_requests_total[5m]))`                                                                        | • Conversão por Dispositivo / Região  • Fontes de Aquisição   | Suporta decisões de marketing e priorização de bugs específicos.                       |
| **Rotas Mais Lentas (p99)**      | `topk(10, histogram_quantile(0.99, sum by(le, route)(rate(http_request_duration_seconds_bucket[5m]))))`                       | • Tempo de Resposta das APIs                                | Foco na otimização de endpoints críticos.                                              |

---

## 6 · Próximos Passos – Métricas de Negócio (Counters nas APIs)

| KPI de Negócio                | Métrica sugerida                                                       | Tipo / Label set                                                                                                                   |
|-------------------------------|-------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| **Redução de Fraudes**        | `fraud_transactions_total{status="confirmed"}`                          | *Counter* – incrementar em cada flag de fraude.                                                                                      |
| **Chargeback %**              | `chargeback_total{reason=…}` + `successful_payments_total`               | Usar *ratio* no Grafana.                                                                                                            |
| **Reembolso %**               | `refund_total` + `sales_total`                                           | *Counter* por motivo.                                                                                                               |
| **Taxa de Conversão de Cadastro** | `signup_total` / `landing_visits_total`                              | Incluir label `source`.                                                                                                             |
| **Tempo até 1ª Ação Valiosa** | `histogram(user_time_to_first_value_seconds)`                            | Permite `histogram_quantile` p50/p95.                                                                                                |
| **DAU / MAU, Retenção, Churn** | `active_users{period="daily"}`, `active_users{period="monthly"}`, `churn_total` | Agregados diários via *CronJob* ETL → Prometheus `pushgateway`.                                                                       |

> **Implementação recomendada**: biblioteca *prom-client* já utilizada.<br />
> Criar módulo `business_metrics.ts` e expor endpoint `/metrics` único.<br />
> Atualizar dashboards adicionando novas seções “Finance & Growth”.