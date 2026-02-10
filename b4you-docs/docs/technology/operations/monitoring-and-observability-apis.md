---
title: "Instrumentação de APIs Node.js/Express com prom-client"
---

# Instrumentação de APIs Node.js/Express com **prom-client**

> Guia passo a passo para adicionar métricas operacionais **e** de negócio em APIs Node.js/Express usando o pacote `prom-client`.

---

## 1. Instalação

```bash
npm install prom-client
# (opcional) para variáveis de ambiente
npm install dotenv
```

---

## 2. Configuração básica

```js
// index.js ou app.js
require('dotenv').config();            // se usar .env
const express = require('express');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

// Métricas básicas do Node.js (CPU, memória, event loop)
client.collectDefaultMetrics({ timeout: 5000 });
```

---

## 3. Métricas HTTP

### 3.1 Coletores

```js
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições (s)',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 1.5, 2, 5]
});

const httpErrorsTotal = new client.Counter({
  name: 'http_errors_total',
  help: 'Total de respostas HTTP de erro (>=400)',
  labelNames: ['method', 'route', 'status_code']
});

const inFlightRequests = new client.Gauge({
  name: 'in_flight_requests',
  help: 'Requisições em processamento'
});
```

### 3.2 Middleware

```js
app.use((req, res, next) => {
  inFlightRequests.inc();
  const end = httpRequestDuration.startTimer({
    method: req.method, route: req.path
  });

  res.on('finish', () => {
    inFlightRequests.dec();
    httpRequestsTotal.labels(req.method, req.path, res.statusCode).inc();
    if (res.statusCode >= 400) {
      httpErrorsTotal.labels(req.method, req.path, res.statusCode).inc();
    }
    end({ status_code: res.statusCode });
  });

  next();
});
```

---

## 4. Métricas de Negócio (ex.: Checkout)

```js
const checkoutsStarted = new client.Counter({
  name: 'api_checkouts_started_total',
  help: 'Checkouts iniciados',
  labelNames: ['payment_method']
});

const checkoutsSucceeded = new client.Counter({
  name: 'api_checkouts_succeeded_total',
  help: 'Checkouts concluídos com sucesso',
  labelNames: ['payment_method']
});

const checkoutValue = new client.Counter({
  name: 'api_checkout_value_total',
  help: 'Valor total processado (centavos)',
  labelNames: ['payment_method']
});

app.post('/api/checkout', (req, res) => {
  const { amount, payment_method } = req.body;
  checkoutsStarted.labels(payment_method).inc();
  // ... lógica de pagamento ...
  checkoutsSucceeded.labels(payment_method).inc();
  checkoutValue.labels(payment_method).inc(amount);
  res.status(200).json({ success: true });
});
```

---

## 5. Endpoint de Métricas

```js
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
```

---

## 6. Valor Extraído

| Categoria      | Métrica                              | Insight |
|----------------|--------------------------------------|---------|
| **Operacional**| Latência (p95/p99)                   | Encontrar gargalos |
|                | Throughput (RPS)                     | Dimensionar a infra |
|                | Taxa de erros                        | Alertas rápidos |
|                | Requisições em voo                   | Detectar sobrecarga |
| **Negócio**    | Checkouts iniciados vs concluídos    | Taxa de conversão |
|                | Faturamento em tempo real            | Receita imediata |
|                | Erros no checkout                    | Abandono de carrinho |
|                | Uso de endpoints críticos            | Adoção de features |

---

## 7. Próximos Passos

1. **Personalize labels** (ex.: `user_id`, `tenant_id`, `region`).  
2. **Prometheus**: adicione `/metrics` na configuração de scrape.  
3. **Grafana**: exemplos de PromQL  
   ```promql
   # Throughput por rota
   sum(rate(http_requests_total[1m])) by (route)

   # Latência p95
   histogram_quantile(0.95,
     sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route)
   )

   # Conversão de checkout
   rate(api_checkouts_succeeded_total[5m]) /
   rate(api_checkouts_started_total[5m])
   ```
4. **Alertmanager**: configure SLOs de latência, erro e conversão.

---


## Como Testar

### 1 . Validação local

1. Clone ou acesse o repositório que contém a API.  
2. Instale dependências:  

   ```bash
   npm install
   ```

3. (Opcional) crie um arquivo `.env` com as variáveis necessárias (`PORT`, etc.).  
4. Inicie a API:  

   ```bash
   node index.js         # ou: npm run dev
   ```

5. Em outro terminal, verifique o endpoint de métricas:  

   ```bash
   curl http://localhost:3000/metrics | head
   ```

   > Deve retornar métricas do `prom-client`, como `process_cpu_user_seconds_total`.

6. Teste rotas da aplicação (`POST /api/checkout`, etc.) e observe a atualização das métricas no mesmo endpoint.

### 2 . Homologação / Staging (se aplicável)

| Ambiente | Comando / Acesso | Observação |
|-----------|-----------------|------------|
| Docker Compose | `docker compose up prometheus grafana api` | Usa arquivo `docker-compose.observability.yml`. |
| Kubernetes | `kubectl port-forward svc/prometheus 9090:9090` | Acesse `http://localhost:9090` e consulte as métricas. |
| Prometheus remoto | Acesse o alvo ``<STAGE_URL>/metrics`` via navegador ou cURL | Confirme que o status do target é **UP** em *Status → Targets*. |

---

## Observações

* **Decisões de design**  
  * End‑point `/metrics` permanece **sem autenticação**; supõe-se rede interna ou filtro via API Gateway / Ingress.  
  * Histograma de latência usa buckets padrão; ajustar conforme perfil real de tráfego depois de 7‑14 dias de dados.

* **Riscos conhecidos**  
  * **Cardinalidade alta** em `route`/`status_code` pode gerar uso extra de memória no Prometheus.  
  * Expor métricas publicamente pode revelar informações sensíveis (número de requisições, erros).

* **Dependências**  
  * Instância Prometheus com scrape interval ≤ 30 s.  
  * Grafana com datasource Prometheus configurado.  
  * Pipeline de CI precisa validar que o endpoint `/metrics` responde (health‑check adicional).


### Checklist

- [ ] `prom-client` instalado e configurado.  
- [ ] Endpoint `/metrics` acessível.  
- [ ] Prometheus coletando métricas.  
- [ ] Dashboards no Grafana criados.  
- [ ] Alertas críticos funcionando.  