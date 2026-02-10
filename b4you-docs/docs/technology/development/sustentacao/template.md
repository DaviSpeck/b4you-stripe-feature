---
title: Template
---

# [CONTEXTO]

> **Observação:** Substitua `[CONTEXTO]` pelo nome real (ex.: Bling, Notazz, Webhook).

---

## 1. Overview  
Descreva, em 2‑3 linhas, por que este contexto gera chamados e o impacto no negócio.

## 2. Objetivo  
Explique o que precisa ser resolvido (ex.: redisparo de payload, conciliação, ajuste de status).

## 3. Base de Dados  
| Tabela | Campo(s) crítico(s) | Observação |
|---------------------|---------------------|------------|
| `...` | `...` | `...` |

## 4. APIs / Endpoints  
| Método | Rota | Controller / Service | Uso |
|--------|------|----------------------|-----|
| `GET` / `POST` | `/v1/...` | `XController.method()` | Descrição |

## 5. Lambdas / Jobs  
| Função | Trigger | Responsabilidade |
|--------|---------|------------------|
| `lambda-[contexto]-retry` | SQS `fila-[contexto]` | Reenviar payload |

## 6. Logs & Monitoramento  
- **Log Group:** `/aws/lambda/lambda-[contexto]-retry`  
- **Dashboard Grafana/Kibana:** `<URL ou nome>`  
- **Filtros Úteis:** `ERROR`, `order_id=<ID>`  

## 7. Diagnóstico (Passo-a-Passo)  
1. Verifique mensagens mortas na fila **X**.  
2. Confira o status na tabela **Y**.  
3. Reenvie manualmente via API (`curl` abaixo).  
4. Acompanhe logs em tempo real.  

### Exemplo de cURL
```bash
curl -X POST https://api.b4you.com.br/v1/[contexto]/retry   -H "Authorization: Bearer <TOKEN>"   -d '{"id":"<ID>"}'
```

## 8. Plano de Ação  
- Ajustar policy de retry.  
- Corrigir mapeamento do campo `...` no payload.  
- Executar script SQL `scripts/[contexto]-fix.sql`.

## 9. Validação  
| Critério | Método de verificação |
|----------|-----------------------|
| API retorna `200 OK` | Postman / cURL |
| Registro atualizado em `retry_logs` | Consulta SQL |

## 10. Acesso  
| Ambiente | Credencial / Role | Observação |
|----------|-------------------|------------|
| Staging | `read_only_[contexto]` | Somente leitura |

## 11. Observações & Links  
- PRs: `#123`, `#127`  
- Ticket Jira: `BT‑XYZ`  
- Contato interno: `@nome` no Slack

---

> Siga todas as seções antes de mover o ticket para **Concluído**.